import assert from 'node:assert/strict';
import test from 'node:test';

const mediaMotion = await import('../src/lib/project-media-motion.ts').catch(() => ({}));
const closeTo = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} should be close to ${expected}`);

test('only the first two project media use the cylindrical roll renderer', () => {
  assert.equal(typeof mediaMotion.usesProjectMediaRoll, 'function');
  assert.equal(mediaMotion.usesProjectMediaRoll(0), true);
  assert.equal(mediaMotion.usesProjectMediaRoll(1), true);
  assert.equal(mediaMotion.usesProjectMediaRoll(2), false);
  assert.equal(mediaMotion.usesProjectMediaRoll(4), false);
});

test('the lead media finishes unrolling halfway through its upward travel', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaLeadRollDuration, 'function');
  closeTo(mediaMotion.resolveProjectMediaLeadRollDuration(0.92), 0.46);
  closeTo(mediaMotion.resolveProjectMediaLeadRollDuration(0), 0);
});

test('stacked media at the same screen position have the same apparent roll size', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaItemRoll, 'function');

  const metrics = {
    viewportHeight: 1000,
    travel: 2000,
  };

  closeTo(mediaMotion.resolveProjectMediaItemRoll({ ...metrics, itemIndex: 1, itemTop: 750, galleryProgress: 0 }), 0.5);
  closeTo(mediaMotion.resolveProjectMediaItemRoll({ ...metrics, itemIndex: 2, itemTop: 1250, galleryProgress: 0.25 }), 0.5);
  closeTo(mediaMotion.resolveProjectMediaItemRoll({ ...metrics, itemIndex: 3, itemTop: 1750, galleryProgress: 0.5 }), 0.5);
});

test('project media becomes fully clear when its top reaches the viewport midpoint', () => {
  closeTo(mediaMotion.resolveProjectMediaItemRoll({
    itemIndex: 1,
    itemTop: 500,
    viewportHeight: 1000,
    travel: 2000,
    galleryProgress: 0,
  }), 1);
});

test('remounted media derives its roll from the real viewport position', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaRollFromViewportTop, 'function');

  closeTo(mediaMotion.resolveProjectMediaRollFromViewportTop(1350, 1350), 0);
  closeTo(mediaMotion.resolveProjectMediaRollFromViewportTop(1012.5, 1350), 0.5);
  closeTo(mediaMotion.resolveProjectMediaRollFromViewportTop(675, 1350), 1);
  closeTo(mediaMotion.resolveProjectMediaRollFromViewportTop(440, 1350), 1);
});

test('the cylindrical boundary stays visibly curled until late in the entrance', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaCurl, 'function');

  closeTo(mediaMotion.resolveProjectMediaCurl(0), 1);
  assert.ok(mediaMotion.resolveProjectMediaCurl(0.8) > 0.3);
  assert.ok(mediaMotion.resolveProjectMediaCurl(0.9) > 0.2);
  closeTo(mediaMotion.resolveProjectMediaCurl(1), 0);
});

test('project media roll progress remains stable at layout boundaries', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaItemRoll, 'function');

  assert.equal(mediaMotion.resolveProjectMediaItemRoll({
    itemIndex: 0,
    itemTop: 0,
    viewportHeight: 1000,
    travel: 2000,
    galleryProgress: 0,
  }), 1);

  assert.equal(mediaMotion.resolveProjectMediaItemRoll({
    itemIndex: 1,
    itemTop: 1000,
    viewportHeight: 1000,
    travel: 0,
    galleryProgress: 1,
  }), 0);
});

test('entry distortion uses coherent moving scanlines instead of static random blocks', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaHorizontalSmear, 'function');

  const first = mediaMotion.resolveProjectMediaHorizontalSmear(40, 1, 1000, 0);
  const adjacent = mediaMotion.resolveProjectMediaHorizontalSmear(41, 1, 1000, 0);
  const later = mediaMotion.resolveProjectMediaHorizontalSmear(40, 1, 1000, 0.5);

  assert.deepEqual(Object.keys(first).sort(), ['offsetX', 'stretchX']);
  assert.ok(Math.abs(first.offsetX - adjacent.offsetX) < 28, 'adjacent scanlines should form one continuous texture');
  assert.notDeepEqual(first, later, 'the texture should keep moving while scroll is stationary');
  assert.ok(first.stretchX > Math.abs(first.offsetX) * 2, 'horizontal extension should dominate lateral wobble');
  assert.ok(later.stretchX > Math.abs(later.offsetX) * 2, 'moving texture should remain a smear rather than a wave');

  assert.deepEqual(mediaMotion.resolveProjectMediaHorizontalSmear(8, 0, 1000, 10), { offsetX: 0, stretchX: 0 });
});

test('internal smear clears continuously while the curled canvas keeps ownership of the boundary', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaDistortion, 'function');

  const start = mediaMotion.resolveProjectMediaDistortion(0);
  const stillCurled = mediaMotion.resolveProjectMediaDistortion(0.92);
  const nearClear = mediaMotion.resolveProjectMediaDistortion(0.99);
  const clear = mediaMotion.resolveProjectMediaDistortion(1);

  assert.deepEqual(start, { smear: 1, canvasAlpha: 1 });
  assert.ok(stillCurled.smear > 0 && stillCurled.smear < 0.1);
  assert.equal(stillCurled.canvasAlpha, 1, 'the rectangular source must not show through a curled boundary');
  assert.ok(nearClear.smear > 0 && nearClear.smear < 0.1);
  assert.equal(nearClear.canvasAlpha, 1, 'the canvas must own every non-flat frame');
  assert.deepEqual(clear, { smear: 0, canvasAlpha: 0 });
});

test('every project gallery follows the Homepage travel pace before shorter rails finish', () => {
  assert.equal(typeof mediaMotion.resolveProjectMediaReferenceTravel, 'function');
  assert.equal(typeof mediaMotion.resolveProjectMediaGalleryOffset, 'function');

  const homepageTravel = mediaMotion.resolveProjectMediaReferenceTravel(1256, 5, 371);
  const digestTravel = mediaMotion.resolveProjectMediaReferenceTravel(514, 3, 371);
  const aiNameTravel = mediaMotion.resolveProjectMediaReferenceTravel(1627, 6, 371);

  closeTo(homepageTravel, 1256);
  closeTo(digestTravel, 1256);
  closeTo(aiNameTravel, 1256);
  closeTo(mediaMotion.resolveProjectMediaGalleryOffset(1256, homepageTravel, .25), 314);
  closeTo(mediaMotion.resolveProjectMediaGalleryOffset(514, digestTravel, .25), 314);
  closeTo(mediaMotion.resolveProjectMediaGalleryOffset(1627, aiNameTravel, .25), 314);
});

test('longer galleries add their overflow only after the curled lead media has settled', () => {
  closeTo(mediaMotion.resolveProjectMediaGalleryOffset(1627, 1256, .72), 904.32);
  closeTo(mediaMotion.resolveProjectMediaGalleryOffset(1627, 1256, 1), 1627);
  closeTo(mediaMotion.resolveProjectMediaGalleryOffset(514, 1256, 1), 514);
});
