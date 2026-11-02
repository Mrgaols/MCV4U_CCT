// Export a lesson from headless Chrome, frame by frame.
//
//   node videos/tools/render.mjs alan --stills 12,45.5,90 --out /tmp/shots
//       saves PNG stills at those lesson times (seconds)
//   node videos/tools/render.mjs alan --video videos/exports/alan-technical-preview.mp4 [--fps 30]
//       renders every frame and pipes it to encode.swift, which writes an H.264 MP4
//
// How it works: Chrome opens <lesson>/index.html?export=1 at exactly 1920 x 1080.
// For each frame we call lesson.seek(t), which draws the frame for time t, then
// read the canvas back. Because every scene is a pure function of t, frame n is
// always t = n / fps; nothing depends on how fast this machine is.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const lessonName = args[0];
const opt = (name, fallback) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : fallback; };
if (!['alan', 'jeff'].includes(lessonName)) {
  console.error('usage: node videos/tools/render.mjs alan|jeff (--stills t1,t2 --out dir | --video file.mp4 [--fps 30] [--from s] [--to s])');
  process.exit(1);
}

const page = pathToFileURL(resolve(here, '..', lessonName, 'index.html')).href + '?export=1' + (opt('watermark') === '0' ? '&watermark=0' : '');

// Minimal Chrome DevTools Protocol client over the WebSocket built into Node.
async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'cct-chrome-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile,
    '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1920,1080', '--allow-file-access-from-files', 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((ok, fail) => {
    let buf = '';
    chrome.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) ok(m[1]);
    });
    chrome.on('exit', () => fail(new Error('Chrome exited before DevTools was ready:\n' + buf)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((ok) => ws.addEventListener('open', ok, { once: true }));
  let id = 0;
  const waiting = new Map();
  const listeners = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && waiting.has(msg.id)) {
      const { ok, fail } = waiting.get(msg.id);
      waiting.delete(msg.id);
      if (msg.error) fail(new Error(msg.error.message)); else ok(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
    const mid = ++id;
    waiting.set(mid, { ok, fail });
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });
  const close = async () => {
    ws.close();
    const exited = new Promise((ok) => chrome.once('exit', ok));
    chrome.kill();
    await exited;
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  };
  return { send, listeners, close };
}

async function openLesson(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => cdp.send(m, p, sessionId);
  await s('Page.enable');
  await s('Runtime.enable');
  const errors = [];
  cdp.listeners.push((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map((a) => a.value || a.description).join(' '));
  });
  await s('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  const loaded = new Promise((ok) => cdp.listeners.push((msg) => { if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') ok(); }));
  await s('Page.navigate', { url: page });
  await loaded;
  const evaluate = async (expression) => {
    const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await evaluate('document.fonts.ready.then(() => true)');
  const duration = await evaluate('window.lesson.duration');
  // Read the canvas back as JPEG (stills use PNG). The canvas is exactly 1920 x 1080 in export mode.
  const frame = async (t, type) => {
    const url = await evaluate(`(lesson.seek(${t}), document.querySelector('canvas').toDataURL('${type}', 0.92))`);
    return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  };
  return { duration, frame, errors, evaluate };
}

const cdp = await launch();
try {
  const lesson = await openLesson(cdp);
  const size = await lesson.evaluate("[document.querySelector('canvas').width, document.querySelector('canvas').height]");
  console.log(`${lessonName}: timeline ${lesson.duration.toFixed(2)} s, canvas ${size[0]}x${size[1]}`);

  if (opt('stills')) {
    const out = resolve(opt('out', '.'));
    mkdirSync(out, { recursive: true });
    for (const t of opt('stills').split(',').map(Number)) {
      const file = join(out, `${lessonName}-${t.toFixed(2).padStart(7, '0')}.png`);
      writeFileSync(file, await lesson.frame(t, 'image/png'));
      console.log('still', file);
    }
  } else if (opt('video')) {
    const fps = Number(opt('fps', 30));
    const from = Number(opt('from', 0));
    const to = Math.min(Number(opt('to', lesson.duration)), lesson.duration);
    const out = resolve(opt('video'));
    mkdirSync(dirname(out), { recursive: true });
    const bin = join(tmpdir(), 'cct-encode');
    const src = join(here, 'encode.swift');
    if (!existsSync(bin)) execFileSync('swiftc', ['-O', src, '-o', bin], { stdio: 'inherit' });
    const enc = spawn(bin, [out, String(fps), '1920', '1080'], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((ok, fail) => enc.on('exit', (code) => (code === 0 ? ok() : fail(new Error('encoder exited with ' + code)))));
    // Frame n shows lesson time from + n / fps. Each frame is sent as [4-byte length][JPEG bytes].
    const frames = Math.round((to - from) * fps);
    const started = Date.now();
    for (let n = 0; n < frames; n++) {
      const jpg = await lesson.frame(from + n / fps, 'image/jpeg');
      const head = Buffer.alloc(4);
      head.writeUInt32BE(jpg.length);
      if (!enc.stdin.write(Buffer.concat([head, jpg]))) await new Promise((ok) => enc.stdin.once('drain', ok));
      if (n % (fps * 10) === 0) {
        const rate = (n + 1) / ((Date.now() - started) / 1000);
        process.stdout.write(`frame ${n}/${frames}  (${rate.toFixed(1)} frames/s, about ${Math.round((frames - n) / rate)} s left)\n`);
      }
    }
    enc.stdin.end();
    await done;
    console.log(`rendered ${frames} frames in ${((Date.now() - started) / 1000).toFixed(0)} s`);
  }
  if (lesson.errors.length) {
    console.error('Errors reported by the page:\n' + [...new Set(lesson.errors)].join('\n'));
    process.exitCode = 2;
  }
} finally {
  await cdp.close();
}
