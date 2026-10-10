import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMediaLoading } from '../src/lib/media-loading.ts';

test('loading waits for a decoded frame, not metadata or elapsed time', () => {
  assert.equal(resolveMediaLoading(0, 'initial'), true);
  assert.equal(resolveMediaLoading(1, 'initial'), true);
  assert.equal(resolveMediaLoading(2, 'loadeddata'), false);
  assert.equal(resolveMediaLoading(4, 'initial'), false);
});

test('buffering returns loading and playing clears it', () => {
  assert.equal(resolveMediaLoading(2, 'waiting'), true);
  assert.equal(resolveMediaLoading(3, 'canplay'), false);
  assert.equal(resolveMediaLoading(4, 'playing'), false);
  assert.equal(resolveMediaLoading(4, 'stalled'), false);
  assert.equal(resolveMediaLoading(2, 'stalled', false, true), true);
  assert.equal(resolveMediaLoading(1, 'seeking'), true);
  assert.equal(resolveMediaLoading(3, 'seeked'), false);
});

test('failed media remains loading and a fresh source restarts it', () => {
  assert.equal(resolveMediaLoading(4, 'error'), true);
  assert.equal(resolveMediaLoading(4, 'initial', true), true);
  assert.equal(resolveMediaLoading(4, 'loadstart'), true);
  assert.equal(resolveMediaLoading(0, 'emptied'), true);
});
