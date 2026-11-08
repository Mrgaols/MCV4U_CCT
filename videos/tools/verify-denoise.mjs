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
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const candidates = process.platform === 'win32'
  ? ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
  : process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
  : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const CHROME = process.env.CHROME || candidates.find(existsSync);
if (!CHROME) throw new Error('Browser not found. Set CHROME to your Chrome or Edge executable.');

const page = pathToFileURL(resolve(here, '../../denoise-review.html')).href;

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
    chrome.on('error', fail);
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
    if (dirname(resolve(profile)) !== resolve(tmpdir()) || !profile.split(/[\\/]/).pop().startsWith('cct-chrome-')) throw new Error('Unexpected temporary profile path');
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
  await s('Network.enable');
  await s('Network.setBlockedURLs',{urls:['https://*','http://*']});
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
    const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await evaluate('document.fonts.ready.then(() => true)');
  const duration = 0;
  // Read the canvas back as JPEG (stills use PNG). The canvas is exactly 1920 x 1080 in export mode.
  const frame = async (t, type) => {
    const url = await evaluate(`(lesson.seek(${t}), document.querySelector('canvas').toDataURL('${type}', 0.92))`);
    return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  };
  return { duration, frame, errors, evaluate, send: s };
}

const cdp=await launch();
try {
 const p=await openLesson(cdp);
 const summary=await p.evaluate(`(async()=>{
  const media=[];
  for(const m of document.querySelectorAll('audio,video')){
   m.muted=true;
   if(m.readyState<1)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('metadata timeout')),10000);m.addEventListener('loadedmetadata',()=>{clearTimeout(timer);resolve();},{once:true});m.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('media error'));},{once:true});m.load();});
   media.push({id:m.id,duration:m.duration});
  }
  return {media};
 })()`);
 if(summary.media.length!==3 || Math.abs(summary.media[0].duration-20)>.1 || Math.abs(summary.media[1].duration-20)>.1)throw new Error('Bad media '+JSON.stringify(summary));
 await p.evaluate(`(async()=>{before.currentTime=3;await before.play();await new Promise(r=>setTimeout(r,200));return true;})()`);
 await p.evaluate(`document.getElementById('to-after').click();new Promise(r=>setTimeout(r,300))`);
 summary.afterSwitch=await p.evaluate(`({beforePaused:before.paused,afterPlaying:!after.paused,time:after.currentTime})`);
 if(!summary.afterSwitch.beforePaused || !summary.afterSwitch.afterPlaying || Math.abs(summary.afterSwitch.time-3)>.8)throw new Error('Switch failed');
 await p.evaluate(`document.getElementById('to-before').click();new Promise(r=>setTimeout(r,200))`);
 summary.beforeSwitch=await p.evaluate(`({afterPaused:after.paused,beforePlaying:!before.paused,time:before.currentTime})`);
 if(!summary.beforeSwitch.afterPaused || !summary.beforeSwitch.beforePlaying)throw new Error('Reverse switch failed');
 await p.evaluate('before.pause();after.pause();before.currentTime=0;after.currentTime=0;true');
 for(const width of [1440,390]){await p.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});const actual=await p.evaluate('document.documentElement.scrollWidth');summary['width'+width]=actual;if(actual>width)throw new Error('Page overflows');}
 await p.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
 const shot=await p.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 const out=resolve(here,'../verification/denoise-review');mkdirSync(out,{recursive:true});writeFileSync(join(out,'page.png'),Buffer.from(shot.data,'base64'));
 summary.errors=p.errors;if(p.errors.length)throw new Error(JSON.stringify(p.errors));writeFileSync(join(out,'result.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
} finally {await cdp.close();}
