import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Hero preserves the complete two-line title on mobile without adding an overlay seam', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');

  assert.doesNotMatch(css, /\.hero::after/);
  assert.match(css, /#name-pressure \.text-pressure-space\s*\{[\s\S]*?flex:\s*0 0 100%;/);
  assert.match(css, /@media \(max-width: 700px\) \{[\s\S]*?#hero-title\s*\{[\s\S]*?width:\s*72vw;/);
  assert.match(css, /@media \(max-width: 700px\) \{[\s\S]*?#name-pressure\s*\{[\s\S]*?font-size:\s*clamp\(3\.15rem, 16vw, 4\.5rem\)/);
});

test('Hero keeps the portrait in its original stage position', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');

  assert.match(css, /\.hero\s*\{[\s\S]*?grid-template-columns:\s*minmax\(280px, \.76fr\) minmax\(430px, 1\.24fr\);/);
  assert.match(css, /\.portrait-stage\s*\{[\s\S]*?align-self:\s*end;[\s\S]*?justify-self:\s*center;/);
  assert.match(css, /\.portrait-stage\s*\{[\s\S]*?transform:\s*translateX\(6%\);/);
});
