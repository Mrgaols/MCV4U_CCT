// Tests for the pure parts of the player: the timeline, the math-to-pixel
// mapping and number formatting. Run with:  node --test videos/tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../shared/timeline.js');
const P = require('../shared/plot.js');

const scenes = { a: { title: 'A' }, b: { title: 'B' } };
const timing = [
  { scene: 'a', beats: { x: 2, y: 3 } },
  { scene: 'b', beats: { z: 5 } },
];

test('build adds beat durations into scene and lesson times', () => {
  const tl = T.build(scenes, timing);
  assert.equal(tl.duration, 10);
  assert.equal(tl.scenes[1].start, 5);
  assert.equal(tl.scenes[1].title, 'B');
  assert.deepEqual([tl.scenes[0].beats[1].start, tl.scenes[0].beats[1].end], [2, 5]);
});

test('build names a timing entry whose scene does not exist', () => {
  assert.throws(() => T.build({ a: {} }, timing), /no scene named "b"/);
});

test('build rejects a beat with zero or negative length', () => {
  assert.throws(() => T.build(scenes, [{ scene: 'a', beats: { x: 0 } }]), /a\.x/);
});

test('locate finds the scene, beat and time inside the scene', () => {
  const tl = T.build(scenes, timing);
  const at = T.locate(tl, 6);
  assert.equal(at.scene.id, 'b');
  assert.equal(at.beat.id, 'z');
  assert.equal(at.local, 1);
});

test('locate clamps times outside the lesson', () => {
  const tl = T.build(scenes, timing);
  assert.equal(T.locate(tl, -3).local, 0);
  const end = T.locate(tl, 99);
  assert.equal(end.scene.id, 'b');
  assert.equal(end.local, 5);
});

test('scene state gives 0..1 progress through a beat', () => {
  const tl = T.build(scenes, timing);
  const s = T.sceneState(tl, 3.5);
  assert.equal(s.p('x'), 1);
  assert.equal(s.p('y'), 0.5);
  assert.equal(s.p('y', 0.5, 1), 0);
  assert.equal(s.since('y'), 1.5);
  assert.equal(s.beat, 'y');
});

test('scene state names an unknown beat instead of returning NaN', () => {
  const tl = T.build(scenes, timing);
  const s = T.sceneState(tl, 1);
  assert.throws(() => s.p('nope'), /scene "a" has no beat "nope"/);
});

test('stops are the beat boundaries, and next/prev step between them', () => {
  const tl = T.build(scenes, timing);
  assert.deepEqual(T.stops(tl), [0, 2, 5, 10]);
  assert.equal(T.nextStop(tl, 2), 5);
  assert.equal(T.prevStop(tl, 5), 2);
  assert.equal(T.prevStop(tl, 0), 0);
  assert.equal(T.nextStop(tl, 10), 10);
});

test('presenter mode halts playback at the first beat boundary crossed', () => {
  const tl = T.build(scenes, timing);
  assert.deepEqual(T.presenterClamp(tl, 1.9, 2.3), { t: 2, hit: true });
  assert.deepEqual(T.presenterClamp(tl, 2, 2.3), { t: 2.3, hit: false });
});

test('plot maps math coordinates to pixels and back', () => {
  const p = new P.Plot({ x: 100, y: 50, w: 800, h: 400 }, { xMin: 0, xMax: 4, yMin: -2, yMax: 2 });
  assert.equal(p.X(0), 100);
  assert.equal(p.X(4), 900);
  assert.equal(p.Y(2), 50);
  assert.equal(p.Y(-2), 450);
  assert.equal(p.invX(p.X(1.25)), 1.25);
  assert.equal(p.invY(p.Y(-0.5)), -0.5);
});

test('fmt uses a true minus sign and never prints −0', () => {
  assert.equal(P.fmt(-2.25, 2), '−2.25');
  assert.equal(P.fmt(-0.0001, 2), '0.00');
  assert.equal(P.fmt(6.01, 2), '6.01');
});
