// Alan's timeline: scenes in order, each split into beats, with seconds per beat.
// To match your recorded narration, change these numbers only; the animations
// stretch or squeeze to fit. Beat names must match the s.p('...') calls in scenes.js.
(function (root) {
  'use strict';
  root.AlanTiming = [
    { scene: 'hook', beats: { title: 6, twoV: 8, zoom: 16, question: 10 } },
    { scene: 'secant', beats: { setup: 10, secant: 14, shrink: 24, left: 12, algebra: 18, tangent: 12 } },
    { scene: 'microscope', beats: { lensSmooth: 25, lensCorner: 25, oneSided: 25 } },
    { scene: 'gallery', beats: { grid: 10, secants: 30, logic: 20, verdict: 15 } },
    { scene: 'piecewise', beats: { setup: 10, continuity: 20, pivot: 25, solve: 20 } },
    { scene: 'bridge', beats: { morph: 12, message: 8 } },
    { scene: 'motion', beats: { setup: 12, run: 40, rest: 20, read: 18 } },
    { scene: 'speed', beats: { chart: 25, replay: 30, predict: 20, rule: 15 } },
    { scene: 'distance', beats: { legs: 30, compare: 20, method: 25 } },
    { scene: 'recap', beats: { cards: 28, next: 12 } },
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
