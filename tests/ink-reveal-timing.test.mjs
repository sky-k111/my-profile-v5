import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getRevealOpacity } from '../src/lib/reveal-timing.ts';

test('keeps ink fully visible through the 1.5 second hold', () => {
  assert.equal(getRevealOpacity(0), 1);
  assert.equal(getRevealOpacity(1500), 1);
});

test('eases ink to transparent during the 700 ms dispersion', () => {
  assert.ok(getRevealOpacity(1850) < 1);
  assert.ok(getRevealOpacity(1850) > 0);
  assert.equal(getRevealOpacity(2200), 0);
});

test('composites the untouched racing-suit source rather than a pixel-matted copy', async () => {
  const source = await readFile(new URL('../src/components/PortraitReveal.tsx', import.meta.url), 'utf8');
  assert.match(source, /tempCtx\.drawImage\(suitImg,\s*0,\s*0,\s*canvasW,\s*canvasH\)/);
  assert.doesNotMatch(source, /createMattedImage/);
});

test('starts the automatic hero stroke after two seconds of inactivity', async () => {
  const source = await readFile(new URL('../src/components/PortraitReveal.tsx', import.meta.url), 'utf8');

  assert.match(source, /const AUTO_STROKE_DELAY_MS = 2000/);
  assert.match(source, /}, AUTO_STROKE_DELAY_MS\);/);
  assert.doesNotMatch(source, /}, 4000\);/);
});

test('auto stroke keeps brush stamps overlapping without flooding the frame', async () => {
  const revealGeometry = await import('../src/lib/reveal-geometry.ts').catch(() => ({}));

  assert.equal(typeof revealGeometry.getAutoStrokeStep, 'function');

  const brushRadius = 54;
  const brushBleed = 28;
  const step = revealGeometry.getAutoStrokeStep(brushRadius, brushBleed, 5);
  const representativePathLength = 760;
  const bandCount = 6;
  const stampCount = (Math.ceil(representativePathLength / step) + 1) * bandCount;

  assert.ok(step <= brushRadius + brushBleed, 'adjacent brush footprints should overlap');
  assert.ok(stampCount <= 66, `expected at most 66 stamps, received ${stampCount}`);
});

test('cached brush texture preserves its full bleed at device resolution', async () => {
  const revealGeometry = await import('../src/lib/reveal-geometry.ts').catch(() => ({}));

  assert.equal(typeof revealGeometry.getBrushTextureMetrics, 'function');
  assert.deepEqual(revealGeometry.getBrushTextureMetrics(54, 28, 2), {
    cssSize: 164,
    pixelSize: 328,
  });
});

test('auto stroke emits each discrete path step only once', async () => {
  const revealGeometry = await import('../src/lib/reveal-geometry.ts').catch(() => ({}));

  assert.equal(typeof revealGeometry.getNewStrokeStepIndices, 'function');
  assert.deepEqual(revealGeometry.getNewStrokeStepIndices(-1, 0), [0]);
  assert.deepEqual(revealGeometry.getNewStrokeStepIndices(0, 0), []);
  assert.deepEqual(revealGeometry.getNewStrokeStepIndices(0, 3), [1, 2, 3]);
});

test('auto brush head follows continuous progress between persistent stamps', async () => {
  const revealGeometry = await import('../src/lib/reveal-geometry.ts').catch(() => ({}));

  assert.equal(typeof revealGeometry.getAutoStrokePoint, 'function');
  assert.deepEqual(
    revealGeometry.getAutoStrokePoint(0.2, 100, 500, 200, 20),
    { x: 180, y: 220 },
  );
});

test('automatic stroke includes a concentrated pass through the collar', async () => {
  const revealGeometry = await import('../src/lib/reveal-geometry.ts').catch(() => ({}));

  assert.equal(typeof revealGeometry.getAutoStrokeBands, 'function');
  const collarBand = revealGeometry
    .getAutoStrokeBands()
    .find(({ yFrac, amp }) => yFrac >= 0.58 && yFrac <= 0.64 && amp <= 0.03);

  assert.ok(collarBand, 'expected a low-amplitude band through the collar region');
});
