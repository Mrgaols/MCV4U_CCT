// Every number Jeff's animation shows, checked against a value worked out by hand
// (the site's worked solutions) or against an independent numerical search.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const J = require('../jeff/math.js');

const close = (actual, expected, tol = 1e-9, what = '') =>
  assert.ok(Math.abs(actual - expected) <= tol, `${what} expected ${expected}, got ${actual}`);
const numDeriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);

// Brute-force maximum of f on [a, b]: an independent check on the calculus.
function gridMax(f, a, b, n = 200000) {
  let best = { x: a, y: f(a) };
  for (let i = 1; i <= n; i++) {
    const x = a + (b - a) * i / n;
    const y = f(x);
    if (y > best.y) best = { x, y };
  }
  return best;
}

test('hook trail: shelf at 2, false peak at 5, summit at the end of the trail', () => {
  for (const x of [0.7, 3.4, 6.1, 8.8]) close(J.trailSlope(x), numDeriv(J.trail, x), 1e-6, `slope at ${x}`);
  close(J.trailSlope(J.TRAIL.shelf), 0);
  assert.ok(J.trailSlope(J.TRAIL.shelf - 0.3) > 0 && J.trailSlope(J.TRAIL.shelf + 0.3) > 0, 'shelf: no sign change');
  assert.ok(J.trailSlope(J.TRAIL.peak - 0.3) > 0 && J.trailSlope(J.TRAIL.peak + 0.3) < 0, 'local max at the peak');
  assert.ok(J.trailSlope(J.TRAIL.valley - 0.3) < 0 && J.trailSlope(J.TRAIL.valley + 0.3) > 0, 'local min in the valley');
  const best = gridMax(J.trail, 0, J.TRAIL.end);
  close(best.x, J.TRAIL.end, 1e-9, 'highest point is the endpoint');
  assert.ok(J.trail(J.TRAIL.end) > J.trail(J.TRAIL.peak));
});

test('f(x) = x³ − 3x: critical numbers ±1 and candidate values on [−2, 2] (site 3.1)', () => {
  assert.deepEqual(J.CRIT, [-1, 1]);
  for (const c of J.CRIT) close(J.fp(c), 0);
  close(J.fp(0.4), numDeriv(J.f, 0.4), 1e-6);
  close(J.fpp(0.4), numDeriv(J.fp, 0.4), 1e-6);
  const values = Object.fromEntries(J.CANDIDATES.map((c) => [c.x, J.f(c.x)]));
  assert.deepEqual(values, { '-2': -2, '-1': 2, 1: -2, 2: 2 });
  const { max, min } = J.absoluteExtrema(J.f, J.CANDIDATES.map((c) => c.x));
  assert.deepEqual(max.xs, [-1, 2]);
  assert.equal(max.value, 2);
  assert.deepEqual(min.xs, [-2, 1]);
  assert.equal(min.value, -2);
});

test('derivative tests on x³ − 3x agree (site 3.2)', () => {
  assert.ok(J.fp(-1.5) > 0 && J.fp(0) < 0 && J.fp(1.5) > 0);
  close(J.fpp(-1), -6);
  close(J.fpp(1), 6);
});

test('stationary points that are not extrema: x³ and x⁴ − 4x³ at 0 (HW 3.5)', () => {
  close(J.cubeSlope(0), 0);
  assert.ok(J.cubeSlope(-0.5) > 0 && J.cubeSlope(0.5) > 0);
  close(J.quarticSlope(-1), -16);
  close(J.quarticSlope(1), -8);
  close(J.quarticSecond(0), 0);
  close(J.quartic(3), -27);
  close(J.quarticSecond(3), 36);
});

test('open box from a 20 cm sheet: x = 10/3, V = 16000/27 cm³ (site 4.1)', () => {
  close(J.BOX.xStar, 10 / 3);
  close(J.BOX.vMax, 16000 / 27, 1e-9);
  close(J.boxV(J.BOX.xStar), 16000 / 27, 1e-9);
  close(J.boxVp(1.7), numDeriv(J.boxV, 1.7), 1e-5);
  close(J.boxVp(J.BOX.xStar), 0, 1e-9);
  close(J.boxV(0), 0);
  close(J.boxV(10), 0);
  close(gridMax(J.boxV, 0, 10).x, 10 / 3, 1e-4);
  assert.equal(Math.round(J.BOX.vMax * 100) / 100, 592.59);
});

test('profit model: q = 20 items, price $60, profit $600 (site 4.2)', () => {
  close(J.profit(20), 600);
  close(J.ECON.qStar, 20);
  close(J.price(20), 60);
  close(J.MR(20), J.MC(20));
  close(J.profitP(7), numDeriv(J.profit, 7), 1e-6);
  close(J.revenue(13) - J.cost(13), J.profit(13));
  close(J.profit(0), -200);
  close(J.profit(50), -1200);
  close(gridMax(J.profit, 0, 50).x, 20, 1e-3);
});

test('MR = MC is not proof: P = q³ − 6q² + 9q on [0, 5] (A3 Q5)', () => {
  for (const q of J.TWIST.stationary) close(J.twistP(q), 0);
  assert.deepEqual(J.TWIST.candidates.map((q) => J.twist(q)), [0, 4, 0, 20]);
  assert.equal(gridMax(J.twist, 0, 5).x, 5);
});

test('drug model: peak 2.5 mg/L at t = 2 h; C′ changes sign there (site 4.4)', () => {
  close(J.drugP(1.3), numDeriv(J.drug, 1.3), 1e-6);
  close(J.drug(2), 2.5);
  close(J.drugP(2), 0);
  assert.ok(J.drugP(1) > 0 && J.drugP(3) < 0);
  close(gridMax(J.drug, 0, 100, 400000).x, 2, 1e-3);
});

test('bird flight energy: least at v = 10 m/s, E = 15 (HW 4.3)', () => {
  close(J.birdP(10), 0, 1e-12);
  close(J.bird(10), 15);
  close(J.bird(2), 50.2);
  close(J.bird(25), 35.25);
  close(J.birdP(6), numDeriv(J.bird, 6), 1e-6);
  close(gridMax((v) => -J.bird(v), 2, 25).x, 10, 1e-3);
});
