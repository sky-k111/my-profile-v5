import assert from 'node:assert/strict';
import test from 'node:test';
import { bufferedSecondsAhead, hasFilmStartBuffer } from '../src/lib/media-buffer.ts';

test('film buffering uses the range containing the playback position, not a distant downloaded segment', () => {
  assert.equal(bufferedSecondsAhead(5, [[0, 10], [50, 80]]), 5);
  assert.equal(bufferedSecondsAhead(20, [[0, 10], [50, 80]]), 0);
  assert.equal(bufferedSecondsAhead(60, [[0, 10], [50, 80]]), 20);
});

test('films build an eight second buffer and can resume near the end without waiting for nonexistent frames', () => {
  assert.equal(hasFilmStartBuffer(0, 125, 1), false);
  assert.equal(hasFilmStartBuffer(0, 125, 8), true);
  assert.equal(hasFilmStartBuffer(122, 125, 3), true);
  assert.equal(hasFilmStartBuffer(0, NaN, 8), false);
});
