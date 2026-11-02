// The player: one 1920 x 1080 canvas, a clock and the controls under it.
//
// Each animation frame the player
//   1. works out the lesson time t from the clock (never by adding up frame times,
//      so values cannot drift),
//   2. finds which scene and beat t falls in (timeline.js),
//   3. clears the canvas and calls that scene's draw(ctx, s).
// During the first FADE seconds of a scene the last frame of the previous scene
// is laid on top and faded out, which gives a cross-fade.
//
// URL options: ?t=93  ?scene=secant  ?presenter=1  ?speed=1.5  ?export=1
// Keys: Space play/pause, ← → beats, [ ] scenes, Home restart,
//       P presenter mode, D diagnostics, H hide controls, F full screen.
(function (root) {
  'use strict';

  const { timeline: TL, theme, draw: D } = root.CCT;
  const C = theme.color;
  const W = theme.stage.w;
  const H = theme.stage.h;
  const FADE = 0.6;

  const mmss = (t) => {
    const s = Math.max(0, Math.floor(t + 1e-6));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  function createPlayer(cfg) {
    const tl = TL.build(cfg.scenes, cfg.timing);
    const params = new URLSearchParams(location.search);
    const exportMode = params.get('export') === '1';

    const state = {
      t: 0,
      playing: false,
      speed: Number(params.get('speed')) || 1,
      presenter: params.get('presenter') === '1',
      diag: params.get('diag') === '1',
      anchorT: 0,
      anchorWall: 0,
      fps: 0,
    };
    if (params.has('t')) state.t = TL.clampTime(tl, Number(params.get('t')) || 0);
    if (params.has('scene')) {
      const s = tl.scenes.find((x) => x.id === params.get('scene'));
      if (s) state.t = s.start;
    }

    document.title = cfg.title + ' | MCV4U Topic C';
    document.body.classList.toggle('export', exportMode);
    const app = cfg.mount;
    app.innerHTML = `
      <div class="stage-wrap"><canvas class="stage" aria-label="${cfg.title}: animated lesson"></canvas></div>
      <div class="controls" role="group" aria-label="Playback controls">
        <button class="btn primary" data-act="play" aria-label="Play">Play</button>
        <button class="btn" data-act="restart" aria-label="Restart from the beginning">Restart</button>
        <button class="btn" data-act="prev" aria-label="Previous beat">◀ Beat</button>
        <button class="btn" data-act="next" aria-label="Next beat">Beat ▶</button>
        <span class="time" aria-live="off"><span data-el="now">00:00</span> / ${mmss(tl.duration)}</span>
        <div class="scrub">
          <input type="range" min="0" max="${tl.duration}" step="0.01" value="0" aria-label="Seek">
          <div class="ticks">${tl.scenes.map((s) => `<i style="left:${(s.start / tl.duration) * 100}%" title="${s.index + 1}. ${s.title}"></i>`).join('')}</div>
        </div>
        <label class="field">Scene
          <select data-el="scene">${tl.scenes.map((s) => `<option value="${s.id}">${s.index + 1}. ${s.title} (${mmss(s.start)})</option>`).join('')}</select>
        </label>
        <label class="field">Speed
          <select data-el="speed">${[0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => `<option value="${v}"${v === state.speed ? ' selected' : ''}>${v}×</option>`).join('')}</select>
        </label>
        <label class="toggle"><input type="checkbox" data-el="presenter"${state.presenter ? ' checked' : ''}> Presenter mode</label>
        <label class="toggle"><input type="checkbox" data-el="diag"${state.diag ? ' checked' : ''}> Diagnostics</label>
        <span class="status" data-el="status"></span>
      </div>
      <p class="hint">Space play/pause · ← → beat · [ ] scene · P presenter · D diagnostics · H hide controls · F full screen</p>`;

    const canvas = app.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const el = (name) => app.querySelector(`[data-el="${name}"]`);
    const range = app.querySelector('input[type=range]');
    const playBtn = app.querySelector('[data-act="play"]');
    let snapshot = { index: -1, canvas: null, width: 0 };

    // Canvas pixels = CSS size × devicePixelRatio, so lines stay sharp;
    // the drawing code always works in 1920 x 1080 stage units.
    function fit() {
      const cssW = canvas.clientWidth || W;
      const ratio = exportMode ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(cssW * ratio);
      const ph = Math.round(pw * H / W);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        snapshot = { index: -1, canvas: null, width: 0 };
      }
    }

    function drawScene(target, t) {
      const s = TL.sceneState(tl, t);
      const scene = tl.scenes.find((x) => x.id === s.scene);
      target.save();
      target.fillStyle = C.canvas;
      target.fillRect(0, 0, W, H);
      try {
        scene.def.draw(target, s, scene);
      } catch (err) {
        // Show mistakes on screen as well as in the console, so edits are easy to debug.
        console.error(err);
        target.restore();
        target.save();
        D.card(target, 96, 420, 1728, 240, { fill: '#fff5f5', border: C.error });
        D.text(target, 'Error in scene "' + scene.id + '": ' + err.message, 140, 520, { size: 32, color: C.error, weight: 600 });
        D.text(target, 'See the browser console for the line number.', 140, 580, { size: 28, color: C.steel });
      }
      target.restore();
      chrome(target, scene, s);
      return { s, scene };
    }

    // Header and progress line drawn on every frame.
    function chrome(target, scene, s) {
      D.text(target, cfg.header, theme.stage.left, 60, { size: 28, weight: 500, color: C.steel });
      D.text(target, 'Scene ' + (scene.index + 1) + ' / ' + tl.scenes.length, theme.stage.right, 60, { size: 28, weight: 500, color: C.steel, align: 'right' });
      target.fillStyle = C.hairlineSoft;
      target.fillRect(0, H - 6, W, 6);
      target.fillStyle = C.slate;
      target.fillRect(0, H - 6, W * (s.global / tl.duration), 6);
    }

    function render(t) {
      fit();
      const k = canvas.width / W;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      const { s, scene } = drawScene(ctx, t);

      if (scene.index > 0 && s.t < FADE) {
        if (snapshot.index !== scene.index - 1 || snapshot.width !== canvas.width) {
          const off = document.createElement('canvas');
          off.width = canvas.width;
          off.height = canvas.height;
          const octx = off.getContext('2d');
          octx.setTransform(k, 0, 0, k, 0, 0);
          drawScene(octx, scene.start - 1e-4);
          snapshot = { index: scene.index - 1, canvas: off, width: canvas.width };
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1 - D.ease(s.t / FADE);
        ctx.drawImage(snapshot.canvas, 0, 0);
        ctx.restore();
        ctx.setTransform(k, 0, 0, k, 0, 0);
      }

      if (exportMode && params.get('watermark') !== '0') {
        D.pill(ctx, 'TECHNICAL PREVIEW — NOT FINAL STUDENT NARRATION', W / 2, 1036, { size: 28, weight: 600, bg: 'rgba(10, 10, 10, 0.78)', color: C.canvas, align: 'center' });
      }
      if (state.diag) diagnostics(s, scene);
      updateControls(s, scene);
    }

    function diagnostics(s, scene) {
      ctx.save();
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = C.error;
      ctx.lineWidth = 2;
      const g = theme.stage;
      ctx.strokeRect(g.left, g.top, g.right - g.left, g.bottom - g.top);
      ctx.restore();
      const beat = scene.beats.find((b) => b.id === s.beat);
      const line = 't ' + s.global.toFixed(2) + ' s · ' + scene.id + ' (' + (scene.index + 1) + '/' + tl.scenes.length + ') · beat ' + s.beat + ' ' +
        Math.round(s.p(s.beat) * 100) + '% of ' + beat.dur + ' s · scene time ' + s.t.toFixed(2) + ' s · ' + state.fps + ' fps';
      D.pill(ctx, line, W / 2, 1036, { size: 28, mono: true, bg: 'rgba(10, 10, 10, 0.82)', color: C.canvas, align: 'center' });
    }

    function updateControls(s, scene) {
      if (exportMode) return;
      el('now').textContent = mmss(s.global);
      if (document.activeElement !== range) range.value = s.global;
      el('scene').value = scene.id;
      playBtn.textContent = state.playing ? 'Pause' : 'Play';
      playBtn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
      el('status').textContent = state.presenter && !state.playing ? 'Waiting: press → or Space' : '';
    }

    function seek(t) {
      state.t = TL.clampTime(tl, t);
      state.anchorT = state.t;
      state.anchorWall = performance.now();
      render(state.t);
    }

    function setPlaying(on) {
      if (on && state.t >= tl.duration - 1e-6) state.t = 0;
      state.playing = on;
      state.anchorT = state.t;
      state.anchorWall = performance.now();
      render(state.t);
    }

    let last = performance.now();
    function frame(now) {
      state.fps = Math.round(1000 / Math.max(1, now - last));
      last = now;
      if (state.playing) {
        // Time comes from the wall clock since the last anchor, not from summing frames.
        let t = state.anchorT + (now - state.anchorWall) / 1000 * state.speed;
        if (state.presenter) {
          const c = TL.presenterClamp(tl, state.t, t);
          if (c.hit) { state.t = c.t; setPlaying(false); requestAnimationFrame(frame); return; }
        }
        if (t >= tl.duration) { t = tl.duration; state.playing = false; }
        state.t = t;
        render(t);
      }
      requestAnimationFrame(frame);
    }

    // In presenter mode, "next" plays the next beat; otherwise it jumps to it.
    function next() {
      if (state.presenter) { setPlaying(true); return; }
      seek(TL.nextStop(tl, state.t));
    }
    function prev() { seek(TL.prevStop(tl, state.t)); }
    function sceneJump(dir) {
      const i = TL.locate(tl, state.t).scene.index;
      const local = state.t - tl.scenes[i].start;
      const target = dir < 0 && local > 1 ? i : i + dir;
      const s = tl.scenes[Math.min(Math.max(target, 0), tl.scenes.length - 1)];
      seek(s.start);
    }

    app.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      ({ play: () => setPlaying(!state.playing), restart: () => { setPlaying(false); seek(0); }, prev, next })[act.dataset.act]();
    });
    range.addEventListener('input', () => seek(Number(range.value)));
    el('scene').addEventListener('change', (e) => seek(tl.scenes.find((s) => s.id === e.target.value).start));
    el('speed').addEventListener('change', (e) => { state.speed = Number(e.target.value); setPlaying(state.playing); });
    el('presenter').addEventListener('change', (e) => { state.presenter = e.target.checked; render(state.t); });
    el('diag').addEventListener('change', (e) => { state.diag = e.target.checked; render(state.t); });
    window.addEventListener('resize', () => render(state.t));
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === ' ') { e.preventDefault(); setPlaying(!state.playing); }
      else if (k === 'ArrowRight') { e.preventDefault(); next(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (k === ']') sceneJump(1);
      else if (k === '[') sceneJump(-1);
      else if (k === 'Home') { setPlaying(false); seek(0); }
      else if (k === 'p' || k === 'P') { state.presenter = !state.presenter; el('presenter').checked = state.presenter; render(state.t); }
      else if (k === 'd' || k === 'D') { state.diag = !state.diag; el('diag').checked = state.diag; render(state.t); }
      else if (k === 'h' || k === 'H') document.body.classList.toggle('clean');
      else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else app.querySelector('.stage-wrap').requestFullscreen(); }
    });

    // Hooks used by tools/render.mjs to export frames.
    root.lesson = { duration: tl.duration, timeline: tl, seek, render };
    seek(state.t);
    requestAnimationFrame(frame);
    if (params.get('autoplay') === '1') setPlaying(true);
    return root.lesson;
  }

  root.CCT.createPlayer = createPlayer;
})(typeof globalThis !== 'undefined' ? globalThis : this);
