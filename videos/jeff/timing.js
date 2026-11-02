// Jeff's timeline: scenes in order, each split into beats, with seconds per beat.
// To match your recorded narration, change these numbers only; the animations
// stretch or squeeze to fit. Beat names must match the s.p('...') calls in scenes.js.
(function (root) {
  'use strict';
  root.JeffTiming = [
    { scene: 'hook', beats: { title: 6, walk: 24, message: 15 } },
    { scene: 'critical', beats: { setup: 10, slide: 25, define: 20, dne: 20 } },
    { scene: 'evt', beats: { candidates: 15, evaluate: 20, leaderboard: 15, theorem: 12, open: 14, jump: 14 } },
    { scene: 'tests', beats: { first: 20, second: 15, fail: 25 } },
    { scene: 'box', beats: { rail: 10, sheet: 15, fold: 20, sweep: 25, calculus: 20, justify: 15 } },
    { scene: 'profit', beats: { model: 15, curves: 20, tangents: 25, prove: 15, twist: 30, link: 15 } },
    { scene: 'drug', beats: { model: 15, run: 25, derivative: 20, justify: 20, interpret: 10 } },
    { scene: 'yourTurn', beats: { terms: 15, pause: 12, reveal: 13 } },
    { scene: 'recap', beats: { cards: 30, next: 15 } },
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
