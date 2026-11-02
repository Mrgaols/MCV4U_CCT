// Every number Alan's animation shows, checked against a value worked out by hand
// (the site's worked solutions) or against an independent numerical estimate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const A = require('../alan/math.js');

const close = (actual, expected, tol = 1e-9, what = '') =>
  assert.ok(Math.abs(actual - expected) <= tol, `${what} expected ${expected}, got ${actual}`);

// Symmetric difference quotient, used only to check the derivative formulas.
const numDeriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);

test('secant slopes of x² at a = 3 equal 6 + h (site 1.1)', () => {
  const table = { 2: 8, 1: 7, 0.5: 6.5, 0.1: 6.1, 0.01: 6.01, '-1': 5, '-0.1': 5.9, '-0.01': 5.99 };
  for (const [h, slope] of Object.entries(table)) close(A.secantSlope(3, Number(h)), slope, 1e-9, `h=${h}`);
  for (const h of A.SECANT_H) close(A.secantSlope(3, h), 6 + h, 1e-9, `listed h=${h}`);
});

test('tangent to x² at (3, 9) has slope 6 and equation y = 6x − 9', () => {
  close(A.sqSlope(3), 6);
  close(A.tangentAt3(0), -9);
  close(A.tangentAt3(3), 9);
});

test('hook curve A is smooth with slope 0 at x = 0, but looks like |x| from far away', () => {
  close(A.smoothVSlope(0), 0);
  close(numDeriv(A.smoothV, 0.3), A.smoothVSlope(0.3), 1e-6);
  for (const x of [-1, -0.5, 0.5, 1]) assert.ok(Math.abs(A.smoothV(x) - Math.abs(x)) < 0.0026);
});

test('|x − 2| has one-sided slopes −1 and +1 at x = 2 (site 1.2, HW 1.1)', () => {
  for (const h of [0.1, 0.01, 0.001]) {
    close(A.dq(A.corner, 2, -h), -1, 1e-9);
    close(A.dq(A.corner, 2, h), 1, 1e-9);
  }
});

test('x^(2/3) difference quotients at 0 head to opposite infinities (cusp)', () => {
  close(A.dq(A.cusp, 0, -0.001), -10, 1e-6);
  close(A.dq(A.cusp, 0, 0.001), 10, 1e-6);
  assert.ok(A.dq(A.cusp, 0, 1e-6) > 99);
});

test('x^(1/3) difference quotients at 0 both head to +∞ (vertical tangent)', () => {
  close(A.dq(A.vtan, 0, -0.001), 100, 1e-6);
  close(A.dq(A.vtan, 0, 0.001), 100, 1e-6);
});

test('jump function: left quotient blows up, right quotient is 1', () => {
  close(A.dq(A.jump, 0, -0.001), 1001, 1e-6);
  close(A.dq(A.jump, 0, 0.001), 1, 1e-9);
});

test('piecewise join: continuity forces b = 1 − m, and m = 2, b = −1 is smooth (site 1.4)', () => {
  assert.equal(A.PW.m, 2);
  assert.equal(A.PW.b, -1);
  close(A.pwGap(0.5, 2.5), 2);
  close(A.pwGap(0.7, A.continuousB(0.7)), 0);
  close(A.pwGap(A.PW.m, A.PW.b), 0);
  close(numDeriv(A.sq, 1), A.PW.m, 1e-6, 'left slope');
});

test('particle: v = s′ and a = v′ (site 2.1)', () => {
  for (const t of [0.3, 1.7, 2.5, 4.2]) {
    close(A.v(t), numDeriv(A.s, t), 1e-6, `v(${t})`);
    close(A.a(t), numDeriv(A.v, t), 1e-6, `a(${t})`);
  }
  assert.deepEqual(A.REST_TIMES, [1, 3]);
  for (const t of A.REST_TIMES) close(A.v(t), 0);
  close(A.a(2), 0);
});

test('particle positions at the key times (site 2.3)', () => {
  close(A.s(0), 0);
  close(A.s(1), 4);
  close(A.s(2), 2);
  close(A.s(3), 0);
  close(A.s(5), 20);
});

test('speeding up / slowing down on each interval (site 2.2)', () => {
  assert.equal(A.motionState(0.5), 'slowing');
  assert.equal(A.motionState(1.5), 'speeding');
  assert.equal(A.motionState(2.5), 'slowing');
  assert.equal(A.motionState(4), 'speeding');
  assert.equal(A.motionState(1), 'neither');
  assert.equal(A.motionState(2), 'neither');
});

test('t = 2.5: a is positive yet the particle slows (A1 Q5 numbers)', () => {
  close(A.v(2.5), -2.25);
  close(A.a(2.5), 3);
  assert.ok(A.v(2.5) * A.a(2.5) < 0);
});

test('displacement 20 m and total distance 28 m on [0, 5]', () => {
  close(A.displacement(0, 5), 20);
  close(A.totalDistance(0, 5), 28);
  // Independent check: integrate |v| numerically (Simpson's rule).
  const n = 20000;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const t = 5 * i / n;
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    sum += w * Math.abs(A.v(t));
  }
  close(sum * (5 / n) / 3, 28, 1e-6, 'integral of |v|');
});

test('odometer reading during the motion', () => {
  close(A.distanceSoFar(1), 4);
  close(A.distanceSoFar(2), 6);
  close(A.distanceSoFar(3), 8);
  close(A.distanceSoFar(5), 28);
});
