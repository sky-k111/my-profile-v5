import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createStartupManifest } from '../build/media-cache-plugin.mjs';
import { startupProgress, prepareStartupResources, preparedMediaSource } from '../src/lib/startup-resources.ts';

test('startup manifest counts nested fonts, images, chunks, and entire films', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-startup-'));
  try {
    await mkdir(path.join(root, 'projects'));
    await writeFile(path.join(root, 'projects/film.mp4'), 'full video');
    await writeFile(path.join(root, 'font.woff2'), 'font');
    await writeFile(path.join(root, 'chunk.js'), 'javascript');
    await writeFile(path.join(root, 'portrait.png'), 'picture');
    await writeFile(path.join(root, 'startup-manifest.json'), '[]');
    const assets = await createStartupManifest(root);
    assert.equal(assets.length, 4);
    assert.equal(assets.reduce((sum, asset) => sum + asset.bytes, 0), 31);
    assert.ok(assets.some(asset => asset.url === '/projects/film.mp4'));
    const before = assets.find(asset => asset.url === '/portrait.png').revision;
    await writeFile(path.join(root, 'portrait.png'), 'changed');
    const after = (await createStartupManifest(root)).find(asset => asset.url === '/portrait.png').revision;
    assert.notEqual(before, after, 'same-size image replacements invalidate the cache');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('reload reuses complete cached films and removes incomplete cached responses for retry', async () => {
  const originals = { fetch: globalThis.fetch, window: globalThis.window, caches: globalThis.caches };
  const entries = new Map([
    ['/cached-film.mp4?portfolio-revision=good', new Response('abc')],
    ['/broken-film.mp4?portfolio-revision=bad', new Response('a')],
  ]);
  const requests = [];
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.caches = { open: async () => ({
    match: async key => entries.get(key)?.clone(),
    delete: async key => entries.delete(key),
    put: async (key, response) => { entries.set(key, response); },
  }) };
  globalThis.fetch = async url => {
    requests.push(url);
    if (url === '/startup-manifest.json') return Response.json([
      { url: '/cached-film.mp4', bytes: 3, revision: 'good' },
      { url: '/broken-film.mp4', bytes: 3, revision: 'bad' },
    ]);
    return new Response('unavailable', { status: 503 });
  };
  try {
    await assert.rejects(prepareStartupResources(() => {}), /资源不完整/);
    assert.ok(preparedMediaSource('/cached-film.mp4').startsWith('blob:'));
    assert.equal(requests.includes('/cached-film.mp4'), false);
    assert.equal(entries.has('/broken-film.mp4?portfolio-revision=bad'), false);
    await assert.rejects(prepareStartupResources(() => {}));
    assert.equal(requests.filter(url => url === '/broken-film.mp4').length, 1);
    URL.revokeObjectURL(preparedMediaSource('/cached-film.mp4'));
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});

test('100 percent requires readiness even after the final byte arrives', () => {
  assert.equal(startupProgress(0, 0, false), 0);
  assert.equal(startupProgress(25, 100, false), .25);
  assert.equal(startupProgress(100, 100, false), .99);
  assert.equal(startupProgress(100, 100, true), 1);
});

test('failed downloads never report ready and retry preserves complete video blobs', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  const states = [];
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.fetch = async url => {
    requests.push(url);
    if (url === '/startup-manifest.json') return Response.json([
      { url: '/test-good.mp4', bytes: 3 }, { url: '/test-failed.mp4', bytes: 3 },
    ]);
    return url === '/test-good.mp4' ? new Response('abc') : new Response('unavailable', { status: 503 });
  };
  try {
    await assert.rejects(prepareStartupResources(state => states.push(state)));
    const blob = preparedMediaSource('/test-good.mp4');
    assert.ok(blob.startsWith('blob:'));
    await assert.rejects(prepareStartupResources(state => states.push(state)));
    assert.equal(requests.filter(url => url === '/test-good.mp4').length, 1);
    assert.equal(preparedMediaSource('/test-good.mp4'), blob);
    assert.ok(states.every(state => !state.ready));
    assert.ok(states.at(-1).error);
    URL.revokeObjectURL(blob);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
