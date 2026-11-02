// Drawing helpers shared by every scene: text with simple math markup,
// cards, pills, arrows, check marks, fractions, a zoom lens and easing.
//
// Math markup inside any string:  x^{2/3}  is a superscript,  v_{0}  a subscript,
// **word** is bold. Text can also be a list of pieces, each a string or
// [string, colour] or [string, colour, weight], to colour terms in a sentence.
(function (root) {
  'use strict';

  const theme = root.CCT.theme;
  const C = theme.color;

  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, p) => a + (b - a) * p;
  // Geometric in-between: logLerp(2, 0.01, p) shrinks h smoothly on a log scale.
  const logLerp = (a, b, p) => a * Math.pow(b / a, p);
  const ease = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);

  function fontString(size, weight, mono) {
    return (weight || 400) + ' ' + size + 'px ' + (mono ? theme.font.mono : theme.font.sans);
  }

  // Split "x^{2} + **y**" into runs with a vertical shift k (1 up, -1 down) and a bold flag.
  function parse(str, colour, weight) {
    const out = [];
    let buf = '';
    let bold = false;
    const push = () => { if (buf) out.push({ s: buf, k: 0, colour, weight: bold ? 700 : weight }); buf = ''; };
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if ((c === '^' || c === '_') && str[i + 1] === '{') {
        push();
        // Find the matching brace; markup nested inside is flattened to plain text.
        let j = i + 2;
        for (let depth = 1; j < str.length; j++) {
          if (str[j] === '{') depth++;
          else if (str[j] === '}' && --depth === 0) break;
        }
        const inner = str.slice(i + 2, j).replace(/[\^_]\{([^{}]*)\}/g, '$1');
        out.push({ s: inner, k: c === '^' ? 1 : -1, colour, weight: bold ? 700 : weight });
        i = j;
      } else if (c === '*' && str[i + 1] === '*') {
        push();
        bold = !bold;
        i++;
      } else {
        buf += c;
      }
    }
    push();
    return out;
  }

  function layout(ctx, content, o) {
    const size = o.size || theme.size.body;
    const pieces = Array.isArray(content) ? content : [content];
    const runs = [];
    for (const piece of pieces) {
      if (Array.isArray(piece)) runs.push(...parse(String(piece[0]), piece[1], piece[2] || o.weight));
      else runs.push(...parse(String(piece), o.color, o.weight));
    }
    let w = 0;
    for (const r of runs) {
      r.size = r.k ? Math.round(size * 0.66) : size;
      ctx.font = fontString(r.size, r.weight || 400, o.mono);
      r.w = ctx.measureText(r.s).width;
      w += r.w;
    }
    return { runs, w, size };
  }

  function measure(ctx, content, o = {}) {
    ctx.save();
    const w = layout(ctx, content, o).w;
    ctx.restore();
    return w;
  }

  // Draw text with its baseline at y. Returns the width drawn.
  function text(ctx, content, x, y, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    const { runs, w, size } = layout(ctx, content, o);
    let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.textBaseline = 'alphabetic';
    for (const r of runs) {
      ctx.font = fontString(r.size, r.weight || 400, o.mono);
      ctx.fillStyle = r.colour || o.color || C.ink;
      const dy = r.k === 1 ? -size * 0.42 : r.k === -1 ? size * 0.22 : 0;
      ctx.fillText(r.s, cx, y + dy);
      cx += r.w;
    }
    ctx.restore();
    return w;
  }

  // Word-wrap a plain string into a column. Returns the height used.
  function wrap(ctx, str, x, y, width, o = {}) {
    const size = o.size || theme.size.body;
    const lh = o.lineHeight || size * 1.45;
    const words = String(str).split(' ');
    let line = '';
    let yy = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (line && measure(ctx, test, o) > width) {
        text(ctx, line, x, yy, o);
        line = word;
        yy += lh;
      } else {
        line = test;
      }
    }
    if (line) text(ctx, line, x, yy, o);
    return yy - y + lh;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  // A Mintlify card: white, hairline border, 12 px radius (24 at video scale).
  function card(ctx, x, y, w, h, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    if (o.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
    }
    roundRect(ctx, x, y, w, h, o.radius || 24);
    ctx.fillStyle = o.fill || C.canvas;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (o.border !== false) {
      ctx.lineWidth = o.borderWidth || 2;
      ctx.strokeStyle = o.border || C.hairline;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pill label centred vertically on y. Returns its width.
  function pill(ctx, content, x, y, o = {}) {
    const size = o.size || theme.size.label;
    const padX = size * 0.75;
    const h = size * 1.7;
    const w = measure(ctx, content, { ...o, size }) + padX * 2;
    const left = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    roundRect(ctx, left, y - h / 2, w, h, h / 2);
    ctx.fillStyle = o.bg || C.surface;
    ctx.fill();
    if (o.border) { ctx.lineWidth = 2; ctx.strokeStyle = o.border; ctx.stroke(); }
    ctx.restore();
    text(ctx, content, left + padX, y + size * 0.36, { ...o, size, align: 'left', color: o.color || C.ink });
    return w;
  }

  function arrow(ctx, x1, y1, x2, y2, o = {}) {
    const head = o.head || 20;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const len = Math.hypot(x2 - x1, y2 - y1);
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.strokeStyle = ctx.fillStyle = o.color || C.ink;
    ctx.lineWidth = o.width || 5;
    ctx.lineCap = 'round';
    if (len > head * 0.6) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - Math.cos(ang) * head * 0.8, y2 - Math.sin(ang) * head * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45));
      ctx.lineTo(x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Mint disc with an ink tick: "checked / proven".
  function check(ctx, cx, cy, r = 20, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.mint;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = r * 0.18;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.42, cy + r * 0.02);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.34);
    ctx.lineTo(cx + r * 0.46, cy - r * 0.32);
    ctx.stroke();
    ctx.restore();
  }

  // Red disc with a white cross: "fails / does not exist".
  function cross(ctx, cx, cy, r = 20, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.error;
    ctx.fill();
    ctx.strokeStyle = C.canvas;
    ctx.lineWidth = r * 0.18;
    ctx.lineCap = 'round';
    const d = r * 0.36;
    ctx.beginPath();
    ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d);
    ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d);
    ctx.stroke();
    ctx.restore();
  }

  // Stacked fraction with its bar at height y. Returns the width.
  function frac(ctx, num, den, x, y, o = {}) {
    const size = o.size || theme.size.body;
    const wn = measure(ctx, num, { ...o, size });
    const wd = measure(ctx, den, { ...o, size });
    const w = Math.max(wn, wd) + size * 0.4;
    text(ctx, num, x + w / 2, y - size * 0.32, { ...o, size, align: 'center' });
    text(ctx, den, x + w / 2, y + size * 1.02, { ...o, size, align: 'center' });
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.strokeStyle = o.color || C.ink;
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
    ctx.restore();
    return w;
  }

  // Lines that fade and slide in as their progress p goes from 0 to 1.
  // items: [{ c: content, p: 0..1, color?, size?, weight? }]. Returns height used.
  function steps(ctx, items, x, y, o = {}) {
    const size = o.size || theme.size.body;
    const gap = o.gap || size * 1.6;
    let yy = y;
    for (const it of items) {
      const p = ease(it.p == null ? 1 : it.p);
      if (p > 0) text(ctx, it.c, x + (1 - p) * 24, yy, { ...o, ...it, size: it.size || size, alpha: p * (o.alpha == null ? 1 : o.alpha) });
      yy += it.gap || gap;
    }
    return yy - y;
  }

  // Scene heading: small grey kicker above a large title.
  function heading(ctx, kicker, title, p = 1) {
    const a = ease(p);
    const L = theme.stage.left;
    ctx.save();
    ctx.letterSpacing = '2px';
    text(ctx, kicker.toUpperCase(), L, 150, { size: theme.size.kicker, weight: 600, color: C.steel, alpha: a });
    ctx.restore();
    text(ctx, title, L + (1 - a) * 20, 222, { size: theme.size.h1, weight: 600, alpha: a });
  }

  // Full-frame Mintlify sky gradient, used on title and closing cards.
  function sky(ctx, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    const g = ctx.createLinearGradient(0, 0, 0, theme.stage.h);
    g.addColorStop(0, C.skyFrom);
    g.addColorStop(1, C.skyTo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, theme.stage.w, theme.stage.h);
    ctx.restore();
  }

  // A round "microscope" lens at (cx, cy). inside() draws in stage pixels;
  // everything it draws is clipped to the circle.
  function lens(ctx, cx, cy, r, inside, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.canvas;
    ctx.fill();
    ctx.save();
    ctx.clip();
    inside();
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = C.ink;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const api = { clamp, lerp, logLerp, ease, easeOut, fontString, measure, text, wrap, roundRect, card, pill, arrow, check, cross, frac, steps, heading, sky, lens };
  root.CCT.draw = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
