import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const opening = await import('../src/lib/opening-sequence.ts').catch(() => ({}));

test('the automatic opening plays on the home entry without waiting for scroll', () => {
  assert.equal(opening.OPENING_SEQUENCE_DURATION_MS, 6_000);
  assert.deepEqual(opening.resolveOpeningPlayback(false, ''), {
    shouldPlay: true,
    durationMs: 6_000,
  });
  assert.deepEqual(opening.resolveOpeningPlayback(false, '#home'), {
    shouldPlay: true,
    durationMs: 6_000,
  });
});

test('the opening yields only for reduced motion and still plays for section refreshes', () => {
  assert.deepEqual(opening.resolveOpeningPlayback(true, ''), {
    shouldPlay: false,
    durationMs: 0,
  });
  assert.deepEqual(opening.resolveOpeningPlayback(false, '#about'), {
    shouldPlay: true,
    durationMs: 6_000,
  });
  assert.deepEqual(opening.resolveOpeningPlayback(false, '#projects'), {
    shouldPlay: true,
    durationMs: 6_000,
  });
});

test('the white-stage opening transforms one box into the split-bracket system', () => {
  const first = opening.resolveOpeningFrame(0);
  const openingFrame = opening.resolveOpeningFrame(2_000);
  const named = opening.resolveOpeningFrame(2_800);
  const reveal = opening.resolveOpeningFrame(4_400);
  const final = opening.resolveOpeningFrame(6_000, false);

  assert.deepEqual(first, {
    spread: 0,
    slashReveal: 0,
    nameReveal: 0,
    mediaReveal: 0,
    cameraScale: 1.14,
    handoff: 0,
    prepareHeroEffects: false,
  });
  assert.ok(openingFrame.spread > 0);
  assert.ok(openingFrame.slashReveal > 0.5);
  assert.ok(named.nameReveal > 0.5);
  assert.equal(named.mediaReveal, 0);
  assert.equal(reveal.spread, 1);
  assert.ok(reveal.mediaReveal > 0.5);
  assert.ok(reveal.cameraScale < first.cameraScale);
  assert.equal(final.handoff, 1);
  assert.equal(final.prepareHeroEffects, true);
});

test('the Hero backdrop warms during the static opening hold', () => {
  const warmup = opening.resolveOpeningFrame(250);

  assert.equal(opening.resolveOpeningFrame(249).prepareHeroEffects, false);
  assert.equal(warmup.prepareHeroEffects, true);
  assert.equal(warmup.spread, 0);
  assert.equal(warmup.mediaReveal, 0);
});

test('the photograph starts only after the name has begun to resolve', () => {
  const beforeMedia = opening.resolveOpeningFrame(2_800);
  const withMedia = opening.resolveOpeningFrame(3_400);

  assert.equal(beforeMedia.mediaReveal, 0);
  assert.ok(beforeMedia.nameReveal > 0.5);
  assert.ok(withMedia.mediaReveal > 0);
  assert.ok(withMedia.nameReveal > withMedia.mediaReveal);
});

test('the slash grows from zero and the name frosts only with the photograph', () => {
  assert.equal(opening.resolveOpeningFrame(1_400).slashReveal, 0);
  assert.ok(opening.resolveOpeningFrame(1_800).slashReveal > 0);
  assert.ok(opening.resolveOpeningFrame(1_800).slashReveal < 1);
  assert.equal(opening.resolveOpeningFrame(2_200).slashReveal, 1);

  assert.deepEqual(opening.resolveNameTreatment(0), {
    tone: 23,
    alpha: 1,
    blurPx: 0,
  });
  assert.deepEqual(opening.resolveNameTreatment(1), {
    tone: 244,
    alpha: 0.46,
    blurPx: 0.35,
  });
});

test('the automatic opening finishes before Hero animation is activated', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const component = await readFile(new URL('../src/components/OpeningSequence.tsx', import.meta.url), 'utf8');
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/components/OpeningSequence.css', import.meta.url), 'utf8');
  const nav = await readFile(new URL('../src/components/SiteNav.tsx', import.meta.url), 'utf8');

  assert.match(app, /onPrepareHeroEffects=\{prepareHeroEffects\}/);
  assert.match(app, /onComplete=\{completeOpening\}/);
  assert.match(app, /<Hero active=\{openingComplete\} effectsActive=\{openingComplete \|\| heroEffectsPrepared\}\s*\/>/);
  assert.match(component, /resolveOpeningPlayback/);
  assert.match(component, /frame\.prepareHeroEffects/);
  assert.match(component, /animationName === 'opening-sequence-exit'/);
  assert.doesNotMatch(component, /addEventListener\(['"]scroll/);
  assert.doesNotMatch(component, /<StrokeText/);
  assert.match(component, /YIKAI/);
  assert.match(component, /CHEN/);
  assert.match(component, /requestAnimationFrame/);
  assert.match(component, /resolveOpeningFrame/);
  assert.match(component, /opening-sequence__corner--top-left/);
  assert.match(component, /opening-sequence__corner--bottom-right/);
  assert.match(component, /opening-sequence__slash/);
  assert.match(component, /opening-sequence__media-frame/);
  assert.doesNotMatch(component, /masked-heading--fill/);
  assert.doesNotMatch(css, /background-clip:\s*text/);
  assert.match(css, /background:\s*#fff/);
  assert.match(css, /scaleY\(var\(--opening-slash-reveal\)\)/);
  assert.match(nav, /<BrandMark/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(hero, /const heroEffectsVisible = effectsActive && heroInViewport/);
  assert.match(hero, /\{heroEffectsVisible && \(/);
  assert.match(hero, /01 \/ HOME/);
});
