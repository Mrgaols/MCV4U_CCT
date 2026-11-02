// Plot: a rectangle on the stage that shows part of the (x, y) plane.
//
// Converting math coordinates to stage pixels (the stage is 1920 x 1080):
//   pixelX = box.x + (x - xMin) / (xMax - xMin) * box.w
//   pixelY = box.y + (yMax - y) / (yMax - yMin) * box.h
// The y formula is flipped because pixel rows grow downward but y grows upward.
(function (root) {
  'use strict';

  const theme = (root.CCT && root.CCT.theme) || (typeof require === 'function' ? require('./theme.js') : null);

  // Numbers on screen: true minus sign, and never "−0.00".
  function fmt(v, d = 2) {
    if (v === Infinity) return '∞';
    if (v === -Infinity) return '−∞';
    let s = Number(v).toFixed(d);
    if (/^-0(\.0*)?$/.test(s)) s = s.slice(1);
    return s.replace('-', '−');
  }

  // Like fmt, but drops trailing zeros: 6.010 -> "6.01", 8.00 -> "8".
  function fmtTrim(v, d = 3) {
    let s = fmt(v, d);
    if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }

  class Plot {
    constructor(box, win) {
      this.box = box;
      this.win = win;
    }
    X(x) { const { box, win } = this; return box.x + (x - win.xMin) / (win.xMax - win.xMin) * box.w; }
    Y(y) { const { box, win } = this; return box.y + (win.yMax - y) / (win.yMax - win.yMin) * box.h; }
    invX(px) { const { box, win } = this; return win.xMin + (px - box.x) / box.w * (win.xMax - win.xMin); }
    invY(py) { const { box, win } = this; return win.yMax - (py - box.y) / box.h * (win.yMax - win.yMin); }

    // Drawing below needs a browser canvas context.
    clip(ctx, draw) {
      const { x, y, w, h } = this.box;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      draw();
      ctx.restore();
    }

    grid(ctx, xs, ys, o = {}) {
      ctx.save();
      ctx.strokeStyle = o.color || theme.color.hairlineSoft;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const x of xs) { ctx.moveTo(this.X(x), this.box.y); ctx.lineTo(this.X(x), this.box.y + this.box.h); }
      for (const y of ys) { ctx.moveTo(this.box.x, this.Y(y)); ctx.lineTo(this.box.x + this.box.w, this.Y(y)); }
      ctx.stroke();
      ctx.restore();
    }

    // Axes sit on x = 0 and y = 0 when those lines are in view, else on the box edge.
    axes(ctx, o = {}) {
      const { box, win } = this;
      const D = root.CCT.draw;
      const ax = (win.yMin <= 0 && win.yMax >= 0) ? this.Y(0) : box.y + box.h;
      const ay = (win.xMin <= 0 && win.xMax >= 0) ? this.X(0) : box.x;
      const c = o.color || theme.color.muted;
      ctx.save();
      ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(box.x, ax); ctx.lineTo(box.x + box.w, ax);
      ctx.moveTo(ay, box.y); ctx.lineTo(ay, box.y + box.h);
      ctx.stroke();
      const f = o.tickFmt || ((v) => fmtTrim(v, 2));
      const t = { size: theme.size.label, color: theme.color.steel };
      for (const x of o.xTicks || []) {
        ctx.beginPath(); ctx.moveTo(this.X(x), ax - 8); ctx.lineTo(this.X(x), ax + 8); ctx.stroke();
        D.text(ctx, f(x), this.X(x), ax + 40, { ...t, align: 'center' });
      }
      for (const y of o.yTicks || []) {
        ctx.beginPath(); ctx.moveTo(ay - 8, this.Y(y)); ctx.lineTo(ay + 8, this.Y(y)); ctx.stroke();
        D.text(ctx, f(y), ay - 16, this.Y(y) + 10, { ...t, align: 'right' });
      }
      if (o.xLabel) D.text(ctx, o.xLabel, box.x + box.w, ax - 18, { ...t, align: 'right', color: theme.color.slate });
      if (o.yLabel) D.text(ctx, o.yLabel, ay + 16, box.y + 30, { ...t, color: theme.color.slate });
      ctx.restore();
    }

    // Sample f between from and to. The path breaks where f is undefined or
    // jumps by more than a box height between samples (asymptotes, jumps).
    curve(ctx, f, o = {}) {
      const { win, box } = this;
      const a = o.from == null ? win.xMin : o.from;
      const b = o.to == null ? win.xMax : o.to;
      const n = o.n || 600;
      const breaks = o.breakAt || [];
      ctx.save();
      ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      ctx.strokeStyle = o.color || theme.color.fn;
      ctx.lineWidth = o.width || 5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (o.dash) ctx.setLineDash(o.dash);
      this.clip(ctx, () => {
        ctx.beginPath();
        let pen = false;
        let prevY = null;
        for (let i = 0; i <= n; i++) {
          const x = a + (b - a) * i / n;
          const y = f(x);
          if (!isFinite(y)) { pen = false; continue; }
          const py = this.Y(y);
          const crossed = breaks.some((c) => i > 0 && (a + (b - a) * (i - 1) / n) < c && x >= c);
          if (!pen || crossed || (prevY != null && Math.abs(py - prevY) > box.h * 1.5)) {
            ctx.moveTo(this.X(x), py);
            pen = true;
          } else {
            ctx.lineTo(this.X(x), py);
          }
          prevY = py;
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    segment(ctx, x1, y1, x2, y2, o = {}) {
      ctx.save();
      ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      ctx.strokeStyle = o.color || theme.color.ink;
      ctx.lineWidth = o.width || 3;
      ctx.lineCap = 'round';
      if (o.dash) ctx.setLineDash(o.dash);
      const go = () => {
        ctx.beginPath();
        ctx.moveTo(this.X(x1), this.Y(y1));
        ctx.lineTo(this.X(x2), this.Y(y2));
        ctx.stroke();
      };
      if (o.noClip) go(); else this.clip(ctx, go);
      ctx.restore();
    }

    // The straight line through (x0, y0) with slope m, across the whole box.
    line(ctx, x0, y0, m, o = {}) {
      const { xMin, xMax } = this.win;
      this.segment(ctx, xMin, y0 + m * (xMin - x0), xMax, y0 + m * (xMax - x0), o);
    }

    vline(ctx, x, o = {}) { this.segment(ctx, x, this.win.yMin, x, this.win.yMax, { dash: [10, 10], color: theme.color.muted, width: 2, ...o }); }
    hline(ctx, y, o = {}) { this.segment(ctx, this.win.xMin, y, this.win.xMax, y, { dash: [10, 10], color: theme.color.muted, width: 2, ...o }); }

    dot(ctx, x, y, o = {}) {
      const r = o.r || 11;
      ctx.save();
      ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      ctx.beginPath();
      ctx.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2);
      if (o.hollow) {
        ctx.fillStyle = theme.color.canvas;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = o.color || theme.color.ink;
        ctx.stroke();
      } else {
        ctx.fillStyle = o.color || theme.color.ink;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = theme.color.canvas;
        ctx.stroke();
      }
      ctx.restore();
    }

    label(ctx, str, x, y, o = {}) {
      root.CCT.draw.text(ctx, str, this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0), o);
    }

    // Shade the vertical strip a <= x <= b (sign charts, intervals).
    band(ctx, a, b, o = {}) {
      ctx.save();
      ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      ctx.fillStyle = o.color || theme.color.fnSoft;
      const x1 = Math.max(this.X(a), this.box.x);
      const x2 = Math.min(this.X(b), this.box.x + this.box.w);
      ctx.fillRect(x1, this.box.y, x2 - x1, this.box.h);
      ctx.restore();
    }

    // Shade between f and g for a <= x <= b.
    fillBetween(ctx, f, g, a, b, o = {}) {
      const n = o.n || 200;
      ctx.save();
      ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      ctx.fillStyle = o.color || theme.color.fnSoft;
      this.clip(ctx, () => {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; ctx.lineTo(this.X(x), this.Y(f(x))); }
        for (let i = n; i >= 0; i--) { const x = a + (b - a) * i / n; ctx.lineTo(this.X(x), this.Y(g(x))); }
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    }
  }

  const api = { Plot, fmt, fmtTrim };
  root.CCT = root.CCT || {};
  Object.assign(root.CCT, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
