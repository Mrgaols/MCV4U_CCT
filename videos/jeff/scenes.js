// Jeff's scenes. Each draw(ctx, s) paints one frame from the scene clock s:
//   s.p('beat')          0..1 progress through a beat (timing.js sets beat lengths)
//   s.p('beat', a, b)    progress through only the part a..b of that beat
//   s.since('beat')      seconds since the beat began
// All numbers on screen come from JeffMath (math.js), never typed in by hand.
(function (root) {
  'use strict';

  const { draw: D, theme, Plot, fmt, fmtTrim, plotCard } = root.CCT;
  const M = root.JeffMath;
  const C = theme.color;
  const L = theme.stage.left;
  const { ease, lerp, clamp, fade, stations } = D;

  // The five-step method from the site (lesson 3.3), shown as a row of pills.
  const STEPS = ['Domain', 'Objective', 'Differentiate', 'Candidates', 'Justify'];
  function rail(ctx, active, done, alpha = 1) {
    let x = L;
    STEPS.forEach((name, i) => {
      const isActive = i === active;
      const isDone = i < done && !isActive;
      const w = D.pill(ctx, (i + 1) + '  ' + name, x, 296, {
        size: 28, weight: isActive ? 700 : 500, alpha,
        bg: isActive ? C.ink : isDone ? C.mintSoft : C.surface,
        color: isActive ? C.canvas : C.ink,
      });
      x += w + 12;
      if (i < STEPS.length - 1) D.text(ctx, '→', x + 4, 306, { size: 28, color: C.muted, alpha });
      x += 44;
    });
  }

  // Leaderboard of candidates: rows slide from listing order into ranked order.
  function leaderboard(ctx, rows, x, y, sortP, o = {}) {
    const ranked = [...rows].sort((a, b) => b.value - a.value || a.x - b.x);
    const rowH = o.rowH || 64;
    D.text(ctx, o.keyLabel || 'x', x + 24, y, { size: 28, weight: 600, color: C.steel });
    D.text(ctx, 'type', x + 150, y, { size: 28, weight: 600, color: C.steel });
    D.text(ctx, o.valueLabel || 'f(x)', x + 400, y, { size: 28, weight: 600, color: C.steel });
    rows.forEach((r, i) => {
      const j = ranked.indexOf(r);
      const yy = y + 56 + lerp(i, j, ease(sortP)) * rowH;
      const a = r.alpha == null ? 1 : r.alpha;
      if (r.highlight) D.card(ctx, x, yy - 42, 600, 58, { fill: r.highlight, border: false, radius: 12, alpha: a });
      D.text(ctx, fmtTrim(r.x, 2), x + 24, yy, { size: 32, mono: true, alpha: a });
      D.text(ctx, r.kind, x + 150, yy, { size: 30, color: C.slate, alpha: a });
      D.text(ctx, (o.prefix || '') + fmtTrim(r.value, 2), x + 400, yy, { size: 32, mono: true, weight: 600, alpha: a });
    });
  }

  const scenes = {};

  // 1. Hook: a hiker meets a shelf, a false peak, and the real summit at the trail's end.
  scenes.hook = {
    title: 'Opening question',
    draw(ctx, s) {
      fade(ctx, 1 - s.p('walk', 0, 0.12), () => {
        D.sky(ctx);
        const a = ease(s.p('title', 0, 0.5));
        D.text(ctx, 'Candidates, Then Proof', 960, 470, { size: theme.size.display, weight: 600, align: 'center', alpha: a });
        D.text(ctx, 'Extreme Values and Optimization', 960, 560, { size: theme.size.h2, weight: 500, align: 'center', alpha: a, color: C.charcoal });
        D.text(ctx, 'Jeff · MCV4U Topic C: Derivatives and Optimization', 960, 640, { size: theme.size.body, align: 'center', alpha: ease(s.p('title', 0.3, 0.8)), color: C.slate });
      });
      const a = ease(s.p('walk', 0.05, 0.2));
      if (a <= 0) return;
      fade(ctx, a, () => {
        D.heading(ctx, 'Opening question', 'Where is the highest point of this trail?', a);
        const T = M.TRAIL;
        const box = { x: L, y: 280, w: 1728, h: 560 };
        D.card(ctx, box.x, box.y, box.w, box.h);
        const p = new Plot({ x: box.x + 40, y: box.y + 40, w: box.w - 80, h: box.h - 70 }, { xMin: -0.2, xMax: T.end + 0.2, yMin: 0, yMax: 18 });
        p.fillBetween(ctx, M.trail, () => 0, 0, T.end, { color: C.fnSoft });
        p.curve(ctx, M.trail, { from: 0, to: T.end, width: 6 });

        // The hiker walks between stations and stops at each one.
        const stops = [0, T.shelf, T.peak, T.end];
        const st = stations(stops, s.p('walk', 0.12, 1), 0.55);
        const hx = st.value;
        const notes = [
          null,
          [T.shelf, 'flat (slope 0), but still climbing', C.slope],
          [T.peak, 'flat and a local peak, but not the top', C.slope],
          [T.end, 'end of the trail: the highest point', C.ink],
        ];
        for (let i = 1; i < notes.length; i++) {
          if (st.settled < i) continue;
          const [x, text] = notes[i];
          const yPx = p.Y(M.trail(x));
          // The last note sits beside the summit (it is at the top edge of the plot).
          const last = i === 3;
          D.pill(ctx, text, p.X(x) + (last ? -44 : 0), yPx + (last ? 6 : -60), { size: 28, weight: 600, align: last ? 'right' : 'center', bg: last ? C.mintSoft : C.slopeSoft });
          if (i < 3) p.segment(ctx, x - 0.5, M.trail(x), x + 0.5, M.trail(x), { color: C.slope, width: 4 });
        }
        // Hiker: a dot with a short tangent showing the slope underfoot.
        const m = M.trailSlope(hx);
        p.segment(ctx, hx - 0.35, M.trail(hx) - 0.35 * m, hx + 0.35, M.trail(hx) + 0.35 * m, { color: C.slope, width: 5 });
        p.dot(ctx, hx, M.trail(hx), { r: 16 });
        D.pill(ctx, 'slope ' + fmt(m, 2), p.X(hx), p.Y(M.trail(hx)) + 52, { size: 28, mono: true, align: 'center', bg: C.canvas, border: C.hairline });

        D.steps(ctx, [
          { c: 'Flat spots (f′ = 0) and endpoints are only **candidates**. To find the top, test and compare them.', p: s.p('message', 0.05, 0.35) },
          { c: 'Today: critical numbers · the Extreme Value Theorem · derivative tests · three optimization problems', p: s.p('message', 0.4, 0.7), color: C.slate, size: 28 },
        ], L, 910, { size: 32, gap: 56 });
      });
    },
  };

  // 2. Critical numbers: slide a tangent along x³ − 3x and watch f′ below.
  scenes.critical = {
    title: 'Critical numbers',
    draw(ctx, s) {
      D.heading(ctx, '1 · Critical numbers', 'Where the tangent goes flat, or breaks', s.p('setup', 0, 0.3));
      const top = plotCard(ctx, { x: L, y: 280, w: 1100, h: 380 }, { xMin: -2.3, xMax: 2.3, yMin: -2.8, yMax: 2.8 });
      const bot = plotCard(ctx, { x: L, y: 680, w: 1100, h: 310 }, { xMin: -2.3, xMax: 2.3, yMin: -4, yMax: 10 });
      top.axes(ctx, { xTicks: [-2, -1, 1, 2], yTicks: [-2, 2] });
      bot.axes(ctx, { xTicks: [-2, -1, 1, 2], yTicks: [3, 9] });
      const ca = ease(s.p('setup', 0.2, 0.6));
      top.curve(ctx, M.f, { from: -2, to: 2, width: 6, alpha: ca });
      bot.curve(ctx, M.fp, { from: -2, to: 2, width: 5, color: C.slope, alpha: ca });
      D.text(ctx, [['f(x) = x^{3} − 3x', C.fn, 600]], L + 30, 330, { size: 32, alpha: ca });
      bot.label(ctx, [['f′(x) = 3x^{2} − 3', C.slope, 600]], 0.25, 8, { size: 32, alpha: ca });

      const x0 = s.started('slide') ? lerp(-2, 2, s.p('slide', 0.04, 0.96)) : -2;
      const ta = ease(s.p('slide', 0, 0.06)) * (1 - ease(s.p('dne', 0, 0.2)) * 0.6);
      if (ta > 0) {
        const m = M.fp(x0);
        top.segment(ctx, x0 - 0.45, M.f(x0) - 0.45 * m, x0 + 0.45, M.f(x0) + 0.45 * m, { color: C.slope, width: 5, alpha: ta });
        top.dot(ctx, x0, M.f(x0), { r: 11, alpha: ta });
        bot.dot(ctx, x0, M.fp(x0), { r: 10, color: C.slope, alpha: ta });
        ctx.save();
        ctx.globalAlpha *= ta;
        ctx.strokeStyle = C.muted;
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(top.X(x0), top.Y(M.f(x0))); ctx.lineTo(bot.X(x0), bot.Y(M.fp(x0))); ctx.stroke();
        ctx.restore();
      }
      // Critical numbers light up once the tangent has passed them.
      for (const c of M.CRIT) {
        if (!(s.started('slide') && x0 >= c)) continue;
        top.dot(ctx, c, M.f(c), { r: 13, color: C.slope });
        bot.dot(ctx, c, 0, { r: 12, color: C.slope });
        top.label(ctx, 'f′(' + c + ') = 0', c, M.f(c), { dy: c < 0 ? -26 : 52, align: 'center', size: 28, weight: 600, color: C.slope });
      }

      const RX = 1250;
      fade(ctx, ease(s.p('slide', 0.05, 0.15)) * (1 - ease(s.p('define', 0, 0.15))), () => {
        D.card(ctx, RX, 280, 574, 200, { fill: C.surface, border: false });
        D.text(ctx, 'x = ' + fmt(x0, 2), RX + 32, 350, { size: 34, mono: true });
        D.text(ctx, 'slope f′(x) = ' + fmt(M.fp(x0), 2), RX + 32, 420, { size: 34, mono: true, color: C.slope });
      });
      fade(ctx, ease(s.p('define', 0.1, 0.3)), () => {
        D.text(ctx, 'Definition', RX, 330, { size: 28, weight: 600, color: C.steel });
        D.wrap(ctx, 'A critical number c is an interior point of the domain where f′(c) = 0 or f′(c) does not exist.', RX, 380, 570, { size: 32, weight: 600 });
        D.steps(ctx, [
          { c: 'f′(x) = 3x^{2} − 3 = 3(x − 1)(x + 1)', p: s.p('define', 0.4, 0.55) },
          { c: 'f′(x) = 0  →  x = −1 or x = 1', p: s.p('define', 0.55, 0.7) },
          { c: 'Practice: Assessment 2 Q1', p: s.p('define', 0.75, 0.9), color: C.slate, size: 28 },
        ], RX, 580, { size: 32, gap: 60 });
      });
      // A corner: f′ does not exist, yet it is a maximum.
      fade(ctx, ease(s.p('dne', 0.1, 0.3)), () => {
        D.card(ctx, RX, 770, 574, 220, { shadow: true });
        const ip = new Plot({ x: RX + 20, y: 790, w: 210, h: 180 }, { xMin: -1.2, xMax: 1.2, yMin: -1.3, yMax: 0.4 });
        ip.axes(ctx, { alpha: 0.6 });
        ip.curve(ctx, M.peakCorner, { width: 5 });
        ip.dot(ctx, 0, 0, { r: 9, color: C.slope });
        D.text(ctx, 'y = −|x| at x = 0', RX + 250, 830, { size: 28, weight: 600 });
        D.text(ctx, 'f′(0) does not exist,', RX + 250, 880, { size: 28 });
        D.text(ctx, 'yet it is a maximum.', RX + 250, 920, { size: 28 });
        D.text(ctx, 'Still critical (Final Q10)', RX + 250, 962, { size: 28, color: C.slate });
      });
    },
  };

  // 3. Candidates, leaderboard, the Extreme Value Theorem and two counterexamples.
  scenes.evt = {
    title: 'Local vs absolute; the EVT',
    draw(ctx, s) {
      D.heading(ctx, '2 · Absolute extrema', 'Line up every candidate, then compare', s.p('candidates', 0, 0.3));
      const mainA = 1 - ease(s.p('theorem', 0, 0.2));
      fade(ctx, mainA, () => {
        const p = plotCard(ctx, { x: L, y: 280, w: 960, h: 710 }, { xMin: -2.4, xMax: 2.4, yMin: -2.9, yMax: 2.9 });
        p.axes(ctx, { xTicks: [-2, -1, 1, 2], yTicks: [-2, 2] });
        p.curve(ctx, M.f, { from: -2, to: 2, width: 6 });
        const ext = M.absoluteExtrema(M.f, M.CANDIDATES.map((c) => c.x));
        // Each candidate: its type and, once evaluated, its value, stacked beside the dot.
        M.CANDIDATES.forEach((c, i) => {
          const a = ease(s.p('candidates', 0.2 + i * 0.15, 0.35 + i * 0.15));
          const crit = c.kind === 'critical';
          const v = M.f(c.x);
          const up = v > 0;
          const ea = ease(s.p('evaluate', 0.1 + i * 0.15, 0.3 + i * 0.15));
          p.segment(ctx, c.x, 0, c.x, v, { color: C.muted, width: 2, dash: [8, 8], alpha: ea });
          p.dot(ctx, c.x, v, { r: 14, color: crit ? C.slope : C.ink, alpha: a });
          p.label(ctx, c.kind, c.x, v, { dy: up ? -64 : 90, align: 'center', size: 28, color: crit ? C.slope : C.slate, weight: 600, alpha: a });
          p.label(ctx, 'f(' + c.x + ') = ' + fmt(v, 0), c.x, v, { dy: up ? -28 : 54, align: 'center', size: 28, mono: true, weight: 600, alpha: ea });
        });
        // Winners get a ring: mint for the absolute max, red for the absolute min.
        const la = ease(s.p('leaderboard', 0.5, 0.8));
        const ring = (x, y, col) => {
          ctx.save();
          ctx.globalAlpha *= la;
          ctx.strokeStyle = col;
          ctx.lineWidth = 6;
          ctx.beginPath(); ctx.arc(p.X(x), p.Y(y), 26, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        };
        for (const x of ext.max.xs) ring(x, ext.max.value, C.mintDeep);
        for (const x of ext.min.xs) ring(x, ext.min.value, C.slope);

        // Right: the candidate table that sorts itself into a leaderboard.
        const RX = 1150;
        D.text(ctx, ['Candidates for ', ['f(x) = x^{3} − 3x', C.fn, 600], ' on [−2, 2]'], RX, 340, { size: 32, weight: 600, alpha: ease(s.p('candidates', 0, 0.3)) });
        fade(ctx, ease(s.p('evaluate', 0.05, 0.2)), () => {
          const sortP = s.p('leaderboard', 0.05, 0.45);
          const rows = M.CANDIDATES.map((c) => {
            const v = M.f(c.x);
            const hi = v === ext.max.value ? C.mintSoft : v === ext.min.value ? C.slopeSoft : null;
            return { x: c.x, kind: c.kind, value: v, highlight: s.p('leaderboard') > 0.5 ? hi : null };
          });
          leaderboard(ctx, rows, RX, 410, sortP);
          D.steps(ctx, [
            { c: 'Absolute max ' + fmt(ext.max.value, 0) + ' at x = −1 and x = 2', p: s.p('leaderboard', 0.55, 0.75) },
            { c: 'Absolute min ' + fmt(ext.min.value, 0) + ' at x = −2 and x = 1', p: s.p('leaderboard', 0.65, 0.85) },
            { c: 'Endpoints tie with turning points. Never skip them.', p: s.p('leaderboard', 0.8, 1), color: C.slate, size: 28 },
          ], RX, 780, { size: 32, gap: 58 });
        });
      });

      // The theorem, then the two ways it can fail.
      const tA = ease(s.p('theorem', 0.15, 0.4));
      fade(ctx, tA, () => {
        D.card(ctx, L, 280, 1728, 216, { fill: C.surface, border: false });
        D.text(ctx, 'Extreme Value Theorem', L + 40, 336, { size: 30, weight: 600, color: C.steel });
        D.text(ctx, 'If f is **continuous** on a **closed** interval [a, b], then f has an absolute maximum', L + 40, 392, { size: 34 });
        D.text(ctx, 'and an absolute minimum on [a, b]. They occur at critical numbers or endpoints.', L + 40, 444, { size: 34 });
        D.text(ctx, 'Both conditions matter (Assessment 2 Q4).', L + 1688, 336, { size: 28, color: C.slate, align: 'right', alpha: ease(s.p('jump', 0.8, 1)) });
      });
      const panels = [
        { beat: 'open', title: 'Not closed: f(x) = x on (0, 1)', x: L, f: (x) => x, closedEnd: false, note: 'gets close to 1, never reaches it' },
        { beat: 'jump', title: 'Not continuous: x on [0, 1), f(1) = 0', x: 984, f: (x) => x, closedEnd: true, note: 'the jump skips the top value (HW 3.4)' },
      ];
      for (const pn of panels) {
        const a = ease(s.p(pn.beat, 0, 0.2));
        if (a <= 0) continue;
        fade(ctx, a, () => {
          D.card(ctx, pn.x, 520, 840, 470);
          D.text(ctx, pn.title, pn.x + 32, 574, { size: 32, weight: 600 });
          const p = new Plot({ x: pn.x + 90, y: 606, w: 700, h: 296 }, { xMin: -0.15, xMax: 1.25, yMin: -0.15, yMax: 1.2 });
          p.axes(ctx, { xTicks: [1], yTicks: [1] });
          p.curve(ctx, pn.f, { from: 0, to: 1, width: 6 });
          p.dot(ctx, 1, 1, { r: 11, hollow: true, color: C.fn });
          if (pn.closedEnd) { p.dot(ctx, 0, 0, { r: 11, color: C.fn }); p.dot(ctx, 1, 0, { r: 11, color: C.fn }); }
          else p.dot(ctx, 0, 0, { r: 11, hollow: true, color: C.fn });
          // A point climbs toward the missing top: 0.9, 0.99, 0.999 ...
          const st = D.stepped([0.5, 0.1, 0.01, 0.001], s.p(pn.beat, 0.2, 0.9));
          const xv = 1 - st.value;
          p.dot(ctx, xv, xv, { r: 10, color: C.slope });
          p.label(ctx, 'f = ' + fmtTrim(xv, 3), xv, xv, { dx: -24, dy: -24, align: 'right', mono: true, size: 28, color: C.slope });
          D.cross(ctx, pn.x + 52, 950, 20, { alpha: ease(s.p(pn.beat, 0.7, 0.9)) });
          D.text(ctx, 'No maximum: ' + pn.note, pn.x + 86, 960, { size: 28, weight: 600, alpha: ease(s.p(pn.beat, 0.7, 0.9)) });
        });
      }
    },
  };

  // 4. First and second derivative tests, and where they cannot decide.
  scenes.tests = {
    title: 'Derivative tests',
    draw(ctx, s) {
      D.heading(ctx, '3 · Classifying critical numbers', 'First and second derivative tests', s.p('first', 0, 0.2));
      const mainA = 1 - ease(s.p('fail', 0, 0.15));
      fade(ctx, mainA, () => {
        const p = plotCard(ctx, { x: L, y: 280, w: 960, h: 530 }, { xMin: -2.4, xMax: 2.4, yMin: -2.9, yMax: 2.9 });
        p.axes(ctx, { xTicks: [-2, -1, 1, 2], yTicks: [-2, 2] });
        p.curve(ctx, M.f, { from: -2.2, to: 2.2, width: 6 });
        // Sign strip of f′ under the graph.
        D.card(ctx, L, 830, 960, 160);
        D.text(ctx, [['sign of f′', C.slope, 600]], L + 24, 880, { size: 28 });
        const cuts = [-2.4, -1, 1, 2.4];
        for (let i = 0; i < 3; i++) {
          const a = ease(s.p('first', 0.1 + i * 0.12, 0.25 + i * 0.12));
          const mid = (cuts[i] + cuts[i + 1]) / 2;
          const xm = p.X(Math.max(Math.min(mid, 2), -2));
          const pos = M.fp(mid) > 0;
          D.text(ctx, pos ? '+' : '−', xm, 890, { size: 44, weight: 700, align: 'center', color: C.slope, alpha: a });
          D.arrow(ctx, xm - 40, pos ? 960 : 920, xm + 40, pos ? 920 : 960, { color: C.ink, width: 5, alpha: a });
        }
        for (const c of M.CRIT) {
          const a = ease(s.p('first', 0.5, 0.65));
          ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.muted; ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p.X(c), 845); ctx.lineTo(p.X(c), 975); ctx.stroke(); ctx.restore();
          p.dot(ctx, c, M.f(c), { r: 13, color: C.slope, alpha: a });
          const isMax = M.fpp(c) < 0;
          p.label(ctx, isMax ? 'local max' : 'local min', c, M.f(c), { dy: isMax ? -30 : 56, align: 'center', size: 30, weight: 700, alpha: ease(s.p('first', 0.65, 0.85)) });
        }
        // Second derivative: a cap (∩) or cup (∪) drawn at each critical point.
        const sa = ease(s.p('second', 0.25, 0.5));
        for (const c of M.CRIT) {
          const down = M.fpp(c) < 0;
          ctx.save();
          ctx.globalAlpha *= sa;
          ctx.strokeStyle = C.accel;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(p.X(c), p.Y(M.f(c)) + (down ? 70 : -70), 56, down ? Math.PI * 1.15 : Math.PI * 0.15, down ? Math.PI * 1.85 : Math.PI * 0.85);
          ctx.stroke();
          ctx.restore();
        }
        const RX = 1120;
        D.steps(ctx, [
          { c: '**First derivative test**', p: s.p('first', 0.1, 0.3) },
          { c: 'f′ changes + to − at x = −1: local max', p: s.p('first', 0.6, 0.8) },
          { c: 'f′ changes − to + at x = 1: local min', p: s.p('first', 0.7, 0.9), gap: 110 },
          { c: [['**Second derivative test**', C.ink]], p: s.p('second', 0, 0.2) },
          { c: ['f″(x) = 6x', ''], p: s.p('second', 0.1, 0.3) },
          { c: ['f″(−1) = ', [fmt(M.fpp(-1), 0) + ' < 0', C.accel, 700], ': concave down, local max'], p: s.p('second', 0.4, 0.6) },
          { c: ['f″(1) = ', [fmt(M.fpp(1), 0) + ' > 0', C.accel, 700], ': concave up, local min'], p: s.p('second', 0.55, 0.75) },
          { c: 'Both tests agree.', p: s.p('second', 0.8, 1), color: C.slate },
        ], RX, 340, { size: 32, gap: 64 });
      });

      // When the tests cannot decide.
      const cases = [
        { title: 'f(x) = x^{3} at x = 0', f: M.cube, win: [-1.4, 1.4, -1.6, 1.6], lines: ['f′(0) = 0, but f′ ≥ 0 on both sides:', 'f keeps rising. No max or min.'], x: L },
        { title: 'f(x) = x^{4} − 4x^{3} at x = 0', f: M.quartic, win: [-1.5, 4.4, -32, 12], lines: ['f″(0) = 0: the second test is', 'inconclusive. f′ < 0 on both sides', 'of 0, so neither (HW 3.5).'], x: 984 },
      ];
      cases.forEach((cs, i) => {
        const a = ease(s.p('fail', 0.1 + i * 0.25, 0.3 + i * 0.25));
        if (a <= 0) return;
        fade(ctx, a, () => {
          D.card(ctx, cs.x, 280, 840, 710);
          D.text(ctx, cs.title, cs.x + 36, 340, { size: 34, weight: 600 });
          const p = new Plot({ x: cs.x + 80, y: 380, w: 700, h: 380 }, { xMin: cs.win[0], xMax: cs.win[1], yMin: cs.win[2], yMax: cs.win[3] });
          p.axes(ctx, { alpha: 0.7 });
          p.curve(ctx, cs.f, { width: 6 });
          p.segment(ctx, -0.6, 0, 0.6, 0, { color: C.slope, width: 5 });
          p.dot(ctx, 0, 0, { r: 12, color: C.slope });
          cs.lines.forEach((ln, k) => D.text(ctx, ln, cs.x + 36, 830 + k * 48, { size: 30 }));
        });
      });
    },
  };

  // Pseudo-3D drawing of the box. Iso projection: x right-down, y left-down, z up.
  function isoMap(cx, cy, k) {
    return (X, Y, Z) => [cx + (X - Y) * k * 0.87, cy + (X + Y) * k * 0.42 - Z * k];
  }
  function polygon(ctx, P, pts, fill, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    pts.forEach((q, i) => { const [x, y] = P(...q); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = C.fn;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
  // x: corner cut (cm); theta: fold angle, 0 = flat sheet, π/2 = walls upright.
  function drawBox(ctx, P, x, theta, cutAlpha) {
    const h = M.SHEET / 2;
    const a = h - x;
    const c = Math.cos(theta);
    const sn = Math.sin(theta);
    const out = a + x * c;
    const flaps = {
      S: [[-a, -a, 0], [a, -a, 0], [a, -out, x * sn], [-a, -out, x * sn]],
      W: [[-a, -a, 0], [-a, a, 0], [-out, a, x * sn], [-out, -a, x * sn]],
      N: [[-a, a, 0], [a, a, 0], [a, out, x * sn], [-a, out, x * sn]],
      E: [[a, -a, 0], [a, a, 0], [out, a, x * sn], [out, -a, x * sn]],
    };
    // Corner squares that get cut away, drawn as dashed outlines.
    if (cutAlpha > 0) {
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const pts = [[sx * a, sy * a, 0], [sx * h, sy * a, 0], [sx * h, sy * h, 0], [sx * a, sy * h, 0]];
        ctx.save();
        ctx.globalAlpha *= cutAlpha;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        pts.forEach((q, i) => { const [px, py] = P(...q); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
        ctx.closePath();
        ctx.fillStyle = C.slopeSoft;
        ctx.fill();
        ctx.strokeStyle = C.slope;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    }
    // Far walls, then the base, then near walls (painter's order).
    polygon(ctx, P, flaps.S, '#d5e1f3');
    polygon(ctx, P, flaps.W, '#d5e1f3');
    polygon(ctx, P, [[-a, -a, 0], [a, -a, 0], [a, a, 0], [-a, a, 0]], '#e8eef8');
    polygon(ctx, P, flaps.N, 'rgba(195, 212, 238, 0.92)');
    polygon(ctx, P, flaps.E, 'rgba(195, 212, 238, 0.92)');
  }

  // Exact fractions for labels: frac(20, 6) -> "10/3", frac(12, 6) -> "2".
  function frac(n, d) {
    const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
    const k = g(n, d);
    return d / k === 1 ? String(n / k) : (n / k) + '/' + (d / k);
  }
  // A round tick step (1, 2 or 5 times a power of ten) giving about three ticks up to v.
  function niceStep(v) {
    const raw = v / 3;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 5, 10].map((m) => m * pow).find((st) => st >= raw);
  }

  // 5. Design: cut and fold a square sheet into the largest open box.
  // Every label is computed from M.SHEET, so changing the sheet size in math.js
  // updates the picture, the graph and the working together.
  scenes.box = {
    title: 'Design: open box',
    draw(ctx, s) {
      const S = M.SHEET;
      const half = S / 2;
      const xs = frac(S, 6);
      D.heading(ctx, '4 · Design', 'Cut, fold, maximize: the open-top box', s.p('rail', 0, 0.3));
      const step = s.started('justify') ? 4 : s.started('calculus') ? (s.p('calculus') < 0.5 ? 2 : 3) : s.started('fold') ? 1 : s.started('sheet') ? 0 : -1;
      rail(ctx, step, step, ease(s.p('rail', 0.2, 0.6)));

      // Corner cut x (shallow → deep → best) and fold angle over time.
      let x = 0.15 * S;
      if (s.started('sweep')) x = stations([0.15 * S, 0.03 * S, 0.46 * S, M.BOX.xStar], s.p('sweep'), 0.7).value;
      const theta = Math.PI / 2 * ease(s.p('fold', 0.1, 0.7));
      const P = isoMap(500, 640, 400 / S);
      const shapeA = ease(s.p('sheet', 0, 0.3));
      fade(ctx, shapeA, () => {
        drawBox(ctx, P, x, theta, 1 - ease(s.p('fold', 0, 0.3)));
        const a = half - x;
        if (theta < 0.2) {
          const [lx, ly] = P(0, -half, 0);
          D.text(ctx, S + ' cm', lx + 34, ly - 22, { size: 30, weight: 600 });
          const [cx, cy] = P(half - x / 2, -half + x / 2, 0);
          D.text(ctx, 'x', cx, cy + 10, { size: 32, weight: 700, color: C.slope, align: 'center' });
        } else {
          const [bx, by] = P(a, 0, 0);
          D.text(ctx, S + ' − 2x', bx + 70, by + 40, { size: 30, weight: 600 });
          const [hx, hy] = P(a + x * Math.cos(theta), -a, x * Math.sin(theta) / 2);
          D.text(ctx, 'x', hx + 18, hy + 10, { size: 32, weight: 700, color: C.slope });
        }
      });

      // Volume graph on the right.
      const RX = 960;
      const ga = ease(s.p('fold', 0.5, 0.9));
      fade(ctx, ga, () => {
        const yStep = niceStep(M.BOX.vMax);
        const p = plotCard(ctx, { x: RX, y: 345, w: 864, h: 380 }, { xMin: 0, xMax: half * 1.04, yMin: 0, yMax: M.BOX.vMax * 1.15 });
        p.axes(ctx, { xTicks: [1, 2, 3, 4, 5].map((k) => k * S / 10), yTicks: [1, 2, 3].map((k) => k * yStep).filter((v) => v < M.BOX.vMax * 1.1), xLabel: 'x (cm)' });
        const traced = s.started('sweep') ? half : x;
        p.curve(ctx, M.boxV, { from: 0, to: traced, width: 5 });
        p.dot(ctx, x, M.boxV(x), { r: 11, color: C.fn });
        D.text(ctx, [['V(x)', C.fn, 700], '  cm^{3}'], RX + 30, 390, { size: 30 });
        D.pill(ctx, 'x = ' + fmt(x, 2) + ' cm    V = ' + fmt(M.boxV(x), 1) + ' cm^{3}', RX + 840, 392, { size: 28, mono: true, align: 'right', bg: C.surface });
        if (s.started('justify')) {
          const ja = ease(s.p('justify', 0, 0.3));
          p.dot(ctx, M.BOX.xStar, M.BOX.vMax, { r: 13, color: C.slope, alpha: ja });
          p.dot(ctx, 0, 0, { r: 10, alpha: ja });
          p.dot(ctx, half, 0, { r: 10, alpha: ja });
        }
      });
      D.steps(ctx, [
        { c: '1. Domain: 0 < x < ' + half + ' (the cut must leave a base)', p: s.p('sheet', 0.4, 0.7) },
        { c: '2. V(x) = x(' + S + ' − 2x)^{2}   (height × base area)', p: s.p('fold', 0.6, 0.9) },
        { c: '3. V′(x) = (' + S + ' − 2x)(' + S + ' − 6x)   (product rule, factored)', p: s.p('calculus', 0.1, 0.4) },
        { c: '4. V′ = 0: x = ' + half + ' (no base, not allowed) or x = ' + xs, p: s.p('calculus', 0.5, 0.8) },
        { c: ['5. V(0) = V(' + half + ') = 0 and V > 0 between, so ', ['x = ' + xs + ' cm', C.slope, 700], ' is the max'], p: s.p('justify', 0.1, 0.4) },
      ], RX, 790, { size: 28, gap: 48 });
      fade(ctx, ease(s.p('justify', 0.45, 0.7)), () => {
        // V(S/6) = (S/6)(2S/3)² = 2S³/27.
        const exact = frac(2 * S * S * S, 27);
        D.pill(ctx, 'V_{max} = ' + exact + (exact.includes('/') ? ' ≈ ' + fmt(M.BOX.vMax, 2) : '') + ' cm^{3}', L, 960, { size: 30, weight: 700, bg: C.mintSoft });
        D.text(ctx, 'Practice: HW 4.1', L + 520, 970, { size: 28, color: C.slate });
      });
    },
  };

  // 6. Economics: profit as the gap between revenue and cost; then why MR = MC is not proof.
  scenes.profit = {
    title: 'Economics: profit',
    draw(ctx, s) {
      D.heading(ctx, '5 · Economics', 'Maximum profit, proven', s.p('model', 0, 0.3));
      const step = s.started('twist') ? -1 : s.started('prove') ? (s.p('prove') < 0.6 ? 3 : 4) : s.started('tangents') ? 2 : s.p('model') > 0.5 ? 1 : 0;
      rail(ctx, step, step, 1 - ease(s.p('twist', 0, 0.1)));

      const RX = 1150;
      const mainA = 1 - ease(s.p('twist', 0, 0.15));
      fade(ctx, mainA, () => {
        const p = plotCard(ctx, { x: L, y: 345, w: 1010, h: 645 }, { xMin: 0, xMax: 52, yMin: 0, yMax: 1400 });
        p.axes(ctx, { xTicks: [10, 20, 30, 40, 50], yTicks: [400, 800, 1200], xLabel: 'q (items)' });
        const ca = ease(s.p('curves', 0, 0.3));
        p.curve(ctx, M.revenue, { from: 0, to: 50, width: 6, alpha: ca });
        p.curve(ctx, M.cost, { from: 0, to: 50, width: 5, color: C.slate, alpha: ca });
        p.label(ctx, 'revenue R(q)', 8, 960, { align: 'right', size: 28, weight: 600, color: C.fn, alpha: ca });
        p.label(ctx, 'cost C(q)', 50, M.cost(50), { dy: 48, size: 28, weight: 600, color: C.slate, align: 'right', alpha: ca });

        let q = 4;
        if (s.started('curves')) q = lerp(4, 44, ease(s.p('curves', 0.3, 1)));
        if (s.started('tangents')) q = stations([44, 6, 34, 20], s.p('tangents'), 0.7).value;
        if (s.started('prove')) q = 20;
        const ga = ease(s.p('curves', 0.3, 0.45));
        const P = M.profit(q);
        p.segment(ctx, q, M.cost(q), q, M.revenue(q), { color: P >= 0 ? C.mintDeep : C.error, width: 12, alpha: ga * 0.8 });
        p.label(ctx, 'P = ' + (P < 0 ? '−$' : '$') + fmt(Math.abs(P), 0), q, (M.cost(q) + M.revenue(q)) / 2, { dx: 18, size: 30, mono: true, weight: 700, alpha: ga });

        // Tangent to R (slope MR) next to the cost line (slope MC).
        const ta = ease(s.p('tangents', 0, 0.15));
        if (ta > 0) {
          p.line(ctx, q, M.revenue(q), M.MR(q), { color: C.slope, width: 4, alpha: ta });
          p.dot(ctx, q, M.revenue(q), { r: 10, color: C.slope, alpha: ta });
        }
      });
      fade(ctx, ease(s.p('model', 0.1, 0.3)) * (1 - ease(s.p('prove', 0, 0.12))), () => {
        D.text(ctx, 'A simplified model', RX, 400, { size: 28, weight: 600, color: C.steel });
        D.steps(ctx, [
          { c: 'price  p(q) = 100 − 2q  dollars', p: s.p('model', 0.15, 0.35) },
          { c: 'cost  C(q) = 200 + 20q  dollars', p: s.p('model', 0.25, 0.45) },
          { c: '1. Domain: 0 ≤ q ≤ 50', p: s.p('model', 0.4, 0.55) },
          { c: '2. P(q) = R(q) − C(q) = 80q − 2q^{2} − 200', p: s.p('model', 0.6, 0.8) },
        ], RX, 456, { size: 30, gap: 56 });
      });
      fade(ctx, ease(s.p('tangents', 0.1, 0.25)) * mainA, () => {
        const q = s.started('prove') ? 20 : stations([44, 6, 34, 20], s.p('tangents'), 0.7).value;
        const eq = Math.abs(M.MR(q) - M.MC(q)) < 0.05;
        D.card(ctx, RX, 700, 674, 150, { fill: eq ? C.mintSoft : C.surface, border: false });
        D.text(ctx, ['MR = R′(q) = 100 − 4q = ', [fmt(M.MR(q), 1), C.slope, 700]], RX + 28, 756, { size: 30, mono: true });
        D.text(ctx, ['MC = C′(q) = ', [fmt(M.MC(q), 0), C.slate, 700], eq ? '   MR = MC' : ''], RX + 28, 812, { size: 30, mono: true });
      });
      fade(ctx, ease(s.p('prove', 0.12, 0.3)) * mainA, () => {
        D.steps(ctx, [
          { c: '3. P′(q) = 80 − 4q', p: s.p('prove', 0.1, 0.3) },
          { c: '4. P′(q) = 0  →  q = 20', p: s.p('prove', 0.25, 0.45) },
          { c: '5. P″(q) = −4 < 0 on [0, 50]: absolute max.', p: s.p('prove', 0.45, 0.65) },
          { c: '    Ends: P(0) = −$200, P(50) = −$1200', p: s.p('prove', 0.55, 0.75), color: C.slate },
        ], RX, 400, { size: 30, gap: 56 });
        const a = ease(s.p('prove', 0.75, 0.95));
        D.check(ctx, RX + 22, 900, 20, { alpha: a });
        D.text(ctx, 'Sell ' + M.ECON.qStar + ' at $' + fmt(M.price(M.ECON.qStar), 0) + ': profit $' + fmt(M.profit(M.ECON.qStar), 0), RX + 56, 912, { size: 32, weight: 700, alpha: a });
      });

      // Twist: a hypothetical profit curve where MR = MC twice and neither is the best.
      const tw = ease(s.p('twist', 0.1, 0.3));
      fade(ctx, tw, () => {
        D.text(ctx, 'Is MR = MC enough?  A hypothetical profit, in thousands of dollars', L, 306, { size: 32, weight: 600 });
        const p = plotCard(ctx, { x: L, y: 345, w: 1010, h: 645 }, { xMin: -0.3, xMax: 5.4, yMin: -3, yMax: 23 });
        p.axes(ctx, { xTicks: [1, 2, 3, 4, 5], yTicks: [10, 20], xLabel: 'q' });
        p.curve(ctx, M.twist, { from: 0, to: 5, width: 6 });
        D.text(ctx, [['P(q) = q^{3} − 6q^{2} + 9q,  0 ≤ q ≤ 5', C.fn, 600]], L + 40, 400, { size: 30 });
        M.TWIST.candidates.forEach((q, i) => {
          const a = ease(s.p('twist', 0.25 + i * 0.08, 0.35 + i * 0.08));
          const stat = M.TWIST.stationary.includes(q);
          p.dot(ctx, q, M.twist(q), { r: 13, color: stat ? C.slope : C.ink, alpha: a });
          // q = 3 sits on the axis, so its label goes below the tick numbers.
          const lab = { dy: q === 3 ? 84 : -26, dx: q === 0 ? 14 : 0, align: q === 0 ? 'left' : 'center' };
          p.label(ctx, (stat ? 'MR = MC' : 'endpoint'), q, M.twist(q), { ...lab, size: 28, weight: 600, color: stat ? C.slope : C.slate, alpha: a });
        });
        const rows = M.TWIST.candidates.map((q) => ({
          x: q, kind: M.TWIST.stationary.includes(q) ? (q === 1 ? 'local max' : 'local min') : 'endpoint', value: M.twist(q),
          highlight: s.p('twist') > 0.75 && q === 5 ? C.mintSoft : null,
        }));
        leaderboard(ctx, rows, RX, 440, s.p('twist', 0.6, 0.75), { keyLabel: 'q', valueLabel: 'P (k$)' });
        D.steps(ctx, [
          { c: 'P′(q) = 3(q − 1)(q − 3) = 0 at q = 1 and q = 3', p: s.p('twist', 0.2, 0.35), size: 28 },
          { c: 'q = 3 is a local **minimum**; q = 1 loses to q = 5.', p: s.p('twist', 0.75, 0.9), size: 28, gap: 64 },
          { c: 'MR = MC only finds candidates.', p: s.p('twist', 0.85, 1), size: 32, weight: 600, gap: 46 },
          { c: 'Comparing them proves the winner.', p: s.p('twist', 0.85, 1), size: 32, weight: 600 },
        ], RX, 780, { gap: 52 });
      });
      D.text(ctx, 'Practice: HW 4.2 · A3 Q3, Q5 · Final Q8 (add a $10 tax)', RX, 990, { size: 28, color: C.slate, alpha: ease(s.p('link', 0.1, 0.4)) });
    },
  };

  // 7. Biology: the drug level peaks once. [0, ∞) is not closed, so use the sign of C′.
  scenes.drug = {
    title: 'Biology: drug level',
    draw(ctx, s) {
      D.heading(ctx, '6 · Biological science', 'When does the drug level peak?', s.p('model', 0, 0.3));
      const step = s.started('interpret') ? 4 : s.started('justify') ? 4 : s.started('derivative') ? (s.p('derivative') < 0.6 ? 2 : 3) : s.p('model') > 0.5 ? 1 : 0;
      rail(ctx, step, s.started('interpret') ? 5 : step);
      D.pill(ctx, 'Illustrative model, not medical data', 1824, 230, { size: 28, weight: 600, align: 'right', bg: C.accelSoft });

      let t = 0;
      if (s.started('run')) t = 10 * s.p('run', 0.04, 0.96);
      if (s.started('justify')) t = lerp(10, 2, ease(s.p('justify', 0, 0.25)));
      const conc = M.drug(t);

      // Clock and vial.
      const cx = 300;
      const cy = 470;
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = C.ink;
      ctx.fillStyle = C.canvas;
      ctx.beginPath(); ctx.arc(cx, cy, 100, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 12; k++) {
        const an = k / 12 * Math.PI * 2;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx + Math.sin(an) * 82, cy - Math.cos(an) * 82); ctx.lineTo(cx + Math.sin(an) * 94, cy - Math.cos(an) * 94); ctx.stroke();
      }
      ctx.restore();
      const hand = t / 12 * Math.PI * 2;
      D.arrow(ctx, cx, cy, cx + Math.sin(hand) * 74, cy - Math.cos(hand) * 74, { width: 6, head: 18 });
      D.text(ctx, 't = ' + fmt(t, 2) + ' h', cx, cy + 150, { size: 30, mono: true, align: 'center' });
      const vx = 230;
      const vy = 660;
      const vw = 140;
      const vh = 300;
      const level = clamp(conc / 3);
      ctx.save();
      D.roundRect(ctx, vx, vy, vw, vh, 24);
      ctx.clip();
      ctx.fillStyle = C.fnSoft;
      ctx.fillRect(vx, vy, vw, vh);
      ctx.fillStyle = C.fn;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(vx, vy + vh * (1 - level), vw, vh * level);
      ctx.restore();
      ctx.save();
      D.roundRect(ctx, vx, vy, vw, vh, 24);
      ctx.lineWidth = 5;
      ctx.strokeStyle = C.ink;
      ctx.stroke();
      ctx.restore();
      D.text(ctx, fmt(conc, 2) + ' mg/L', vx + vw + 24, vy + vh * (1 - level) + 10, { size: 30, mono: true, weight: 600 });

      const RX = 620;
      const p = plotCard(ctx, { x: RX, y: 345, w: 1204, h: 390 }, { xMin: 0, xMax: 10.3, yMin: 0, yMax: 3 });
      p.axes(ctx, { xTicks: [2, 4, 6, 8, 10], yTicks: [1, 2, 3], xLabel: 't (hours)' });
      const traced = s.started('derivative') ? 10 : t;
      p.curve(ctx, M.drug, { from: 0, to: Math.max(traced, 1e-4), width: 6 });
      p.dot(ctx, t, conc, { r: 11, color: C.fn });
      D.text(ctx, [['C(t)', C.fn, 700], '  mg/L'], RX + 140, 400, { size: 30 });
      // Sign of C′ under the graph.
      const sa = ease(s.p('justify', 0.25, 0.45));
      if (sa > 0) {
        p.band(ctx, 0, 2, { color: C.mintSoft, alpha: sa });
        p.band(ctx, 2, 10.3, { color: C.accelSoft, alpha: sa });
        p.label(ctx, 'C′ > 0: rising', 1, 0.3, { align: 'center', size: 28, weight: 600, alpha: sa });
        p.label(ctx, 'C′ < 0: falling', 6, 0.3, { align: 'center', size: 28, weight: 600, alpha: sa });
        p.dot(ctx, 2, M.DRUG.peak, { r: 13, color: C.slope, alpha: sa });
      }

      fade(ctx, 1 - ease(s.p('interpret', 0, 0.3)), () => D.steps(ctx, [
        { c: '1. Domain: t ≥ 0 hours.  2. C(t) = 10t / (t^{2} + 4)', p: s.p('model', 0.3, 0.6) },
        { c: '3. Quotient rule: C′(t) = [10(t^{2} + 4) − 10t(2t)] / (t^{2} + 4)^{2} = 10(4 − t^{2}) / (t^{2} + 4)^{2}', p: s.p('derivative', 0.1, 0.45), size: 28 },
        { c: '4. C′ = 0 → t = 2   (t = −2 is outside the domain)', p: s.p('derivative', 0.6, 0.85) },
        { c: '5. [0, ∞) is not a closed interval, so the EVT does not apply. C′ is + before 2 and − after,', p: s.p('justify', 0.45, 0.7), size: 28 },
        { c: '    so t = 2 gives the absolute maximum.', p: s.p('justify', 0.55, 0.8), size: 28, gap: 64 },
      ], RX, 790, { size: 30, gap: 50 }));
      // Result banner where the working was.
      fade(ctx, ease(s.p('interpret', 0.2, 0.6)), () => {
        D.card(ctx, RX, 770, 1204, 210, { fill: C.mintSoft, border: false });
        D.check(ctx, RX + 60, 840, 28);
        D.text(ctx, 'Peak: C(2) = ' + fmt(M.DRUG.peak, 1) + ' mg/L, 2 hours after the dose.', RX + 110, 854, { size: 40, weight: 700 });
        D.text(ctx, 'In this model only. Real drug levels depend on the person and the medicine.', RX + 110, 920, { size: 28, color: C.slate });
      });
    },
  };

  // 8. Your turn: the bird's energy has two competing terms.
  scenes.yourTurn = {
    title: 'Your turn',
    draw(ctx, s) {
      D.heading(ctx, 'Your turn · Biology', 'How fast should a migrating bird fly?', s.p('terms', 0, 0.3));
      const p = plotCard(ctx, { x: L, y: 280, w: 1100, h: 710 }, { xMin: 0, xMax: 26, yMin: 0, yMax: 62 });
      p.axes(ctx, { xTicks: [5, 10, 15, 20, 25], yTicks: [20, 40, 60], xLabel: 'v (m/s)' });
      const a1 = ease(s.p('terms', 0.15, 0.4));
      const a2 = ease(s.p('terms', 0.35, 0.6));
      const a3 = ease(s.p('terms', 0.6, 0.85));
      const [lo, hi] = M.BIRD.domain;
      p.curve(ctx, M.drag, { from: lo, to: hi, width: 4, color: C.slate, dash: [14, 10], alpha: a1 });
      p.curve(ctx, M.timeCost, { from: lo, to: hi, width: 4, color: C.stone, dash: [4, 10], alpha: a2 });
      p.curve(ctx, M.bird, { from: lo, to: hi, width: 7, alpha: a3 });
      p.label(ctx, 'drag 0.05v^{2}', 23.5, M.drag(23.5), { dx: -20, dy: 48, align: 'right', size: 28, weight: 600, color: C.slate, alpha: a1 });
      p.label(ctx, 'time cost 100/v', 3.2, M.timeCost(3.2), { dx: 22, size: 28, weight: 600, color: C.steel, alpha: a2 });
      p.label(ctx, 'total E(v)', 13, M.bird(13), { dy: -28, align: 'center', size: 30, weight: 700, color: C.fn, alpha: a3 });
      const RX = 1250;
      D.steps(ctx, [
        { c: 'E(v) = 0.05v^{2} + 100/v', p: s.p('terms', 0.05, 0.25), weight: 600 },
        { c: 'energy per km, arbitrary units', p: s.p('terms', 0.1, 0.3), color: C.slate, size: 28, gap: 44 },
        { c: '2 ≤ v ≤ 25 m/s  (simplified model)', p: s.p('terms', 0.15, 0.35), color: C.slate, size: 28 },
        { c: 'Too slow: the trip takes longer.', p: s.p('terms', 0.4, 0.6), size: 30 },
        { c: 'Too fast: drag grows.', p: s.p('terms', 0.5, 0.7), size: 30 },
      ], RX, 340, { size: 32, gap: 64 });
      const pa = ease(s.p('pause', 0, 0.2)) * (1 - ease(s.p('reveal', 0, 0.15)));
      fade(ctx, pa, () => {
        D.card(ctx, RX - 30, 680, 604, 290, { shadow: true });
        ctx.save();
        ctx.fillStyle = C.ink;
        ctx.fillRect(RX + 4, 724, 12, 40);
        ctx.fillRect(RX + 26, 724, 12, 40);
        ctx.restore();
        D.text(ctx, 'Pause and try it', RX + 60, 758, { size: 36, weight: 600 });
        D.wrap(ctx, 'Find the speed that uses the least energy. Check the ends too. (HW 4.3)', RX + 4, 820, 540, { size: 30 });
      });
      const ra = ease(s.p('reveal', 0.1, 0.4));
      fade(ctx, ra, () => {
        p.dot(ctx, M.BIRD.vStar, M.bird(M.BIRD.vStar), { r: 14, color: C.slope });
        p.label(ctx, 'min', M.BIRD.vStar, M.bird(M.BIRD.vStar), { dy: 56, align: 'center', size: 30, weight: 700, color: C.slope });
        D.card(ctx, RX - 30, 680, 604, 290, { fill: C.surface, border: false });
        D.steps(ctx, [
          { c: "E′(v) = 0.1v − 100/v^{2} = 0", p: s.p('reveal', 0.15, 0.35) },
          { c: 'v^{3} = 1000  →  v = 10 m/s,  E = ' + fmt(M.bird(10), 0), p: s.p('reveal', 0.3, 0.5) },
          { c: 'Ends: E(2) = ' + fmt(M.bird(2), 1) + ',  E(25) = ' + fmt(M.bird(25), 2), p: s.p('reveal', 0.45, 0.65), color: C.slate },
        ], RX, 740, { size: 30, gap: 70 });
      });
    },
  };

  // 9. Recap.
  scenes.recap = {
    title: 'Recap',
    draw(ctx, s) {
      D.heading(ctx, 'Recap', 'Candidates, then proof', s.p('cards', 0, 0.2));
      rail(ctx, -1, ease(s.p('cards', 0.05, 0.3)) > 0.5 ? 5 : 0);
      const cards = [
        ['Design', 'open box from a ' + M.SHEET + ' cm sheet', 'x = ' + frac(M.SHEET, 6) + ' cm,  V ≈ ' + fmt(M.BOX.vMax, 2) + ' cm^{3}', 'V = 0 at both ends'],
        ['Economics', 'p = 100 − 2q,  C = 200 + 20q', 'q = 20,  profit $' + fmt(M.profit(20), 0), 'MR = MC, then P″ < 0'],
        ['Biological science', 'C(t) = 10t / (t^{2} + 4)', 't = 2 h,  ' + fmt(M.DRUG.peak, 1) + ' mg/L', 'sign of C′ (EVT does not apply)'],
      ];
      cards.forEach(([field, model, answer, proof], i) => {
        const a = ease(s.p('cards', 0.2 + i * 0.2, 0.4 + i * 0.2));
        const x = L + i * 588;
        fade(ctx, a, () => {
          D.card(ctx, x, 360, 552, 330);
          D.text(ctx, field, x + 32, 420, { size: 36, weight: 600 });
          D.text(ctx, model, x + 32, 480, { size: 28, color: C.slate });
          D.text(ctx, answer, x + 32, 560, { size: 32, weight: 700 });
          D.check(ctx, x + 48, 630, 18);
          D.text(ctx, proof, x + 80, 640, { size: 28, color: C.slate });
        });
      });
      fade(ctx, ease(s.p('cards', 0.85, 1)), () => {
        D.text(ctx, 'f′ = 0 and endpoints give candidates. A test or a comparison proves the answer.', L, 780, { size: 34, weight: 600 });
      });
      fade(ctx, ease(s.p('next', 0, 0.3)), () => {
        D.text(ctx, 'Practise on the site:', L, 892, { size: 32, weight: 600 });
        let x = L + 330;
        for (const label of ['Homework 3', 'Homework 4', 'Assessment 2', 'Assessment 3', 'Final']) x += D.pill(ctx, label, x, 880, { size: 30, weight: 600, bg: C.ink, color: C.canvas }) + 16;
      });
    },
  };

  root.JeffScenes = scenes;
})(typeof globalThis !== 'undefined' ? globalThis : this);
