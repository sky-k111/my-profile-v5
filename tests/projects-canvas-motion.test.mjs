import assert from 'node:assert/strict';
import test from 'node:test';

const canvasMotion = await import('../src/lib/projects-canvas-motion.ts').catch(() => ({}));

test('project bars disperse from their assembled positions instead of fading as one layer', () => {
  assert.equal(typeof canvasMotion.resolveProjectsCanvasDispersal, 'function');

  const start = canvasMotion.resolveProjectsCanvasDispersal(7, 0, 800, 600);
  const middle = canvasMotion.resolveProjectsCanvasDispersal(7, 0.7, 800, 600);
  const end = canvasMotion.resolveProjectsCanvasDispersal(7, 1, 800, 600);

  assert.deepEqual(start, { offsetX: 0, offsetY: 0, scaleX: 1, opacity: 1 });
  assert.ok(Math.abs(middle.offsetX) + Math.abs(middle.offsetY) > 0);
  assert.ok(Math.abs(end.offsetX) >= Math.abs(middle.offsetX));
  assert.ok(Math.abs(end.offsetY) >= Math.abs(middle.offsetY));
  assert.ok(middle.scaleX < 1 && middle.scaleX > end.scaleX);
  assert.ok(middle.opacity < 1 && middle.opacity > end.opacity);
  assert.equal(end.opacity, 0);
});

test('project bars leave in mixed directions so the field visibly breaks apart', () => {
  const exits = Array.from({ length: 24 }, (_, seed) => (
    canvasMotion.resolveProjectsCanvasDispersal(seed, 1, 800, 600)
  ));

  assert.ok(exits.some(exit => exit.offsetX < 0));
  assert.ok(exits.some(exit => exit.offsetX > 0));
  assert.ok(exits.some(exit => exit.offsetY < 0));
  assert.ok(exits.some(exit => exit.offsetY > 0));
});
