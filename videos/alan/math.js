// Alan's lesson: every function and number the animation shows comes from here.
// Change a value here and the labels on screen change with it.
// tests/math-alan.test.mjs checks each value against a hand-worked answer.
(function (root) {
  'use strict';

  const cbrt = Math.cbrt; // real cube root, also for negative x

  // Difference quotient: slope of the secant from (a, f(a)) to (a+h, f(a+h)).
  const dq = (f, a, h) => (f(a + h) - f(a)) / h;

  // Scenes 2-3: f(x) = x² at a = 3.
  const sq = (x) => x * x;
  const sqSlope = (x) => 2 * x;
  const secantSlope = (a, h) => dq(sq, a, h);
  const tangentAt3 = (x) => 6 * (x - 3) + 9; // y = 6x − 9
  // The h values the table shows, in order: from the right, then from the left.
  const SECANT_H = [2, 1, 0.5, 0.1, 0.01];
  const SECANT_H_LEFT = [-1, -0.1, -0.01];

  // Scene 1 hook: curve A is smooth (rounded bottom of width about 0.05),
  // curve B is |x|. From far away they look the same.
  const EPS = 0.05;
  const smoothV = (x) => Math.sqrt(x * x + EPS * EPS);
  const smoothVSlope = (x) => x / Math.sqrt(x * x + EPS * EPS);

  // Scenes 3-4: the four ways a derivative can fail.
  const corner = (x) => Math.abs(x - 2);        // corner at x = 2
  const vee = (x) => Math.abs(x);               // corner at x = 0 (gallery)
  const cusp = (x) => cbrt(x) * cbrt(x);        // x^(2/3)
  const vtan = (x) => cbrt(x);                  // x^(1/3)
  const jump = (x) => (x < 0 ? x : x + 1);      // jumps from 0 to 1 at x = 0

  // Scene 5: f(x) = x² for x ≤ 1, mx + b for x > 1.
  const pwRight = (m, b) => (x) => m * x + b;
  const pwGap = (m, b) => (m * 1 + b) - sq(1);  // right value minus left value at x = 1
  const continuousB = (m) => 1 - m;             // the b that closes the gap for slope m
  const PW = { m: sqSlope(1), b: continuousB(sqSlope(1)) }; // m = 2, b = −1
  const PW_START = { m: 0.5, b: 2.5 };          // where the animation begins: a gap of 2

  // Scenes 7-9: particle with s(t) = t³ − 6t² + 9t (m), 0 ≤ t ≤ 5 (s).
  const T_END = 5;
  const s = (t) => t * t * t - 6 * t * t + 9 * t;
  const v = (t) => 3 * t * t - 12 * t + 9;      // = 3(t − 1)(t − 3), m/s
  const a = (t) => 6 * t - 12;                  // = 6(t − 2), m/s²
  const REST_TIMES = [1, 3];                    // roots of v inside [0, 5]
  const A_ZERO = 2;                             // root of a

  // Speed |v| increases when v and a have the same nonzero sign.
  function motionState(t) {
    const p = v(t) * a(t);
    if (Math.abs(p) < 1e-12) return 'neither';
    return p > 0 ? 'speeding' : 'slowing';
  }

  const displacement = (t0, t1) => s(t1) - s(t0);

  // Total distance: split [t0, t1] at the turning times and add |change| on each leg.
  function totalDistance(t0, t1) {
    const cuts = [t0, ...REST_TIMES.filter((r) => r > t0 && r < t1), t1];
    let d = 0;
    for (let i = 1; i < cuts.length; i++) d += Math.abs(s(cuts[i]) - s(cuts[i - 1]));
    return d;
  }
  const distanceSoFar = (t) => totalDistance(0, t);

  const api = {
    dq, sq, sqSlope, secantSlope, tangentAt3, SECANT_H, SECANT_H_LEFT,
    EPS, smoothV, smoothVSlope,
    corner, vee, cusp, vtan, jump,
    pwRight, pwGap, continuousB, PW, PW_START,
    T_END, s, v, a, REST_TIMES, A_ZERO, motionState, displacement, totalDistance, distanceSoFar,
  };
  root.AlanMath = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
