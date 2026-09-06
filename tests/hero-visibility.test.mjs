import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Hero stops its WebGL renderer after leaving the viewport', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const pixelBlast = await readFile(new URL('../src/components/PixelBlast.tsx', import.meta.url), 'utf8');

  assert.match(hero, /new IntersectionObserver/);
  assert.match(hero, /setHeroVisible\(entry\.isIntersecting\)/);
  assert.match(hero, /observer\.observe\(hero\)/);
  assert.match(hero, /const heroEffectsVisible = effectsActive && heroInViewport/);
  assert.match(hero, /\{heroEffectsVisible\s*&&\s*\([\s\S]*?<PixelBlast/);
  assert.match(hero, /observer\.disconnect\(\)/);
  assert.match(pixelBlast, /threeRef\.current\.raf\s*=\s*raf/);
  assert.match(pixelBlast, /function scheduleNextFrame\(\)/);
});

test('Hero loads its heavy WebGL backdrop outside the initial application module', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');

  assert.match(hero, /lazy\(\(\) => import\('\.\/PixelBlast'\)\)/);
  assert.match(hero, /<Suspense fallback=\{null\}>[\s\S]*?<PixelBlast/);
});

test('PixelBlast uses the current Three timer API', async () => {
  const pixelBlast = await readFile(new URL('../src/components/PixelBlast.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(pixelBlast, /THREE\.Clock/);
  assert.match(pixelBlast, /new THREE\.Timer\(\)/);
  assert.match(pixelBlast, /timer\.update\(timestamp\)/);
  assert.match(pixelBlast, /timer\.getElapsed\(\)/);
});

test('Hero pauses its text and portrait animation loops while offscreen', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const textPressure = await readFile(new URL('../src/components/TextPressure.tsx', import.meta.url), 'utf8');
  const portraitReveal = await readFile(new URL('../src/components/PortraitReveal.tsx', import.meta.url), 'utf8');

  assert.match(hero, /<TextPressure\s+active=\{heroVisible\}\s*\/>/);
  assert.match(hero, /<PortraitReveal\s+active=\{heroVisible\}\s*\/>/);
  assert.match(textPressure, /if \(!active \|\|/);
  assert.match(textPressure, /\}, \[active, fontReady\]\);/);
  assert.match(portraitReveal, /if \(!active\) return;/);
  assert.match(portraitReveal, /let cancelled = false;/);
  assert.match(portraitReveal, /cancelled = true;/);
  assert.match(portraitReveal, /\}, \[active\]\);/);
});

test('Hero starts the signature stroke only after the Hero becomes visible', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const signature = await readFile(new URL('../src/components/Signature.tsx', import.meta.url), 'utf8');

  assert.match(hero, /<Signature active=\{heroVisible\}\s*\/>/);
  assert.match(signature, /export default function Signature\(\{ active = true \}/);
  assert.match(signature, /gsap\.timeline\(\{ paused: true, delay: 0\.6 \}\)/);
  assert.match(signature, /if \(active\) timeline\.restart\(true\)/);
  assert.match(signature, /timeline\.pause\(0\)/);
});

test('the prewarmed Hero backdrop stays paused until the Hero becomes visible', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const pixelBlast = await readFile(new URL('../src/components/PixelBlast.tsx', import.meta.url), 'utf8');

  assert.match(hero, /<PixelBlast[\s\S]*?active=\{heroVisible\}/);
  assert.match(pixelBlast, /active\?: boolean/);
  assert.match(pixelBlast, /if \(!activeRef\.current \|\| framePending\) return/);
  assert.match(pixelBlast, /if \(active\) \{[\s\S]*?t\.start\?\.\(\)/);
  assert.match(pixelBlast, /else \{\s*t\.stop\?\.\(\)/);
});

test('Hero particles flicker into place instead of appearing fully formed', async () => {
  const pixelBlast = await readFile(new URL('../src/components/PixelBlast.tsx', import.meta.url), 'utf8');

  assert.match(pixelBlast, /uniform float uReveal/);
  assert.match(pixelBlast, /const PIXEL_REVEAL_DURATION_MS = 1_900/);
  assert.match(pixelBlast, /float revealRank = hash11/);
  assert.match(pixelBlast, /mix\(revealPulse, 1\.0, revealSettled\)/);
  assert.match(pixelBlast, /uReveal:\s*\{ value: 0 \}/);
  assert.match(pixelBlast, /revealStartedAt = performance\.now\(\)/);
  assert.match(pixelBlast, /revealElapsed \/ PIXEL_REVEAL_DURATION_MS/);
});
