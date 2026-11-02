// Alan's scenes. Each draw(ctx, s) paints one frame from the scene clock s:
//   s.p('beat')          0..1 progress through a beat (timing.js sets beat lengths)
//   s.p('beat', a, b)    progress through only the part a..b of that beat
//   s.since('beat')      seconds since the beat began
// All numbers on screen come from AlanMath (math.js), never typed in by hand.
(function (root) {
  'use strict';

  const { draw: D, theme, Plot, fmt, fmtTrim, plotCard } = root.CCT;
  const M = root.AlanMath;
  const C = theme.color;
  const L = theme.stage.left;
  const { ease, lerp, logLerp, clamp, fade, stepped } = D;

  const scenes = {};

  // 1. Hook: two V shapes; zoom in and only one straightens.
  scenes.hook = {
    title: 'Opening question',
    draw(ctx, s) {
      const titleA = 1 - s.p('twoV', 0, 0.3);
      fade(ctx, titleA, () => {
        D.sky(ctx);
        const a = ease(s.p('title', 0, 0.5));
        D.text(ctx, "Zoom In Until It's Straight", 960, 470, { size: theme.size.display, weight: 600, align: 'center', alpha: a });
        D.text(ctx, 'Differentiability and Motion', 960, 560, { size: theme.size.h2, weight: 500, align: 'center', alpha: a, color: C.charcoal });
        D.text(ctx, 'Alan · MCV4U Topic C: Derivatives and Optimization', 960, 640, { size: theme.size.body, align: 'center', alpha: ease(s.p('title', 0.3, 0.8)), color: C.slate });
      });

      const a = ease(s.p('twoV', 0.2, 0.6));
      if (a <= 0) return;
      fade(ctx, a, () => {
        D.heading(ctx, 'Opening question', 'Do both curves have a slope at the bottom?', a);
        const z = logLerp(1, 0.001, ease(s.p('zoom', 0.05, 0.9)));
        const panels = [
          { name: 'Curve A', f: M.smoothV, cy: M.smoothV(0), x: L },
          { name: 'Curve B', f: Math.abs, cy: 0, x: 984 },
        ];
        for (const pn of panels) {
          const hw = 1.1 * z;
          const box = { x: pn.x, y: 280, w: 840, h: 600 };
          const p = plotCard(ctx, box, { xMin: -hw, xMax: hw, yMin: pn.cy - 0.35 * hw, yMax: pn.cy + 1.06 * hw });
          p.axes(ctx, { alpha: 0.6 });
          p.curve(ctx, pn.f, { width: 7 });
          p.dot(ctx, 0, pn.cy, { r: 12 });
          D.text(ctx, pn.name, box.x + 36, box.y + 64, { size: theme.size.h3, weight: 600 });
          D.pill(ctx, 'zoom ×' + Math.round(1 / z), box.x + box.w - 36, box.y + 52, { align: 'right', mono: true, bg: C.surface });
          const q = ease(s.p('question', 0, 0.4));
          if (pn.name === 'Curve A') {
            p.line(ctx, 0, pn.cy, 0, { color: C.slope, width: 4, dash: [16, 12], alpha: q });
            fade(ctx, q, () => D.pill(ctx, 'slope 0', box.x + box.w / 2, box.y + box.h - 60, { align: 'center', bg: C.slopeSoft, color: C.slope, weight: 600 }));
          } else {
            p.line(ctx, 0, 0, -1, { color: C.slope, width: 4, dash: [16, 12], alpha: q });
            p.line(ctx, 0, 0, 1, { color: C.slope, width: 4, dash: [16, 12], alpha: q });
            fade(ctx, q, () => D.pill(ctx, 'slope −1 or +1?', box.x + box.w / 2, box.y + box.h - 60, { align: 'center', bg: C.slopeSoft, color: C.slope, weight: 600 }));
          }
        }
        D.steps(ctx, [
          { c: 'Zoom in on each lowest point. Curve A straightens into a flat line; curve B stays a V at every zoom.', p: s.p('question', 0.1, 0.4) },
          { c: '**Today:** when does a derivative exist, and what does it tell us about motion?', p: s.p('question', 0.5, 0.8) },
        ], L, 940, { size: theme.size.body, gap: 50 });
      });
    },
  };

  // 2. Secant to tangent on f(x) = x² at a = 3.
  scenes.secant = {
    title: 'Secant to tangent',
    draw(ctx, s) {
      D.heading(ctx, '1 · The derivative at a point', 'Secant slopes close in on the tangent slope', s.p('setup', 0, 0.3));
      const box = { x: L, y: 280, w: 900, h: 700 };
      const p = plotCard(ctx, box, { xMin: 0, xMax: 5.6, yMin: -3, yMax: 30 });
      p.axes(ctx, { xTicks: [1, 2, 3, 4, 5], yTicks: [10, 20], xLabel: 'x', yLabel: 'y' });
      p.curve(ctx, M.sq, { from: 0, to: 5.6, width: 6, alpha: ease(s.p('setup', 0.1, 0.5)) });
      p.label(ctx, 'f(x) = x^{2}', 4.1, 25, { size: theme.size.body, weight: 600, color: C.fn, alpha: ease(s.p('setup', 0.3, 0.6)), dx: -260 });

      // Which h is showing: 2 during "secant", shrinking through the table during
      // "shrink", then from the left during "left".
      let h = M.SECANT_H[0];
      let rowsShown = s.p('secant') > 0.5 ? 1 : 0;
      let swap = 1;
      if (s.started('shrink')) {
        const st = stepped(M.SECANT_H, s.p('shrink'));
        h = st.value;
        rowsShown = st.settled + 1;
      }
      if (s.started('left')) {
        // Q jumps to the left side (h = −1) and holds, then shrinks toward P.
        const st = stepped([M.SECANT_H_LEFT[0], ...M.SECANT_H_LEFT], s.p('left'));
        h = st.value;
        rowsShown = M.SECANT_H.length + Math.max(1, st.settled);
        swap = ease(clamp(s.since('left') / 0.8));
      }
      const slope = M.secantSlope(3, h);
      const secantA = swap * ease(s.p('secant', 0, 0.3)) * (1 - ease(s.p('tangent', 0, 0.4)));
      const qx = 3 + h;
      p.line(ctx, 3, 9, slope, { color: C.slope, width: 4, alpha: secantA });
      p.dot(ctx, qx, M.sq(qx), { r: 11, color: C.slope, alpha: secantA });
      // Q's label sits above-left of the point (empty space above x²), and fades as Q reaches P.
      p.label(ctx, 'Q', qx, M.sq(qx), { dx: -48, dy: -16, weight: 600, color: C.slope, alpha: secantA * clamp((Math.abs(h) - 0.08) / 0.3) });

      // Rise and run triangle while h = 2.
      const tri = ease(s.p('secant', 0.3, 0.6)) * (1 - ease(s.p('shrink', 0, 0.12)));
      if (tri > 0) {
        p.segment(ctx, 3, 9, 5, 9, { color: C.ink, width: 3, dash: [10, 8], alpha: tri });
        p.segment(ctx, 5, 9, 5, 25, { color: C.ink, width: 3, dash: [10, 8], alpha: tri });
        p.label(ctx, 'run h = 2', 4, 9, { dy: 44, align: 'center', alpha: tri });
        p.label(ctx, 'rise = 16', 5, 12, { dx: -16, align: 'right', alpha: tri });
      }

      const tan = ease(s.p('tangent', 0.1, 0.5));
      p.line(ctx, 3, 9, M.sqSlope(3), { color: C.slope, width: 6, alpha: tan });
      p.label(ctx, 'tangent: y = 6x − 9', 4.2, M.tangentAt3(4.2), { dx: 24, dy: 44, color: C.slope, weight: 600, alpha: tan });
      p.dot(ctx, 3, 9, { r: 12, alpha: ease(s.p('setup', 0.3, 0.6)) });
      p.label(ctx, 'P(3, 9)', 3, 9, { dx: -22, dy: -18, align: 'right', weight: 600, alpha: ease(s.p('setup', 0.3, 0.6)) });

      const RX = 1080;
      // Right column, part 1: the slope formula and a table of h values.
      const tableA = ease(s.p('secant', 0.2, 0.5)) * (1 - ease(s.p('algebra', 0, 0.15)));
      fade(ctx, tableA, () => {
        D.text(ctx, 'slope of PQ =', RX, 352, { size: theme.size.body });
        D.frac(ctx, 'f(3 + h) − f(3)', 'h', RX + 220, 340, { size: theme.size.body });
        D.pill(ctx, 'h = ' + fmtTrim(h, 3) + '    slope = ' + fmtTrim(slope, 3), RX, 450, { mono: true, size: 30, bg: C.slopeSoft, color: C.slope, weight: 600 });
        const rows = [...M.SECANT_H, ...M.SECANT_H_LEFT];
        const ty = 520;
        D.text(ctx, 'h', RX + 40, ty, { size: 28, weight: 600, color: C.steel });
        D.text(ctx, 'secant slope', RX + 260, ty, { size: 28, weight: 600, color: C.steel });
        rows.forEach((hv, i) => {
          if (i >= rowsShown) return;
          const y = ty + 52 + i * 50;
          D.text(ctx, fmtTrim(hv, 3), RX + 40, y, { size: 30, mono: true });
          D.text(ctx, fmtTrim(M.secantSlope(3, hv), 3), RX + 260, y, { size: 30, mono: true, color: C.slope });
        });
        // Brackets group the rows by side once both sides are in the table.
        const ba = s.started('left') ? ease(s.p('left', 0.75, 1)) : 0;
        const rowY = (i) => ty + 52 + i * 50;
        const bracket = (i0, i1, label) => {
          const x = RX + 420;
          ctx.save();
          ctx.globalAlpha *= ba;
          ctx.strokeStyle = C.steel;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, rowY(i0) - 30); ctx.lineTo(x + 14, rowY(i0) - 30); ctx.lineTo(x + 14, rowY(i1) + 10); ctx.lineTo(x, rowY(i1) + 10);
          ctx.stroke();
          ctx.restore();
          D.text(ctx, label, x + 34, (rowY(i0) + rowY(i1)) / 2 - 2, { size: 28, color: C.steel, alpha: ba });
        };
        bracket(0, 4, 'h > 0: from the right');
        bracket(5, 7, 'h < 0: from the left');
        D.pill(ctx, 'both sides → 6', RX + 454, rowY(4.5) - 10, { size: 30, weight: 700, bg: C.slopeSoft, color: C.slope, alpha: ba });
      });

      // Right column, part 2: the algebra behind the table.
      fade(ctx, ease(s.p('algebra', 0.1, 0.3)), () => {
        D.text(ctx, 'Why the slope is 6 + h', RX, 352, { size: theme.size.h3, weight: 600 });
        D.steps(ctx, [
          { c: '[f(3 + h) − f(3)] / h', p: s.p('algebra', 0.1, 0.25) },
          { c: '= [(3 + h)^{2} − 9] / h', p: s.p('algebra', 0.2, 0.35) },
          { c: '= (9 + 6h + h^{2} − 9) / h', p: s.p('algebra', 0.35, 0.5) },
          { c: '= (6h + h^{2}) / h = 6 + h,   h ≠ 0', p: s.p('algebra', 0.5, 0.65) },
          { c: ["f′(3) = lim_{h→0} (6 + h) = ", ['6', C.slope, 700]], p: s.p('algebra', 0.7, 0.85) },
        ], RX, 440, { size: 36, gap: 76 });
      });
      fade(ctx, ease(s.p('tangent', 0.4, 0.7)), () => {
        D.card(ctx, RX, 820, 744, 150, { fill: C.surface, border: false });
        D.check(ctx, RX + 52, 870, 22);
        D.text(ctx, 'The tangent slope at x = 3 is 6.', RX + 92, 882, { size: 32, weight: 600 });
        D.text(ctx, 'Same steps at x = a give f′(a) = 2a (HW 1.4).', RX + 92, 936, { size: 28, color: C.slate });
      });
    },
  };

  // 3. The derivative microscope: zooming straightens x² but not |x − 2|.
  scenes.microscope = {
    title: 'Derivative microscope',
    draw(ctx, s) {
      D.heading(ctx, '2 · Local linearity', 'Zoom in: a differentiable curve becomes its tangent', s.p('lensSmooth', 0, 0.2));
      const cornerMix = ease(s.p('lensCorner', 0, 0.12));
      const box = { x: L, y: 280, w: 800, h: 700 };
      const lensX = 1380;
      const lensY = 630;
      const lensR = 290;
      const lensA = 1 - ease(s.p('oneSided', 0, 0.15));

      // Left: the whole graph, with a small circle marking where the lens looks.
      const smooth = { f: M.sq, x0: 3, win: { xMin: 0, xMax: 5, yMin: -2, yMax: 26 }, ticks: [[1, 2, 3, 4], [10, 20]], name: 'f(x) = x^{2}', at: [0.4, 22] };
      const corner = { f: M.corner, x0: 2, win: { xMin: -0.5, xMax: 4.5, yMin: -1, yMax: 3 }, ticks: [[1, 2, 3, 4], [1, 2]], name: 'g(x) = |x − 2|', at: [1.3, 2.75] };
      const cur = cornerMix < 0.5 ? smooth : corner;
      const swapA = cornerMix < 0.5 ? 1 - cornerMix * 2 : (cornerMix - 0.5) * 2;
      const p = plotCard(ctx, box, cur.win);
      fade(ctx, swapA, () => {
        p.axes(ctx, { xTicks: cur.ticks[0], yTicks: cur.ticks[1], xLabel: 'x', yLabel: 'y' });
        p.curve(ctx, cur.f, { width: 6 });
        p.label(ctx, cur.name, cur.at[0], cur.at[1], { weight: 600, color: C.fn, size: 32 });
        const y0 = cur.f(cur.x0);
        p.dot(ctx, cur.x0, y0, { r: 10 });
        fade(ctx, lensA, () => {
          ctx.save();
          ctx.strokeStyle = C.ink;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(p.X(cur.x0), p.Y(y0), 34, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([8, 10]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.X(cur.x0) + 34, p.Y(y0));
          ctx.lineTo(lensX - lensR, lensY);
          ctx.stroke();
          ctx.restore();
        });

        // Secants from both sides on the corner, during the one-sided beat.
        if (cur === corner && s.started('oneSided')) {
          const h = logLerp(1.2, 0.05, ease(s.p('oneSided', 0.05, 0.6)));
          const a = ease(s.p('oneSided', 0, 0.2));
          p.line(ctx, 2, 0, M.dq(M.corner, 2, -h), { color: C.slope, width: 4, dash: [14, 10], alpha: a });
          p.line(ctx, 2, 0, M.dq(M.corner, 2, h), { color: C.slope, width: 4, alpha: a });
          p.dot(ctx, 2 - h, M.corner(2 - h), { color: C.slope, alpha: a });
          p.dot(ctx, 2 + h, M.corner(2 + h), { color: C.slope, alpha: a });
          p.label(ctx, 'h = ±' + fmtTrim(h, 2), 4.4, 0.45, { align: 'right', mono: true, alpha: a });
        }
      });

      // Right: the lens. Its view shrinks exponentially, so each second zooms by the same factor.
      const phase = s.started('lensCorner') ? 'lensCorner' : 'lensSmooth';
      const hw = logLerp(1.2, 0.002, ease(s.p(phase, 0.15, 0.85)));
      fade(ctx, lensA * swapA, () => {
        D.lens(ctx, lensX, lensY, lensR, () => {
          const box2 = { x: lensX - lensR, y: lensY - lensR, w: lensR * 2, h: lensR * 2 };
          if (cur === smooth) {
            // y is stretched by 6 so that a slope of 6 shows at 45°.
            const lp = new Plot(box2, { xMin: 3 - hw, xMax: 3 + hw, yMin: 9 - 6 * hw, yMax: 9 + 6 * hw });
            lp.curve(ctx, M.sq, { width: 10 });
            lp.line(ctx, 3, 9, 6, { color: C.slope, width: 4, dash: [16, 12] });
            lp.dot(ctx, 3, 9, { r: 12 });
          } else {
            const lp = new Plot(box2, { xMin: 2 - hw, xMax: 2 + hw, yMin: -0.5 * hw, yMax: 1.5 * hw });
            lp.curve(ctx, M.corner, { width: 8 });
            lp.dot(ctx, 2, 0, { r: 12 });
          }
        });
        D.pill(ctx, 'zoom ×' + Math.round(1.2 / hw) + '   view width ' + fmtTrim(2 * hw, 3), lensX, lensY + lensR + 50, { align: 'center', mono: true });
        const msg = cur === smooth
          ? ['The curve and its tangent (dashed) become one line of slope 6.', s.p('lensSmooth', 0.6, 0.8)]
          : ['The corner never straightens: slope −1 on the left, +1 on the right.', s.p('lensCorner', 0.6, 0.8)];
        D.text(ctx, msg[0], lensX, 300, { align: 'center', size: 30, color: C.slate, alpha: ease(msg[1]) });
      });

      // One-sided limits replace the lens.
      fade(ctx, ease(s.p('oneSided', 0.15, 0.35)), () => {
        const X = 960;
        D.text(ctx, 'One-sided difference quotients at x = 2', X, 330, { size: theme.size.h3, weight: 600 });
        D.steps(ctx, [
          { c: ['Left, h < 0:   |h| / h = −h / h = ', ['−1', C.slope, 700]], p: s.p('oneSided', 0.25, 0.4) },
          { c: ['Right, h > 0:  |h| / h = h / h = ', ['+1', C.slope, 700]], p: s.p('oneSided', 0.35, 0.5) },
          { c: 'As h → 0⁻ the limit is −1;  as h → 0⁺ it is +1.', p: s.p('oneSided', 0.5, 0.65) },
        ], X, 420, { size: 34, gap: 74 });
        const a = ease(s.p('oneSided', 0.65, 0.8));
        D.card(ctx, X, 660, 864, 210, { fill: C.surface, border: false, alpha: a });
        D.cross(ctx, X + 52, 712, 22, { alpha: a });
        D.text(ctx, 'g′(2) does not exist.', X + 92, 724, { size: 34, weight: 600, alpha: a });
        D.text(ctx, 'g is continuous at 2 (no gap) but not differentiable.', X + 92, 780, { size: 28, color: C.slate, alpha: a });
        D.text(ctx, 'Practice: HW 1.1 · Final Q1', X + 92, 830, { size: 28, color: C.slate, alpha: a });
      });
    },
  };

  // 4. Gallery: four graphs, secants from both sides shrinking together.
  const GALLERY = [
    { name: 'Corner', formula: '|x|', f: M.vee, win: [-1.5, 1.5, -0.5, 1.6], verdict: 'slopes disagree' },
    { name: 'Cusp', formula: 'x^{2/3}', f: M.cusp, win: [-1.5, 1.5, -0.4, 1.6], verdict: 'opposite infinities' },
    { name: 'Vertical tangent', formula: 'x^{1/3}', f: M.vtan, win: [-1.5, 1.5, -1.3, 1.3], verdict: 'both → +∞' },
    { name: 'Jump', formula: 'x, then x + 1', f: M.jump, win: [-1.5, 1.5, -1.2, 2.4], verdict: 'not continuous', jump: true },
  ];

  scenes.gallery = {
    title: 'Gallery of failures',
    draw(ctx, s) {
      D.heading(ctx, '3 · When the derivative fails', 'Four ways a derivative can fail to exist at x = 0', s.p('grid', 0, 0.3));
      const back = 1 - 0.94 * ease(s.p('logic', 0, 0.2));
      const h = logLerp(1, 0.001, ease(s.p('secants', 0.05, 0.85)));
      fade(ctx, back, () => {
        GALLERY.forEach((g, i) => {
          const a = ease(s.p('grid', 0.1 + i * 0.15, 0.4 + i * 0.15));
          if (a <= 0) return;
          fade(ctx, a, () => {
            const bx = i % 2 ? 984 : L;
            const by = i < 2 ? 280 : 650;
            D.card(ctx, bx, by, 840, 350);
            const p = new Plot({ x: bx + 30, y: by + 70, w: 430, h: 260 }, { xMin: g.win[0], xMax: g.win[1], yMin: g.win[2], yMax: g.win[3] });
            p.axes(ctx, { alpha: 0.7 });
            p.curve(ctx, g.f, { width: 5, breakAt: g.jump ? [0] : [] });
            if (g.jump) { p.dot(ctx, 0, 0, { hollow: true, r: 9, color: C.fn }); p.dot(ctx, 0, 1, { r: 9, color: C.fn }); }
            else p.dot(ctx, 0, g.f(0), { r: 9 });
            D.text(ctx, [g.name + '  ', [g.formula, C.fn, 600]], bx + 30, by + 52, { size: 32, weight: 600 });

            const sa = ease(s.p('secants', 0, 0.1));
            if (sa > 0) {
              const left = M.dq(g.f, 0, -h);
              const right = M.dq(g.f, 0, h);
              p.line(ctx, 0, g.f(0), left, { color: C.slope, width: 3, dash: [12, 9], alpha: sa });
              p.line(ctx, 0, g.f(0), right, { color: C.slope, width: 3, alpha: sa });
              const rx = bx + 500;
              D.text(ctx, 'h = ' + fmtTrim(h, 3), rx, by + 120, { size: 28, mono: true, color: C.steel, alpha: sa });
              D.text(ctx, 'left   ' + fmt(left, 1), rx, by + 175, { size: 30, mono: true, color: C.slope, alpha: sa });
              D.text(ctx, 'right  ' + fmt(right, 1), rx, by + 225, { size: 30, mono: true, color: C.slope, alpha: sa });
            }
            const va = ease(s.p('secants', 0.85, 1));
            if (va > 0) {
              D.cross(ctx, bx + 520, by + 290, 18, { alpha: va });
              D.text(ctx, g.verdict, bx + 550, by + 300, { size: 28, weight: 600, alpha: va });
            }
          });
        });
      });

      // Logic: differentiable ⇒ continuous, but not the other way round.
      const la = ease(s.p('logic', 0.1, 0.3)) * (1 - ease(s.p('verdict', 0, 0.2)));
      fade(ctx, la, () => {
        D.card(ctx, 216, 290, 1488, 690, { shadow: true });
        D.check(ctx, 290, 370, 22);
        D.text(ctx, '**differentiable** at a  ⇒  **continuous** at a', 330, 382, { size: 36 });
        D.cross(ctx, 290, 440, 22);
        D.text(ctx, '**continuous** at a  ⇏  **differentiable** at a', 330, 452, { size: 36 });
        const va = ease(s.p('logic', 0.35, 0.6));
        fade(ctx, va, () => {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(960, 720, 640, 210, 0, 0, Math.PI * 2);
          ctx.fillStyle = C.fnSoft;
          ctx.fill();
          ctx.strokeStyle = C.fn;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(700, 730, 300, 140, 0, 0, Math.PI * 2);
          ctx.fillStyle = C.mintSoft;
          ctx.fill();
          ctx.strokeStyle = C.mintDeep;
          ctx.stroke();
          ctx.restore();
          D.text(ctx, 'continuous at a', 960, 560, { size: 30, weight: 600, color: C.fn, align: 'center' });
          D.text(ctx, 'differentiable at a', 700, 690, { size: 30, weight: 600, align: 'center' });
          D.text(ctx, 'x^{2} at 3', 700, 760, { size: 30, align: 'center', color: C.slate });
          D.text(ctx, 'corner', 1190, 680, { size: 30, align: 'center' });
          D.text(ctx, 'cusp', 1340, 740, { size: 30, align: 'center' });
          D.text(ctx, 'vertical tangent', 1190, 820, { size: 30, align: 'center' });
          D.text(ctx, 'jump: outside both', 1660, 900, { size: 30, align: 'right', color: C.slate });
        });
      });

      fade(ctx, ease(s.p('verdict', 0.1, 0.35)), () => {
        D.card(ctx, 216, 400, 1488, 420, { shadow: true });
        D.text(ctx, 'f′(a) exists only when the difference quotient', 290, 500, { size: 40, weight: 600 });
        D.text(ctx, 'has a finite limit from the left and from the right,', 290, 560, { size: 40, weight: 600 });
        D.text(ctx, 'and the two limits are equal.', 290, 620, { size: 40, weight: 600 });
        D.text(ctx, 'Practice: HW 1.5 (cusp or vertical tangent?) · Assessment 1 Q1', 290, 720, { size: 30, color: C.slate });
      });
    },
  };

  // 5. Piecewise: slide b to close the gap, then pivot to match slopes.
  scenes.piecewise = {
    title: 'Piecewise matching',
    draw(ctx, s) {
      D.heading(ctx, '4 · Piecewise functions', 'Match the values first, then the slopes', s.p('setup', 0, 0.3));
      const start = M.PW_START;
      let m = start.m;
      let b = start.b;
      if (s.started('continuity')) b = lerp(start.b, M.continuousB(start.m), ease(s.p('continuity', 0.2, 0.7)));
      if (s.started('pivot')) {
        const over = 3.2;
        const q = s.p('pivot');
        m = q < 0.5 ? lerp(start.m, over, ease(q / 0.45)) : lerp(over, M.PW.m, ease((q - 0.5) / 0.35));
        b = M.continuousB(m);
      }
      const box = { x: L, y: 280, w: 940, h: 700 };
      const p = plotCard(ctx, box, { xMin: -1.5, xMax: 3, yMin: -1.5, yMax: 6 });
      p.axes(ctx, { xTicks: [-1, 1, 2, 3], yTicks: [1, 2, 3, 4, 5], xLabel: 'x', yLabel: 'y' });
      p.vline(ctx, 1, { alpha: 0.6 });
      p.curve(ctx, M.sq, { from: -1.5, to: 1, width: 6 });
      p.curve(ctx, M.pwRight(m, b), { from: 1, to: 3, width: 6, color: C.slate });
      p.dot(ctx, 1, 1, { r: 10, color: C.fn });
      const gap = M.pwGap(m, b);
      if (Math.abs(gap) > 0.02) {
        p.dot(ctx, 1, m + b, { r: 10, hollow: true, color: C.slate });
        p.segment(ctx, 1, 1, 1, m + b, { color: C.error, width: 4, dash: [8, 8] });
        p.label(ctx, 'gap ' + fmt(gap, 2), 1, (1 + m + b) / 2, { dx: 20, color: C.error, weight: 600 });
      }
      p.label(ctx, 'x^{2},  x ≤ 1', -1.3, 4.6, { color: C.fn, weight: 600 });
      p.label(ctx, 'mx + b,  x > 1', 1.55, 0.4, { color: C.slate, weight: 600 });

      // Lens on the joining point during the pivot.
      const la = ease(s.p('pivot', 0, 0.15)) * (1 - ease(s.p('solve', 0, 0.2)));
      const RX = 1110;
      fade(ctx, la, () => {
        D.lens(ctx, 1590, 470, 170, () => {
          const hw = 0.08;
          const lp = new Plot({ x: 1420, y: 300, w: 340, h: 340 }, { xMin: 1 - hw, xMax: 1 + hw, yMin: 1 - 2 * hw, yMax: 1 + 2 * hw });
          lp.curve(ctx, M.sq, { from: 1 - hw, to: 1, width: 7 });
          lp.curve(ctx, M.pwRight(m, b), { from: 1, to: 1 + hw, width: 7, color: C.slate });
          lp.dot(ctx, 1, 1, { r: 9, color: C.fn });
        });
        D.text(ctx, 'zoom on (1, 1)', 1590, 690, { align: 'center', size: 28, color: C.steel });
        D.text(ctx, 'left slope   2x at x = 1  =  2', RX, 760, { size: 32, mono: true });
        D.text(ctx, 'right slope  m  =  ' + fmt(m, 2), RX, 820, { size: 32, mono: true, color: Math.abs(m - 2) < 0.01 ? C.ink : C.slope });
        if (Math.abs(m - 2) < 0.01) { D.check(ctx, RX + 22, 880, 20); D.text(ctx, 'slopes match: smooth join', RX + 56, 890, { size: 30, weight: 600 }); }
      });

      // Continuity note during the slide.
      fade(ctx, ease(s.p('setup', 0.3, 0.6)) * (1 - ease(s.p('pivot', 0, 0.15))), () => {
        D.text(ctx, 'Find m and b so f is', RX, 350, { size: 34 });
        D.text(ctx, 'differentiable at x = 1.', RX, 400, { size: 34 });
        D.text(ctx, 'right value at 1:  m + b = ' + fmt(m + b, 2), RX, 500, { size: 32, mono: true });
        D.text(ctx, 'left value at 1:   1^{2} = 1', RX, 556, { size: 32, mono: true });
        if (s.p('continuity') > 0.75) { D.check(ctx, RX + 22, 640, 20); D.text(ctx, 'values match: m + b = 1', RX + 56, 650, { size: 30, weight: 600 }); }
        D.text(ctx, 'Keep b = 1 − m and the line pivots about (1, 1).', RX, 730, { size: 28, color: C.slate, alpha: ease(s.p('continuity', 0.8, 1)) });
      });

      fade(ctx, ease(s.p('solve', 0.1, 0.3)), () => {
        D.text(ctx, 'Solve it in two conditions', RX, 330, { size: theme.size.h3, weight: 600 });
        D.steps(ctx, [
          { c: '1. Values:  1^{2} = m(1) + b  ⇒  m + b = 1', p: s.p('solve', 0.15, 0.3) },
          { c: '2. Slopes:  2(1) = m  ⇒  m = ' + M.PW.m, p: s.p('solve', 0.3, 0.45) },
          { c: '3. So b = 1 − ' + M.PW.m + ' = ' + fmt(M.PW.b, 0) + ',  f(x) = 2x − 1 for x > 1', p: s.p('solve', 0.45, 0.6) },
          { c: 'Continuity first: matching slopes alone is not enough.', p: s.p('solve', 0.65, 0.8), color: C.slate },
          { c: 'Practice: HW 1.2 · Assessment 1 Q2 · Final Q4', p: s.p('solve', 0.8, 0.95), color: C.slate, size: 28 },
        ], RX, 420, { size: 30, gap: 82 });
      });
    },
  };

  // 6. Bridge: x becomes time t, the curve becomes a position graph.
  scenes.bridge = {
    title: 'From slopes to motion',
    draw(ctx, s) {
      D.heading(ctx, 'From slopes to motion', 'When x is time, the slope is a rate', s.p('morph', 0, 0.3));
      const k = ease(s.p('morph', 0.2, 0.8));
      const box = { x: L, y: 280, w: 1000, h: 700 };
      const p = plotCard(ctx, box, { xMin: 0, xMax: 5, yMin: -2, yMax: 22 });
      p.axes(ctx, { xTicks: [1, 2, 3, 4, 5], yTicks: [10, 20] });
      const g = (x) => (1 - k) * 0.8 * x * x + k * M.s(x);
      p.curve(ctx, g, { width: 6 });
      D.text(ctx, k < 0.5 ? 'x' : 't (s)', box.x + box.w - 40, p.Y(0) - 18, { align: 'right', color: C.slate, size: 30, alpha: Math.abs(1 - 2 * k) });
      D.text(ctx, k < 0.5 ? 'y' : 's (m)', p.X(0) + 16, box.y + 66, { color: C.slate, size: 30, alpha: Math.abs(1 - 2 * k) });
      const t0 = lerp(0.6, 4.4, ease(s.p('message', 0, 1)));
      const ta = ease(s.p('morph', 0.85, 1));
      p.line(ctx, t0, M.s(t0), M.v(t0), { color: C.slope, width: 4, alpha: ta * k });
      p.dot(ctx, t0, M.s(t0), { alpha: ta * k });
      const RX = 1180;
      D.steps(ctx, [
        { c: [['s(t)', C.fn, 700], '   position, in m'], p: s.p('morph', 0.8, 1) },
        { c: [['v(t) = s′(t)', C.slope, 700], '   velocity, in m/s'], p: s.p('message', 0, 0.25) },
        { c: [['a(t) = v′(t)', C.accel, 700], '   acceleration, in m/s^{2}'], p: s.p('message', 0.25, 0.5) },
        { c: 'The slope of the position graph', p: s.p('message', 0.5, 0.75), color: C.slate, gap: 48 },
        { c: 'is the velocity at that instant.', p: s.p('message', 0.5, 0.75), color: C.slate, gap: 64 },
        { c: ['slope now = v(' + fmt(t0, 1) + ') = ', [fmt(M.v(t0), 2) + ' m/s', C.slope, 700]], p: s.p('message', 0.6, 0.85), mono: true, size: 30 },
      ], RX, 380, { size: 34, gap: 90 });
    },
  };

  // Shared drawing for scenes 7-9: the particle on a horizontal number line.
  const TRACK = { x0: 200, x1: 1720, sMin: -2, sMax: 22 };
  const trackX = (sv) => TRACK.x0 + (sv - TRACK.sMin) / (TRACK.sMax - TRACK.sMin) * (TRACK.x1 - TRACK.x0);
  function track(ctx, y, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.strokeStyle = C.muted;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(TRACK.x0 - 40, y); ctx.lineTo(TRACK.x1 + 40, y); ctx.stroke();
    for (let v = 0; v <= 20; v += 4) {
      ctx.beginPath(); ctx.moveTo(trackX(v), y - 10); ctx.lineTo(trackX(v), y + 10); ctx.stroke();
      D.text(ctx, String(v), trackX(v), y + 46, { size: 28, color: C.steel, align: 'center' });
    }
    D.text(ctx, 's (m)', TRACK.x1 + 60, y + 10, { size: 28, color: C.slate });
    ctx.restore();
  }
  function particle(ctx, y, t, o = {}) {
    const x = trackX(M.s(t));
    // Arrow length shows size (16 px per m/s, 10 px per m/s²), capped so it stays on screen.
    if (o.arrows !== false) {
      const len = (val, k, cap) => Math.sign(val) * Math.min(Math.abs(val) * k, cap);
      const vv = M.v(t);
      if (Math.abs(vv) > 0.05) D.arrow(ctx, x, y - 34, x + len(vv, 16, 210), y - 34, { color: C.slope, width: 6, head: 22 });
      const aa = M.a(t);
      if (Math.abs(aa) > 0.05) D.arrow(ctx, x, y + 34, x + len(aa, 10, 160), y + 34, { color: C.accel, width: 6, head: 22, alpha: o.accelAlpha == null ? 1 : o.accelAlpha });
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = C.fn;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = C.canvas;
    ctx.stroke();
    ctx.restore();
  }

  // 7. Motion: particle plus synchronized s, v, a graphs.
  scenes.motion = {
    title: 'Position, velocity, acceleration',
    draw(ctx, s) {
      D.heading(ctx, '5 · Position, velocity, acceleration', 'One particle, three graphs', s.p('setup', 0, 0.3));
      let tau = 0;
      if (s.started('run')) tau = M.T_END * s.p('run', 0.03, 0.97);
      if (s.started('read')) tau = lerp(M.T_END, 2, ease(s.p('read', 0, 0.3)));

      const TY = 345;
      track(ctx, TY);
      particle(ctx, TY, tau);
      D.text(ctx, 'v', trackX(M.s(tau)) + (M.v(tau) >= 0 ? -36 : 18), TY - 52, { size: 28, color: C.slope, weight: 700 });

      const graphs = [
        { f: M.s, win: [-2, 22], color: C.fn, name: 's(t)', y: 420, ticks: [0, 20] },
        { f: M.v, win: [-6, 26], color: C.slope, name: 'v(t)', y: 612, ticks: [0, 20] },
        { f: M.a, win: [-14, 20], color: C.accel, name: 'a(t)', y: 804, ticks: [-12, 0, 18] },
      ];
      const plots = graphs.map((g) => {
        D.card(ctx, L, g.y, 1180, 180);
        const p = new Plot({ x: L + 190, y: g.y + 14, w: 960, h: 150 }, { xMin: 0, xMax: 5, yMin: g.win[0], yMax: g.win[1] });
        p.axes(ctx, { xTicks: g === graphs[2] ? [1, 2, 3, 4, 5] : [], yTicks: g.ticks });
        p.curve(ctx, g.f, { from: 0, to: Math.max(tau, 0.0001), color: g.color, width: 5 });
        D.text(ctx, g.name, L + 24, g.y + 56, { size: 30, weight: 700, color: g.color });
        return p;
      });
      // Playhead through all three graphs.
      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(plots[0].X(tau), 420); ctx.lineTo(plots[0].X(tau), 984); ctx.stroke();
      ctx.restore();
      plots.forEach((p, i) => p.dot(ctx, tau, graphs[i].f(tau), { r: 9, color: graphs[i].color }));

      // At rest when v = 0: flat tangent on s, zero of v, turning on the track.
      const ra = ease(s.p('rest', 0, 0.3)) * (1 - ease(s.p('read', 0, 0.2)));
      if (ra > 0) {
        for (const tr of M.REST_TIMES) {
          plots[0].segment(ctx, tr - 0.45, M.s(tr), tr + 0.45, M.s(tr), { color: C.slope, width: 4, alpha: ra });
          plots[0].dot(ctx, tr, M.s(tr), { r: 9, alpha: ra });
          plots[1].dot(ctx, tr, 0, { r: 10, color: C.slope, alpha: ra });
          plots[1].label(ctx, 't = ' + tr, tr, 0, { dx: -30, dy: 46, size: 28, weight: 600, alpha: ra });
          fade(ctx, ra, () => D.pill(ctx, 'turns at t = ' + tr, trackX(M.s(tr)), TY - 58, { align: 'center', size: 28, bg: C.slopeSoft, color: C.slope, weight: 600 }));
        }
      }
      // Reading slopes at t = 2.
      const da = ease(s.p('read', 0.3, 0.5));
      if (da > 0) {
        plots[0].line(ctx, tau, M.s(tau), M.v(tau), { color: C.slope, width: 4, alpha: da });
        plots[1].line(ctx, tau, M.v(tau), M.a(tau), { color: C.accel, width: 4, alpha: da });
      }

      const RX = 1330;
      D.steps(ctx, [
        { c: [['s(t) = t^{3} − 6t^{2} + 9t', C.fn, 600]], p: s.p('setup', 0.2, 0.4) },
        { c: [['v(t) = 3t^{2} − 12t + 9', C.slope, 600]], p: s.p('setup', 0.4, 0.6) },
        { c: '     = 3(t − 1)(t − 3)', p: s.p('setup', 0.5, 0.7), color: C.slope, gap: 64 },
        { c: [['a(t) = 6t − 12', C.accel, 600]], p: s.p('setup', 0.65, 0.85) },
      ], RX, 440, { size: 32, gap: 58 });
      const ro = ease(s.p('setup', 0.8, 1));
      fade(ctx, ro, () => {
        D.card(ctx, RX - 24, 700, 520, 290, { fill: C.surface, border: false });
        D.text(ctx, 't = ' + fmt(tau, 2) + ' s', RX, 752, { size: 30, mono: true });
        D.text(ctx, 's = ' + fmt(M.s(tau), 2) + ' m', RX, 806, { size: 30, mono: true, color: C.fn });
        D.text(ctx, 'v = ' + fmt(M.v(tau), 2) + ' m/s', RX, 860, { size: 30, mono: true, color: C.slope });
        D.text(ctx, 'a = ' + fmt(M.a(tau), 2) + ' m/s^{2}', RX, 914, { size: 30, mono: true, color: C.accel });
        D.text(ctx, M.v(tau) > 0.005 ? 'moving right' : M.v(tau) < -0.005 ? 'moving left' : 'at rest', RX, 966, { size: 28, color: C.slate, weight: 600 });
      });
      // Notes inside the graph cards: the slope of each graph is the value of the next one.
      fade(ctx, ease(s.p('read', 0.5, 0.7)), () => {
        D.pill(ctx, 'slope of s at t = 2  =  v(2)  =  ' + fmt(M.v(2), 0) + ' m/s', L + 1160, graphs[0].y + 40, { align: 'right', size: 28, weight: 600, bg: C.slopeSoft, color: C.slope });
        D.pill(ctx, 'slope of v at t = 2  =  a(2)  =  ' + fmt(M.a(2), 0) + ' m/s^{2}', L + 1160, graphs[1].y + 40, { align: 'right', size: 28, weight: 600, bg: C.accelSoft, color: C.ink });
      });
    },
  };

  // 8. Speeding up vs slowing down: sign chart, speed graph and a prediction.
  const T_CUTS = [0, 1, 2, 3, 5];
  scenes.speed = {
    title: 'Speeding up or slowing down',
    draw(ctx, s) {
      D.heading(ctx, '6 · Speeding up or slowing down', 'Compare the signs of v and a', s.p('chart', 0, 0.3));
      // Sign chart. Columns are the intervals between t = 0, 1, 2, 3, 5.
      const cx0 = 560;
      const cx1 = 1800;
      const colX = (t) => cx0 + (t / 5) * (cx1 - cx0);
      const y0 = 280;
      D.card(ctx, L, y0, 1728, 300);
      const rows = [
        { label: 't (s)', y: y0 + 58 },
        { label: 'v = 3(t − 1)(t − 3)', y: y0 + 122, color: C.slope, f: M.v },
        { label: 'a = 6(t − 2)', y: y0 + 186, color: C.accel, f: M.a },
        { label: 'speed is', y: y0 + 254 },
      ];
      rows.forEach((r, i) => {
        const a = ease(s.p('chart', i * 0.2, i * 0.2 + 0.2));
        D.text(ctx, r.label, L + 30, r.y, { size: 30, weight: 600, color: r.color || C.ink, alpha: a });
      });
      T_CUTS.forEach((t) => D.text(ctx, String(t), colX(t), y0 + 58, { size: 30, mono: true, align: 'center', alpha: ease(s.p('chart', 0, 0.2)) }));
      for (let i = 0; i < T_CUTS.length - 1; i++) {
        const mid = (T_CUTS[i] + T_CUTS[i + 1]) / 2;
        const x = (colX(T_CUTS[i]) + colX(T_CUTS[i + 1])) / 2;
        const sv = M.v(mid) > 0 ? '+' : '−';
        const sa = M.a(mid) > 0 ? '+' : '−';
        D.text(ctx, sv, x, y0 + 126, { size: 40, weight: 700, align: 'center', color: C.slope, alpha: ease(s.p('chart', 0.2 + i * 0.05, 0.3 + i * 0.05)) });
        D.text(ctx, sa, x, y0 + 190, { size: 40, weight: 700, align: 'center', color: C.accel, alpha: ease(s.p('chart', 0.4 + i * 0.05, 0.5 + i * 0.05)) });
        const st = M.motionState(mid);
        fade(ctx, ease(s.p('chart', 0.6 + i * 0.08, 0.7 + i * 0.08)), () => {
          D.pill(ctx, st === 'speeding' ? 'speeding up' : 'slowing down', x, y0 + 244, { align: 'center', size: 28, weight: 600, bg: st === 'speeding' ? C.mintSoft : C.accelSoft });
        });
      }

      // Replay: track and a speed graph |v| with shaded intervals.
      const rp = s.started('replay') ? s.p('replay', 0.03, 0.97) : 0;
      const tau = s.started('predict') ? 2.5 : M.T_END * rp;
      const ga = ease(s.p('replay', 0, 0.12));
      fade(ctx, ga, () => {
        track(ctx, 640);
        particle(ctx, 640, tau);
        D.card(ctx, L, 720, 1100, 270);
        const p = new Plot({ x: L + 200, y: 740, w: 870, h: 200 }, { xMin: 0, xMax: 5, yMin: 0, yMax: 26 });
        for (let i = 0; i < T_CUTS.length - 1; i++) {
          const st = M.motionState((T_CUTS[i] + T_CUTS[i + 1]) / 2);
          p.band(ctx, T_CUTS[i], T_CUTS[i + 1], { color: st === 'speeding' ? C.mintSoft : C.accelSoft });
        }
        p.axes(ctx, { xTicks: [1, 2, 3, 4, 5], yTicks: [10, 20] });
        p.curve(ctx, (t) => Math.abs(M.v(t)), { from: 0, to: Math.max(tau, 1e-4), color: C.ink, width: 5 });
        p.dot(ctx, tau, Math.abs(M.v(tau)), { r: 9 });
        D.text(ctx, 'speed |v|', L + 24, 776, { size: 28, weight: 700 });

        // Speedometer.
        const gx = 1500;
        const gy = 920;
        const gr = 200;
        ctx.save();
        ctx.lineWidth = 24;
        ctx.strokeStyle = C.hairline;
        ctx.beginPath(); ctx.arc(gx, gy, gr, Math.PI, 2 * Math.PI); ctx.stroke();
        const sp = Math.abs(M.v(tau));
        ctx.strokeStyle = M.motionState(tau) === 'speeding' ? C.mintDeep : C.accel;
        ctx.beginPath(); ctx.arc(gx, gy, gr, Math.PI, Math.PI + Math.PI * Math.min(sp / 25, 1)); ctx.stroke();
        ctx.restore();
        const ang = Math.PI + Math.PI * Math.min(sp / 25, 1);
        D.arrow(ctx, gx, gy, gx + Math.cos(ang) * (gr - 40), gy + Math.sin(ang) * (gr - 40), { width: 6, head: 18 });
        D.text(ctx, fmt(sp, 2) + ' m/s', gx, gy - 60, { size: 36, mono: true, weight: 600, align: 'center' });
        D.text(ctx, 't = ' + fmt(tau, 2) + ' s', gx, gy + 50, { size: 28, mono: true, align: 'center', color: C.steel });
      });

      // Pause and predict at t = 2.5.
      const pa = ease(s.p('predict', 0, 0.12)) * (1 - ease(s.p('rule', 0, 0.15)));
      fade(ctx, pa, () => {
        D.card(ctx, 360, 330, 1200, 560, { shadow: true });
        ctx.save();
        ctx.fillStyle = C.ink;
        ctx.fillRect(430, 392, 12, 40);
        ctx.fillRect(452, 392, 12, 40);
        ctx.restore();
        D.text(ctx, 'Pause and predict', 490, 426, { size: 40, weight: 600 });
        D.text(ctx, 'At t = 2.5 s the acceleration is a = ' + fmt(M.a(2.5), 0) + ' m/s^{2}, which is positive.', 430, 500, { size: 32 });
        D.text(ctx, 'Is the particle speeding up?', 430, 556, { size: 32, weight: 600 });
        const r = ease(s.p('predict', 0.55, 0.7));
        D.text(ctx, ['v(2.5) = ', [fmt(M.v(2.5), 2) + ' m/s', C.slope, 700], ',   a(2.5) = ', ['+' + fmt(M.a(2.5), 0) + ' m/s^{2}', C.accel, 700]], 430, 650, { size: 32, alpha: r });
        D.text(ctx, 'v · a = ' + fmt(M.v(2.5) * M.a(2.5), 2) + ' < 0, so it is **slowing down**.', 430, 712, { size: 32, alpha: ease(s.p('predict', 0.7, 0.82)) });
        D.text(ctx, 'It moves left while the push is to the right. (Assessment 1 Q5)', 430, 786, { size: 28, color: C.slate, alpha: ease(s.p('predict', 0.82, 0.95)) });
      });

      fade(ctx, ease(s.p('rule', 0.1, 0.35)), () => {
        D.card(ctx, 360, 360, 1200, 500, { shadow: true });
        D.text(ctx, 'The rule', 430, 440, { size: 40, weight: 600 });
        D.pill(ctx, 'speeding up', 430, 516, { bg: C.mintSoft, weight: 600 });
        D.text(ctx, 'v and a have the same nonzero sign:  v · a > 0', 690, 526, { size: 32 });
        D.pill(ctx, 'slowing down', 430, 596, { bg: C.accelSoft, weight: 600 });
        D.text(ctx, 'v and a have opposite signs:  v · a < 0', 690, 606, { size: 32 });
        D.text(ctx, 'Quick Check 2:  v = −3 m/s, a = −2 m/s^{2}  →  same sign  →  speeding up.', 430, 712, { size: 30, color: C.slate, alpha: ease(s.p('rule', 0.4, 0.6)) });
        D.text(ctx, 'Practice: HW 2.2 · Assessment 1 Q3–Q5', 430, 776, { size: 28, color: C.slate, alpha: ease(s.p('rule', 0.6, 0.8)) });
      });
    },
  };

  // 9. Displacement vs total distance: odometer against displacement arrow.
  scenes.distance = {
    title: 'Displacement vs distance',
    draw(ctx, s) {
      D.heading(ctx, '7 · Displacement vs total distance', 'Where it ends up vs how far it travels', s.p('legs', 0, 0.2));
      const tau = s.started('legs') ? M.T_END * s.p('legs', 0.05, 0.9) : 0;
      const ty = 480;
      track(ctx, ty);
      // Each leg between turning times is drawn on its own lane above the track.
      const legs = [[0, 1], [1, 3], [3, 5]];
      const laneY = [430, 370, 310];
      const labels = [];
      legs.forEach(([t0, t1], i) => {
        if (tau <= t0) return;
        const te = Math.min(tau, t1);
        const x0 = trackX(M.s(t0));
        const x1 = trackX(M.s(te));
        D.arrow(ctx, x0, laneY[i], x1, laneY[i], { color: C.fn, width: 6, head: 20 });
        if (tau >= t1) labels.push([(x0 + x1) / 2, laneY[i] - 14, (M.s(t1) - M.s(t0) > 0 ? '+' : '') + fmt(M.s(t1) - M.s(t0), 0) + ' m']);
      });
      labels.forEach(([x, y, str]) => D.text(ctx, str, x, y, { size: 28, weight: 600, align: 'center', color: C.fn }));
      // Displacement arrow from the start to where the particle is now.
      if (Math.abs(M.s(tau)) > 0.1) D.arrow(ctx, trackX(0), ty + 90, trackX(M.s(tau)), ty + 90, { color: C.ink, width: 6 });
      D.text(ctx, 'displacement', trackX(0) - 20, ty + 100, { size: 28, align: 'right', color: C.slate });
      particle(ctx, ty, tau, { arrows: false });

      const ca = 1 - ease(s.p('method', 0, 0.15));
      fade(ctx, ca, () => {
        D.card(ctx, L, 640, 840, 180, { fill: C.surface, border: false });
        D.text(ctx, 'distance travelled (odometer)', L + 30, 692, { size: 28, color: C.steel, weight: 600 });
        D.text(ctx, fmt(M.distanceSoFar(tau), 1) + ' m', L + 30, 782, { size: 64, weight: 600, mono: true });
        D.card(ctx, 984, 640, 840, 180, { fill: C.surface, border: false });
        D.text(ctx, 'displacement  s(t) − s(0)', 1014, 692, { size: 28, color: C.steel, weight: 600 });
        D.text(ctx, fmt(M.displacement(0, tau), 1) + ' m', 1014, 782, { size: 64, weight: 600, mono: true });
        D.text(ctx, 't = ' + fmt(tau, 2) + ' s', 1794, 782, { size: 30, mono: true, align: 'right', color: C.steel });
        D.steps(ctx, [
          { c: 'Displacement = s(5) − s(0) = 20 − 0 = **' + fmt(M.displacement(0, 5), 0) + ' m**', p: s.p('compare', 0.1, 0.4) },
          { c: 'Distance = |4 − 0| + |0 − 4| + |20 − 0| = **' + fmt(M.totalDistance(0, 5), 0) + ' m**', p: s.p('compare', 0.4, 0.7) },
        ], L, 890, { size: 34, gap: 64 });
      });

      fade(ctx, ease(s.p('method', 0.1, 0.3)), () => {
        D.card(ctx, L, 640, 1728, 350, { fill: C.surface, border: false });
        D.text(ctx, 'Total distance in three steps', L + 40, 700, { size: 36, weight: 600 });
        D.steps(ctx, [
          { c: '1. Find the turning times inside the interval:  v(t) = 0  →  t = 1, 3', p: s.p('method', 0.2, 0.35) },
          { c: '2. Evaluate s at the ends and turning times:  s = 0, 4, 0, 20', p: s.p('method', 0.35, 0.5) },
          { c: '3. Add the sizes of the changes:  4 + 4 + 20 = 28 m', p: s.p('method', 0.5, 0.65) },
          { c: 'Distance is never less than |displacement|. Practice: HW 2.3 · Final Q5', p: s.p('method', 0.7, 0.85), color: C.slate, size: 28 },
        ], L + 40, 770, { size: 32, gap: 60 });
      });
    },
  };

  // 10. Recap and where to practise.
  scenes.recap = {
    title: 'Recap',
    draw(ctx, s) {
      D.heading(ctx, 'Recap', 'Four ideas to take away', s.p('cards', 0, 0.2));
      const cards = [
        ['Derivative at a point', "f′(a) = lim_{h→0} [f(a + h) − f(a)] / h", 'Zoom in: the graph becomes its tangent.'],
        ['When it fails', 'corner · cusp · vertical tangent · jump', 'Differentiable ⇒ continuous, not the reverse.'],
        ['Motion', 'v = s′,   a = v′', 'Speeding up when v · a > 0.'],
        ['Distance', 'split at turning times, add |changes|', 'Here: 28 m travelled, 20 m displacement.'],
      ];
      cards.forEach(([title, formula, note], i) => {
        const a = ease(s.p('cards', 0.1 + i * 0.18, 0.3 + i * 0.18));
        const x = i % 2 ? 984 : L;
        const y = i < 2 ? 280 : 560;
        fade(ctx, a, () => {
          D.card(ctx, x, y, 840, 250);
          D.text(ctx, String(i + 1).padStart(2, '0'), x + 36, y + 64, { size: 28, mono: true, color: C.steel });
          D.text(ctx, title, x + 100, y + 64, { size: 36, weight: 600 });
          D.text(ctx, formula, x + 36, y + 140, { size: 32, color: C.charcoal });
          D.text(ctx, note, x + 36, y + 206, { size: 28, color: C.slate });
        });
      });
      fade(ctx, ease(s.p('next', 0, 0.3)), () => {
        D.text(ctx, 'Practise on the site:', L, 912, { size: 32, weight: 600 });
        let x = L + 330;
        for (const label of ['Homework 1', 'Homework 2', 'Assessment 1']) x += D.pill(ctx, label, x, 900, { size: 30, weight: 600, bg: C.ink, color: C.canvas }) + 16;
        D.text(ctx, 'Next: Jeff on extreme values and optimization.', L, 980, { size: 30, color: C.slate });
      });
    },
  };

  root.AlanScenes = scenes;
})(typeof globalThis !== 'undefined' ? globalThis : this);
