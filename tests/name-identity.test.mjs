import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PRESSURE_NAME } from '../src/lib/name.ts';

test('all user-facing identity strings use YIKAI CHEN', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const portrait = await readFile(
    new URL('../src/components/PortraitReveal.tsx', import.meta.url),
    'utf8',
  );

  assert.equal(PRESSURE_NAME, 'YIKAI CHEN');
  assert.doesNotMatch(html, /YIKI CHEN/);
  assert.doesNotMatch(portrait, /YIKI CHEN/);
  assert.match(html, /YIKAI CHEN \u2014 AI \/ Computer Science/);
});
