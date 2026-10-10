import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareImage, preparedImage } from '../src/lib/prepared-images.ts';

test('portrait preparation shares pending decoding and retains the decoded image for reveal', async () => {
  const original = globalThis.Image;
  let finish;
  let created = 0;
  globalThis.Image = class {
    constructor() { created++; }
    decode() { return new Promise(resolve => { finish = resolve; }); }
  };
  try {
    const first = prepareImage('/test-suit.png');
    assert.equal(preparedImage('/test-suit.png'), undefined);
    assert.equal(prepareImage('/test-suit.png'), first);
    finish();
    const image = await first;
    assert.equal(preparedImage('/test-suit.png'), image);
    assert.equal(await prepareImage('/test-suit.png'), image);
    assert.equal(created, 1);
  } finally {
    globalThis.Image = original;
  }
});

test('a failed decode can be retried instead of permanently disabling reveal', async () => {
  const original = globalThis.Image;
  let attempts = 0;
  globalThis.Image = class {
    async decode() { if (++attempts === 1) throw new Error('decode failed'); }
  };
  try {
    await assert.rejects(prepareImage('/retry-suit.png'));
    assert.equal(preparedImage('/retry-suit.png'), undefined);
    assert.ok(await prepareImage('/retry-suit.png'));
    assert.equal(attempts, 2);
  } finally {
    globalThis.Image = original;
  }
});
