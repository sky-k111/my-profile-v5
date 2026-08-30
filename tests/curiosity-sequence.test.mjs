import assert from 'node:assert/strict';
import test from 'node:test';

const sequenceModule = await import('../src/about/curiosity-sequence.ts').catch(() => ({}));

test('curiosity photos form one ordered editorial shot list', () => {
  const steps = sequenceModule.CURIOSITY_PHOTO_SEQUENCE;
  assert.ok(Array.isArray(steps));
  assert.deepEqual(
    steps.map(step => step.photoId),
    ['photo-04', 'photo-07', 'photo-05', 'photo-06'],
  );
});

test('each curiosity photo shares one full-size stage with a distinct transition', () => {
  const steps = sequenceModule.CURIOSITY_PHOTO_SEQUENCE;
  assert.ok(Array.isArray(steps));
  assert.equal(new Set(steps.map(step => step.transition)).size, steps.length);

  for (let index = 1; index < steps.length; index += 1) {
    assert.ok(steps[index].revealAt > steps[index - 1].revealAt);
  }
});

test('each curiosity photo uses editorial copy instead of numeric pagination', () => {
  const steps = sequenceModule.CURIOSITY_PHOTO_SEQUENCE;
  assert.deepEqual(
    steps.map(step => step.caption),
    [
      'ROOM TO BREATHE.',
      'THE EVERYDAY, SEEN DIFFERENTLY.',
      'MOVING WITH THE SOUND.',
      'STILL MAKING. STILL MOVING.',
    ],
  );
});

test('the four curiosity photos stay in one continuous ordered composition', () => {
  const steps = sequenceModule.CURIOSITY_PHOTO_SEQUENCE;
  assert.equal(steps.length, 4);
  assert.ok(steps.every(step => !('spread' in step)));
});

test('curiosity rail travels only by its real horizontal overflow', () => {
  assert.equal(typeof sequenceModule.getCuriosityTrackOffset, 'function');
  assert.equal(sequenceModule.getCuriosityTrackOffset(3840, 1440), -2400);
  assert.equal(sequenceModule.getCuriosityTrackOffset(1200, 1440), 0);
});

test('curiosity rail holds the opening frame before it begins travelling', () => {
  assert.equal(typeof sequenceModule.getCuriosityRailProgress, 'function');
  assert.equal(sequenceModule.getCuriosityRailProgress(0.18), 0);
  assert.equal(sequenceModule.getCuriosityRailProgress(0.29), 0);
  assert.ok(Math.abs(sequenceModule.getCuriosityRailProgress(0.44) - 0.5) < 0.000001);
  assert.equal(sequenceModule.getCuriosityRailProgress(0.59), 1);
});

test('the second image joins the opening composition before the rail starts travelling', () => {
  const [, secondPhoto] = sequenceModule.CURIOSITY_PHOTO_SEQUENCE;
  assert.ok(secondPhoto.revealAt < sequenceModule.CURIOSITY_RAIL_WINDOW.start);
});

test('curiosity rail falls back to vertical flow on narrow or reduced-motion screens', () => {
  assert.equal(typeof sequenceModule.resolveCuriosityRailMode, 'function');
  assert.equal(sequenceModule.resolveCuriosityRailMode(1440, false), 'horizontal');
  assert.equal(sequenceModule.resolveCuriosityRailMode(767, false), 'vertical');
  assert.equal(sequenceModule.resolveCuriosityRailMode(1440, true), 'vertical');
});

test('vertical word rails cross the viewport in opposite directions with decisive travel', () => {
  assert.equal(typeof sequenceModule.getVerticalRailMotion, 'function');

  const upward = sequenceModule.getVerticalRailMotion('up');
  const downward = sequenceModule.getVerticalRailMotion('down');

  assert.ok(upward.from > upward.to);
  assert.ok(downward.from < downward.to);
  assert.ok(Math.abs(upward.to - upward.from) >= 90);
  assert.ok(Math.abs(downward.to - downward.from) >= 90);
});
