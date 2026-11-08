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

const args = process.argv.slice(2);
const lessonName = args[0];
const opt = (name, fallback) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : fallback; };
if (!['alan', 'jeff'].includes(lessonName)) {
  console.error('usage: node videos/tools/render.mjs alan|jeff (--stills t1,t2 --out dir | --video file.mp4 [--fps 30] [--from s] [--to s])');
  process.exit(1);
}

const page = pathToFileURL(resolve(here, '..', lessonName, 'index.html')).href + '?audit=1&speed=-1' + (opt('narration') === '1' ? '&narration=1' : '') + (opt('watermark') === '0' ? '&watermark=0' : '');

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
  return { duration, frame, errors, evaluate, send: s };
}

const cdp = await launch();
try {
  const l = await openLesson(cdp);
  const assert = (ok,message) => {if(!ok) throw new Error(message);};
  // The UI slider has a 0.01 s step; measured 30 fps cue boundaries need a 0.005 s rounding tolerance.
  const controls=[];
  assert(await l.evaluate(`document.querySelector('[data-el="speed"]').value==='1'`),'Invalid URL speed must fall back to visible 1x speed'); controls.push('invalid URL speed falls back to 1x');
  await l.evaluate(`document.body.classList.remove('export'); lesson.seek(0); document.querySelector('[data-act="play"]').click(); new Promise(r=>setTimeout(r,160));`);
  const moved=await l.evaluate(`document.querySelector('[data-act="play"]').click(); Number(document.querySelector('input[type=range]').value)`);
  assert(moved>0 && moved<2,'Play must advance and Pause must stop'); controls.push('play/pause advances clock');
  await l.evaluate(`document.querySelector('[data-act="restart"]').click(); document.querySelector('input[type=range]').focus();`);
  await l.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await l.send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  const slider=await l.evaluate(`Number(document.querySelector('input[type=range]').value)`);
  assert(slider>0 && slider<0.1,'Focused slider arrow should increment, not skip a beat'); controls.push('native slider keyboard');
  await l.evaluate(`document.querySelector('[data-el="presenter"]').focus()`);
  await l.send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
  await l.send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
  assert(await l.evaluate(`document.querySelector('[data-el="presenter"]').checked && document.querySelector('[data-act="play"]').textContent==='Play'`),'Checkbox Space must not also play'); controls.push('native checkbox keyboard');
  await l.evaluate(`document.querySelector('[data-el="presenter"]').click(); document.activeElement.blur(); document.querySelector('[data-act="restart"]').click(); document.querySelector('[data-act="next"]').click();`);
  assert(await l.evaluate(`Math.abs(Number(document.querySelector('input[type=range]').value)-lesson.timeline.scenes[0].beats[0].dur)<=0.00501`),'Next beat must seek'); controls.push('next beat');
  await l.evaluate(`const sel=document.querySelector('[data-el="scene"]'); sel.value=lesson.timeline.scenes[1].id; sel.dispatchEvent(new Event('change'));`);
  assert(await l.evaluate(`Math.abs(Number(document.querySelector('input[type=range]').value)-lesson.timeline.scenes[1].start)<=0.00501`),'Scene selector must seek'); controls.push('scene select');
  await l.evaluate(`document.querySelector('[data-act="restart"]').click(); const check=document.querySelector('[data-el="presenter"]'); if(!check.checked) check.click(); const speed=document.querySelector('[data-el="speed"]'); speed.value='2'; speed.dispatchEvent(new Event('change')); lesson.seek(lesson.timeline.scenes[0].beats[0].end-0.05); document.querySelector('[data-act="play"]').click(); new Promise(r=>setTimeout(r,220));`);
  assert(await l.evaluate(`document.querySelector('[data-act="play"]').textContent==='Play' && Math.abs(Number(document.querySelector('input[type=range]').value)-lesson.timeline.scenes[0].beats[0].end)<=0.00501`),'Presenter mode must pause at boundary'); controls.push('presenter stops at beat boundary');
  await l.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert(await l.evaluate(`document.documentElement.scrollWidth<=390`),'Mobile page must fit viewport'); controls.push('390px page fits viewport (video text still needs landscape/fullscreen)');
  await l.send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await l.evaluate(`document.body.classList.add('export'); document.querySelector('[data-act="restart"]').click();`);
  await l.evaluate(`window.overflows=[]; const old=CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){const m=this.measureText(text); if(this.globalAlpha>0.1 && (x<0 || x+m.width>1920 || y>1080 || y<0)) window.overflows.push({text,x,y,width:m.width,t:window.auditTime}); return old.call(this,text,x,y,...rest);};`);
  const timeline = await l.evaluate('lesson.timeline.scenes.map(s=>({id:s.id,start:s.start,end:s.end,beats:s.beats}))');
  const out=resolve(here,'../verification',lessonName + (opt('narration') === '1' ? '-narrated' : '')); mkdirSync(out,{recursive:true});
  let frames=0;
  for (const scene of timeline) {
    for (const b of scene.beats) for(const p of [0.02,0.5,0.98]) { const t=scene.start+b.start+b.dur*p; await l.evaluate(`(window.auditTime=${t},lesson.seek(${t}),true)`); frames++; }
    const t=scene.end-0.05;
    writeFileSync(join(out,scene.id+'.png'),await l.frame(t,'image/png'));
  }
  const overflow=await l.evaluate('window.overflows');
  writeFileSync(join(out,'result.json'),JSON.stringify({duration:l.duration,frames,scenes:timeline.length,controls,errors:l.errors,overflow},null,2));
  console.log(JSON.stringify({duration:l.duration,frames,scenes:timeline.length,controls,errors:l.errors,overflow}));
} finally {await cdp.close();}
