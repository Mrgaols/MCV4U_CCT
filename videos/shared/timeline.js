// Timeline: turns the beat lengths in timing.js into absolute times.
//
// Every animation is a pure function of time. A scene never stores what it
// drew last frame; it asks "how far through beat X am I?" and draws that.
// This is why seeking, scrubbing and exporting always give the same picture.
(function (root) {
  'use strict';

  const EPS = 1e-9;

  // scenes: { id: { title, draw } }, timing: [{ scene: id, beats: { beatId: seconds } }]
  function build(scenes, timing) {
    let t = 0;
    const out = timing.map((entry, index) => {
      const def = scenes[entry.scene];
      if (!def) throw new Error('timing.js entry ' + (index + 1) + ': no scene named "' + entry.scene + '" in scenes.js');
      const start = t;
      const beats = Object.entries(entry.beats).map(([id, dur]) => {
        if (!(dur > 0)) throw new Error('beat ' + entry.scene + '.' + id + ' must last more than 0 s');
        const beat = { id, start: t - start, end: t - start + dur, dur };
        t += dur;
        return beat;
      });
      return { id: entry.scene, index, title: def.title || entry.scene, def, start, end: t, dur: t - start, beats };
    });
    return { scenes: out, duration: t };
  }

  function clampTime(tl, t) {
    return Math.min(Math.max(t, 0), tl.duration);
  }

  function locate(tl, t) {
    t = clampTime(tl, t);
    let scene = tl.scenes[tl.scenes.length - 1];
    for (const s of tl.scenes) {
      if (t < s.end - EPS) { scene = s; break; }
    }
    const local = t - scene.start;
    let beat = scene.beats[scene.beats.length - 1];
    for (const b of scene.beats) {
      if (local < b.end - EPS) { beat = b; break; }
    }
    return { t, scene, beat, local };
  }

  // What a scene's draw() receives. p() is linear progress 0..1 through a beat,
  // optionally through only part of it: p('fold', 0.5, 1) runs over its second half.
  function sceneState(tl, t) {
    const at = locate(tl, t);
    const byId = {};
    for (const b of at.scene.beats) byId[b.id] = b;
    const get = (id) => {
      const b = byId[id];
      if (!b) throw new Error('scene "' + at.scene.id + '" has no beat "' + id + '"');
      return b;
    };
    const s = {
      t: at.local,
      dur: at.scene.dur,
      global: at.t,
      scene: at.scene.id,
      beat: at.beat.id,
      p(id, from = 0, to = 1) {
        const b = get(id);
        const a = b.start + from * b.dur;
        const z = b.start + to * b.dur;
        return Math.min(Math.max((at.local - a) / (z - a), 0), 1);
      },
      since(id) { return at.local - get(id).start; },
      started(id) { return at.local >= get(id).start - EPS; },
      beatLength(id) { return get(id).dur; },
    };
    return s;
  }

  // Beat boundaries across the whole lesson, used by ← / → and presenter mode.
  function stops(tl) {
    const list = [0];
    for (const s of tl.scenes) for (const b of s.beats) list.push(s.start + b.end);
    return list;
  }

  function nextStop(tl, t) {
    for (const x of stops(tl)) if (x > t + 1e-6) return x;
    return tl.duration;
  }

  // Going back from just after a boundary should skip that boundary,
  // otherwise pressing ← during playback would appear to do nothing.
  function prevStop(tl, t) {
    const list = stops(tl);
    for (let i = list.length - 1; i >= 0; i--) if (list[i] < t - 0.25) return list[i];
    return 0;
  }

  function presenterClamp(tl, t0, t1) {
    for (const x of stops(tl)) {
      if (x > t0 + 1e-6 && x <= t1 + 1e-6) return { t: x, hit: true };
    }
    return { t: t1, hit: false };
  }

  const api = { build, locate, sceneState, stops, nextStop, prevStop, presenterClamp, clampTime };
  root.CCT = root.CCT || {};
  root.CCT.timeline = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
