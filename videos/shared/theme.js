// Colours and type for both lessons. Values follow the site's Mintlify look
// (awesome-design-md/designs/mintlify.md) so the videos feel like part of it.
//
// Colour meaning is the same in both videos:
//   fn    blue  - the function itself, or position s(t)
//   slope red   - slopes, derivatives, velocity v(t)
//   accel amber - second derivative, acceleration a(t)
//   mint        - "checked / proven" marks only, never body text
(function (root) {
  'use strict';

  const color = {
    canvas: '#ffffff',
    surface: '#f7f7f7',
    hairline: '#e5e5e5',
    hairlineSoft: '#ededed',
    ink: '#0a0a0a',
    charcoal: '#1c1c1e',
    slate: '#3a3a3c',
    steel: '#5a5a5c',
    stone: '#888888',
    muted: '#a8a8aa',
    fn: '#3772cf',
    fnSoft: 'rgba(55, 114, 207, 0.12)',
    slope: '#cc3a1f',
    slopeSoft: 'rgba(204, 58, 31, 0.12)',
    accel: '#c37d0d',
    accelSoft: 'rgba(195, 125, 13, 0.16)',
    mint: '#00d4a4',
    mintDeep: '#00b48a',
    mintSoft: 'rgba(0, 212, 164, 0.18)',
    error: '#d45656',
    skyFrom: '#87a8c8',
    skyTo: '#f5e9d8',
  };

  const font = {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'Geist Mono', 'SF Mono', Menlo, Consolas, monospace",
  };

  // Sizes in stage pixels (the stage is always 1920 x 1080). Nothing is smaller than 28.
  const size = { display: 96, h1: 64, h2: 44, h3: 36, body: 32, label: 28, kicker: 28 };

  // Layout: content keeps inside these margins (the "title safe" area of a TV frame).
  const stage = { w: 1920, h: 1080, left: 96, right: 1824, top: 96, bottom: 1000 };

  const api = { color, font, size, stage };
  root.CCT = root.CCT || {};
  root.CCT.theme = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
