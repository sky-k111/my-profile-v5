import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rmdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createMediaManifest, publishCachedMedia } from '../build/media-cache-plugin.mjs';

test('a media URL remains stable across deployments and changes when its bytes change', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-media-hash-'));
  try {
    await writeFile(path.join(directory, 'preview.mp4'), 'original-video-bytes');
    await writeFile(path.join(directory, 'notes.txt'), 'not a media asset');
    const first = await createMediaManifest(directory);
    assert.deepEqual(await createMediaManifest(directory), first);
    assert.deepEqual(Object.keys(first), ['/projects/preview.mp4']);
    assert.match(first['/projects/preview.mp4'], /^\/projects\/cached\/preview\.[a-f0-9]{12}\.mp4$/);
    await writeFile(path.join(directory, 'preview.mp4'), 'updated-video-bytes');
    assert.notEqual((await createMediaManifest(directory))['/projects/preview.mp4'], first['/projects/preview.mp4']);
  } finally {
    for (const filename of await readdir(directory)) await unlink(path.join(directory, filename));
    await rmdir(directory);
  }
});

test('publishing moves media without changing its bytes or duplicating videos and preserves legacy links', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-media-publish-'));
  const projects = path.join(directory, 'projects');
  const video = Buffer.from('complete-video-data');
  const poster = Buffer.from('poster-data');
  try {
    await mkdir(projects);
    await writeFile(path.join(projects, 'preview.mp4'), video);
    await writeFile(path.join(projects, 'poster.jpg'), poster);
    await writeFile(path.join(directory, '_redirects'), '/old-page /new-page 302\n');
    const manifest = await createMediaManifest(projects);
    await publishCachedMedia(directory, manifest);
    assert.deepEqual(await readFile(path.join(directory, manifest['/projects/preview.mp4'].slice(1))), video);
    assert.deepEqual(await readFile(path.join(directory, manifest['/projects/poster.jpg'].slice(1))), poster);
    assert.deepEqual(await readdir(projects), ['cached']);
    const redirects = await readFile(path.join(directory, '_redirects'), 'utf8');
    assert.ok(redirects.includes(`/projects/preview.mp4 ${manifest['/projects/preview.mp4']} 302`));
    assert.ok(redirects.includes('/old-page /new-page 302'));
    assert.deepEqual(JSON.parse(await readFile(path.join(directory, 'project-media-manifest.json'), 'utf8')), manifest);
  } finally {
    const cached = path.join(projects, 'cached');
    for (const filename of await readdir(cached)) await unlink(path.join(cached, filename));
    await rmdir(cached);
    await rmdir(projects);
    await unlink(path.join(directory, '_redirects'));
    await unlink(path.join(directory, 'project-media-manifest.json'));
    await rmdir(directory);
  }
});
