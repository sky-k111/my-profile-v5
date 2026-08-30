import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('photo-roll demo expands a photo upward and respects reduced motion', async () => {
  const html = await readFile(new URL('../demo/photo-roll/index.html', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../demo/photo-roll/main.js', import.meta.url), 'utf8');

  assert.match(html, /class="photo-roll-demo"/);
  assert.match(html, /src="\/images\/about\/track\.jpg"/);
  assert.match(motion, /gsap\.timeline/);
  assert.match(motion, /rotationX/);
  assert.match(motion, /y:\s*'42vh'/);
  assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.match(html, /photo-roll-demo__slice/);
  assert.match(motion, /from:\s*'end'/);
  assert.match(motion, /skewX/);
  assert.match(motion, /scaleX/);
});
