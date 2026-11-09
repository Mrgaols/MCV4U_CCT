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

const page = process.env.CCT_SITE_URL || pathToFileURL(resolve(here, '../../index.html')).href;

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
  await s('Network.setBlockedURLs',{urls:['https://*']});
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
  const duration = 0;
  // Read the canvas back as JPEG (stills use PNG). The canvas is exactly 1920 x 1080 in export mode.
  const frame = async (t, type) => {
    const url = await evaluate(`(lesson.seek(${t}), document.querySelector('canvas').toDataURL('${type}', 0.92))`);
    return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  };
  return { duration, frame, errors, evaluate, send: s };
}

const cdp = await launch();
try {
  const site=await openLesson(cdp);
  const summary=await site.evaluate(`(() => {
    const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
    return {
      title:document.title,
      solutions:document.querySelectorAll('details.solution').length,
      videos:document.querySelectorAll('video').length,
      navigationErrors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
      duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),
      finalQ10Fixed:document.getElementById('final').textContent.includes('sufficient test'),
      videoNotes:[...document.querySelectorAll('.video-note')].map(x=>x.textContent),
      figures:document.querySelectorAll('figure').length
    };
  })()`);
  summary.servedUrl = page;
  summary.chapterSeeking = [];
  for (const who of ['alan','jeff']) {
    const result=await site.evaluate(`(async()=>{
      const video=document.getElementById('player-${who}');
      const link=[...document.querySelectorAll('[data-video="player-${who}"][data-time]')].find(link=>Number(link.dataset.time)>0);
      const expected=Number(link.dataset.time);
      const seeked=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Chapter seek timed out')),10000);video.addEventListener('seeked',()=>{clearTimeout(timer);resolve();},{once:true});});
      link.click();await seeked;video.pause();
      if(Math.abs(video.currentTime-expected)>1)throw new Error('Chapter did not seek');
      const result={presenter:'${who}',expected,actual:video.currentTime,passed:true};video.currentTime=0;return result;
    })()`);
    summary.chapterSeeking.push(result);
  }
  if(summary.solutions!==43 || summary.videos!==2 || summary.navigationErrors.length || summary.duplicateIds.length || !summary.finalQ10Fixed) throw new Error(JSON.stringify(summary));
  await site.evaluate(`document.querySelector('input[name=check1][value="0"]').checked=true;gradeCheck('check1',0);true`);
  summary.quizCorrect=await site.evaluate(`document.getElementById('check1-result').textContent`);
  await site.evaluate(`document.querySelector('input[name=check1][value="1"]').checked=true;gradeCheck('check1',0);true`);
  summary.quizIncorrect=await site.evaluate(`document.getElementById('check1-result').textContent`);
  await site.evaluate(`document.querySelectorAll('input[type=radio]').forEach(i=>i.checked=false);document.getElementById('check1-result').textContent='';document.getElementById('check1-explain').hidden=true;true`);
  for(const width of [1440,390]) {
    await site.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});
    const scroll=await site.evaluate('document.documentElement.scrollWidth');
    summary['viewport'+width]={scrollWidth:scroll,pass:scroll<=width};
    if(scroll>width) throw new Error('Horizontal page overflow '+width+' / '+scroll);
  }
  await site.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  const screenshots=resolve(here,'../verification/site');mkdirSync(screenshots,{recursive:true});
  const shot=await site.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(join(screenshots,'homepage.png'),Buffer.from(shot.data,'base64'));
  await site.evaluate(`document.documentElement.style.scrollBehavior='auto';document.getElementById('videos').scrollIntoView({behavior:'instant'});new Promise(r=>requestAnimationFrame(()=>r(true)))`);
  const videoShot=await site.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(join(screenshots,'video-lessons.png'),Buffer.from(videoShot.data,'base64'));
  summary.media=await site.evaluate(`(async () => {
    const out=[];
    for (const video of document.querySelectorAll('video')) {
      await new Promise((resolve,reject)=>{
        if(video.readyState>=1) return resolve();
        const timer=setTimeout(()=>reject(new Error('Video metadata timeout: '+video.currentSrc)),10000);
        video.addEventListener('loadedmetadata',()=>{clearTimeout(timer);resolve();},{once:true});
        video.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Video failed: '+video.currentSrc));},{once:true});
        video.load();
      });
      if(video.duration<480 || video.videoWidth!==1920 || video.videoHeight!==1080) throw new Error('Unexpected video metadata');
      video.muted=true;
      await video.play(); await new Promise(r=>setTimeout(r,250)); video.pause();
      if(video.currentTime<=0) throw new Error('Video did not advance');
      out.push({src:video.getAttribute('aria-label'),duration:video.duration,width:video.videoWidth,height:video.videoHeight,playback:true});
      video.currentTime=0;
    }
    return out;
  })()`);
  // Capture after metadata/playback checks, so transient loading indicators are gone.
  await site.evaluate(`new Promise(r=>setTimeout(r,250))`);
  const readyShot=await site.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(join(screenshots,'video-lessons.png'),Buffer.from(readyShot.data,'base64'));
  await site.evaluate(`document.querySelectorAll('details').forEach(x=>x.open=true);true`);
  await site.send('Emulation.setEmulatedMedia',{media:'print'});
  if (!process.argv.includes('--no-pdf')) {
  const pdf=await site.send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#555">MCV4U CCT · Alan and Jeff · <span class="pageNumber"></span> / <span class="totalPages"></span></div>'});
  writeFileSync(resolve(here,'../../MCV4U-CCT-website.pdf'),Buffer.from(pdf.data,'base64'));
  }
  summary.errors=site.errors;
  if(site.errors.length) throw new Error(JSON.stringify(site.errors));
  await site.send('Emulation.setScriptExecutionDisabled',{value:true});
  await site.send('Page.navigate',{url:page});
  await new Promise(r=>setTimeout(r,700));
  summary.withoutJavaScript=await site.evaluate(`({players:document.querySelectorAll('video[controls] source').length,videoCount:document.getElementById('video-stat')?.textContent,solutionCount:document.querySelectorAll('details.solution').length})`);
  if(summary.withoutJavaScript.players!==2 || summary.withoutJavaScript.solutionCount!==43)throw new Error('Static HTML fallback incomplete');
  writeFileSync(join(screenshots,'result.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify(summary));
} finally {await cdp.close();}
