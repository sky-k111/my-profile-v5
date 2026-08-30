import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Hero renders an accessible animated control that targets About', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const indicator = await readFile(new URL('../src/components/HeroScrollIndicator.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');

  assert.match(hero, /<HeroScrollIndicator\s*\/>/);
  assert.match(indicator, /href="#about"/);
  assert.match(indicator, /aria-label="Scroll to About"/);
  assert.match(indicator, /resolveNavigationScrollBehavior/);
  assert.match(css, /\.hero-scroll-indicator\s*\{[^}]*bottom:\s*clamp\(16px, 2\.2vw, 34px\)/);
  assert.match(css, /@keyframes hero-scroll-pulse/);
});

test('Hero scroll indicator respects reduced motion', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero-scroll-indicator\s*\{[^}]*animation:\s*none/);
});
