import assert from 'node:assert/strict';
import test from 'node:test';
import { hasPreviewBuffer, updateGalleryReadiness } from '../src/lib/preview-readiness.ts';

const prepared = { ready: true, required: true, visible: true };
const waiting = { ready: false, required: true, visible: true };
const deferred = { ready: false, required: false, visible: false };

test('a short preview waits for the whole loop rather than flashing its first frame', () => {
  assert.equal(hasPreviewBuffer(3.53, .2), false);
  assert.equal(hasPreviewBuffer(3.53, 2), false);
  assert.equal(hasPreviewBuffer(3.53, 3.53), true);
  assert.equal(hasPreviewBuffer(27.23, .2), false);
  assert.equal(hasPreviewBuffer(27.23, 8), false);
  assert.equal(hasPreviewBuffer(NaN, 8), false);
});

test('the column opens once its all previews are prepared including those below the viewport', () => {
  let state = { projectId: 'homepage', items: {}, revealed: false };
  state = updateGalleryReadiness(state, 'homepage', 3, 0, prepared);
  state = updateGalleryReadiness(state, 'homepage', 3, 1, waiting);
  state = updateGalleryReadiness(state, 'homepage', 3, 2, deferred);
  assert.equal(state.revealed, false);
  state = updateGalleryReadiness(state, 'homepage', 3, 1, prepared);
  assert.equal(state.revealed, false);
  state = updateGalleryReadiness(state, 'homepage', 3, 2, waiting);
  assert.equal(state.revealed, false);
  state = updateGalleryReadiness(state, 'homepage', 3, 2, prepared);
  assert.equal(state.revealed, true);
});

test('a new project waits for its own previews while multiple pending items share one indicator', () => {
  let state = { projectId: 'homepage', items: { 0: prepared }, revealed: true };
  state = updateGalleryReadiness(state, 'forge-sight', 2, 0, waiting);
  assert.equal(state.revealed, false);
  assert.equal(state.projectId, 'forge-sight');
  state = updateGalleryReadiness(state, 'forge-sight', 2, 1, waiting);
  state = updateGalleryReadiness(state, 'forge-sight', 2, 0, prepared);
  assert.equal(state.revealed, false);
  state = updateGalleryReadiness(state, 'forge-sight', 2, 1, prepared);
  assert.equal(state.revealed, true);
});
