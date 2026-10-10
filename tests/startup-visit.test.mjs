import assert from 'node:assert/strict';
import test from 'node:test';
import { startupCacheKey } from '../build/media-cache-plugin.mjs';
import { hasCompletedVisit, recordCompletedVisit } from '../src/lib/startup-visit.ts';

test('a completed visit opens directly on reload until a public asset changes', () => {
  const data = new Map();
  const storage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const first = startupCacheKey([{ url: '/racing-suit.png', revision: 'one' }]);
  const changed = startupCacheKey([{ url: '/racing-suit.png', revision: 'two' }]);
  assert.equal(hasCompletedVisit(storage, first), false);
  recordCompletedVisit(storage, first);
  assert.equal(hasCompletedVisit(storage, first), true);
  assert.equal(hasCompletedVisit(storage, changed), false);
});

test('storage restrictions keep the first-visit loader usable', () => {
  const unavailable = {
    getItem() { throw new Error('storage unavailable'); },
    setItem() { throw new Error('storage unavailable'); },
  };
  assert.equal(hasCompletedVisit(unavailable, 'revision'), false);
  assert.doesNotThrow(() => recordCompletedVisit(unavailable, 'revision'));
});
