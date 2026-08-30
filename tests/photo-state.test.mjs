import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPhotoState,
  resetPhotoState,
  resolvePhotoStatus,
} from '../src/lib/photo-state.ts';

test('photo lifecycle retries the same URL after an empty transition', () => {
  let state = { src: '/portrait.jpg', status: 'failed' };

  state = resetPhotoState(state, undefined);
  assert.deepEqual(state, createPhotoState(undefined));

  state = resetPhotoState(state, '/portrait.jpg');
  assert.equal(resolvePhotoStatus(state, '/portrait.jpg'), 'loading');
});

test('a new URL never inherits the previous loaded state', () => {
  const loaded = { src: '/first.jpg', status: 'loaded' };

  assert.equal(resolvePhotoStatus(loaded, '/second.jpg'), 'loading');
  assert.deepEqual(resetPhotoState(loaded, '/second.jpg'), createPhotoState('/second.jpg'));
});
