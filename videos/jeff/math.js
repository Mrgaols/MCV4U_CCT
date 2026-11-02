// Jeff's lesson: every function and number the animation shows comes from here.
// Change a value here and the labels on screen change with it.
// tests/math-jeff.test.mjs checks each value against a hand-worked answer.
(function (root) {
  'use strict';

  // Scene 1 hook: a hiking trail with a flat shelf (x = 2), a false peak (x = 5),
  // a valley (x = 8) and its highest point at the end of the trail (x = 9.2).
  // Built from its slope: trail′(x) = u²(u − 3)(u − 6) / 10 with u = x − 2, so the
  // slope is 0 at u = 0 without changing sign (the shelf). Elevation is in arbitrary units.
  const TRAIL = { shelf: 2, peak: 5, valley: 8, end: 9.2 };
  const trail = (x) => {
    const u = x - 2;
    return (Math.pow(u, 5) / 5 - 9 * Math.pow(u, 4) / 4 + 6 * Math.pow(u, 3)) / 10 + 10;
  };
  const trailSlope = (x) => {
    const u = x - 2;
    return u * u * (u - 3) * (u - 6) / 10;
  };

  // Scenes 2-4: f(x) = x³ − 3x on [−2, 2] (site 3.1 and 3.2).
  const f = (x) => x * x * x - 3 * x;
  const fp = (x) => 3 * x * x - 3;              // = 3(x − 1)(x + 1)
  const fpp = (x) => 6 * x;
  const DOMAIN = [-2, 2];
  const CRIT = [-1, 1];
  const CANDIDATES = [
    { x: -2, kind: 'endpoint' },
    { x: -1, kind: 'critical' },
    { x: 1, kind: 'critical' },
    { x: 2, kind: 'endpoint' },
  ];

  // Largest and smallest value among the candidates, with every x that ties.
  function absoluteExtrema(g, xs) {
    const vals = xs.map((x) => g(x));
    const hi = Math.max(...vals);
    const lo = Math.min(...vals);
    return {
      max: { value: hi, xs: xs.filter((x, i) => Math.abs(vals[i] - hi) < 1e-12) },
      min: { value: lo, xs: xs.filter((x, i) => Math.abs(vals[i] - lo) < 1e-12) },
    };
  }

  // f′ does not exist but there is still a maximum: −|x| at 0 (Final Q10).
  const peakCorner = (x) => -Math.abs(x);

  // Stationary but not an extremum.
  const cube = (x) => x * x * x;
  const cubeSlope = (x) => 3 * x * x;
  const quartic = (x) => Math.pow(x, 4) - 4 * Math.pow(x, 3);
  const quarticSlope = (x) => 4 * x * x * (x - 3);
  const quarticSecond = (x) => 12 * x * x - 24 * x;

  // Scene 5: open box from a 20 cm square sheet, corner squares of side x, 0 < x < 10.
  const SHEET = 20;
  const boxV = (x) => x * (SHEET - 2 * x) * (SHEET - 2 * x);
  const boxVp = (x) => (SHEET - 2 * x) * (SHEET - 6 * x); // product rule, then factor
  const BOX = { xStar: SHEET / 6, vMax: boxV(SHEET / 6), domain: [0, SHEET / 2] };

  // Scene 6: price p(q) = 100 − 2q dollars, cost C(q) = 200 + 20q dollars, 0 ≤ q ≤ 50.
  const price = (q) => 100 - 2 * q;
  const revenue = (q) => q * price(q);
  const cost = (q) => 200 + 20 * q;
  const profit = (q) => revenue(q) - cost(q);  // = 80q − 2q² − 200
  const profitP = (q) => 80 - 4 * q;
  const MR = (q) => 100 - 4 * q;
  const MC = () => 20;
  const ECON = { qStar: 20, domain: [0, 50] };

  // Scene 6 twist (hypothetical, from Assessment 3 Q5): P(q) = q³ − 6q² + 9q on [0, 5].
  const twist = (q) => q * q * q - 6 * q * q + 9 * q;
  const twistP = (q) => 3 * (q - 1) * (q - 3);
  const TWIST = { stationary: [1, 3], candidates: [0, 1, 3, 5], domain: [0, 5] };

  // Scene 7: illustrative drug model C(t) = 10t / (t² + 4) mg/L, t ≥ 0 hours.
  const drug = (t) => 10 * t / (t * t + 4);
  const drugP = (t) => 10 * (4 - t * t) / Math.pow(t * t + 4, 2); // quotient rule
  const DRUG = { tStar: 2, peak: drug(2) };

  // Scene 8: bird energy per km E(v) = 0.05v² + 100/v, 2 ≤ v ≤ 25 m/s (HW 4.3).
  const drag = (v) => 0.05 * v * v;
  const timeCost = (v) => 100 / v;
  const bird = (v) => drag(v) + timeCost(v);
  const birdP = (v) => 0.1 * v - 100 / (v * v);
  const BIRD = { vStar: 10, domain: [2, 25] };

  const api = {
    TRAIL, trail, trailSlope,
    f, fp, fpp, DOMAIN, CRIT, CANDIDATES, absoluteExtrema, peakCorner,
    cube, cubeSlope, quartic, quarticSlope, quarticSecond,
    SHEET, boxV, boxVp, BOX,
    price, revenue, cost, profit, profitP, MR, MC, ECON,
    twist, twistP, TWIST,
    drug, drugP, DRUG,
    drag, timeCost, bird, birdP, BIRD,
  };
  root.JeffMath = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
