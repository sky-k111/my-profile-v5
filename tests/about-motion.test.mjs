import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ABOUT_CLOSING_HOLD_DURATION,
  ABOUT_MOTION_SECTION_VH,
  ABOUT_TIMELINE_END,
  clamp01,
  resolveAboutMotionMode,
} from '../src/lib/about-motion.ts';

test('clamp01 bounds scroll progress', () => {
  assert.equal(clamp01(-0.2), 0);
  assert.equal(clamp01(0.45), 0.45);
  assert.equal(clamp01(1.4), 1);
});

test('motion mode respects viewport, pointer, and reduced motion', () => {
  assert.equal(resolveAboutMotionMode(1440, false, true), 'full');
  assert.equal(resolveAboutMotionMode(900, false, true), 'compact');
  assert.equal(resolveAboutMotionMode(390, false, false), 'static');
  assert.equal(resolveAboutMotionMode(1440, true, true), 'static');
});

test('the closing frame keeps only a short pause while preserving the earlier scroll pace', () => {
  assert.equal(ABOUT_CLOSING_HOLD_DURATION, 0.06);
  assert.equal(ABOUT_TIMELINE_END, 1);
  assert.equal(ABOUT_MOTION_SECTION_VH, 590);
});
