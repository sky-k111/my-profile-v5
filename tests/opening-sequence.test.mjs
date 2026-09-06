import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const opening = await import('../src/lib/opening-sequence.ts').catch(() => ({}));

test('the automatic opening plays on every home entry', () => {
  assert.equal(opening.OPENING_SEQUENCE_DURATION_MS, 7_200);
  assert.deepEqual(opening.resolveOpeningPlayback(false, ''), {
    shouldPlay: true,
    durationMs: 7_200,
  });
  assert.deepEqual(opening.resolveOpeningPlayback(false, '#home'), {
    shouldPlay: true,
    durationMs: 7_200,
  });
});

test('the opening yields only for reduced motion', () => {
  assert.deepEqual(opening.resolveOpeningPlayback(true, ''), {
    shouldPlay: false,
    durationMs: 0,
  });
  assert.equal(opening.resolveOpeningPlayback(false, '#about').shouldPlay, true);
});

test('the counter takes more than three seconds to reach 100 in measured stages', () => {
  assert.equal(opening.resolveOpeningFrame(0).counter, 0);
  assert.ok(opening.resolveOpeningFrame(1_000).counter >= 19);
  assert.ok(opening.resolveOpeningFrame(1_000).counter < 36);
  assert.ok(opening.resolveOpeningFrame(2_000).counter >= 54);
  assert.ok(opening.resolveOpeningFrame(2_000).counter < 72);
  assert.ok(opening.resolveOpeningFrame(3_000).counter >= 96);
  assert.ok(opening.resolveOpeningFrame(3_000).counter < 100);
  assert.equal(opening.resolveOpeningFrame(3_250).counter, 100);
});

test('the source-informed sequence holds, clears, and opens along one diagonal', () => {
  const hold = opening.resolveOpeningFrame(3_600);
  const clearing = opening.resolveOpeningFrame(4_800);
  const openingCurtain = opening.resolveOpeningFrame(6_500);
  const final = opening.resolveOpeningFrame(7_200);

  assert.equal(hold.counter, 100);
  assert.equal(hold.counterOpacity, 1);
  assert.ok(clearing.counterOpacity < 0.5);
  assert.ok(openingCurtain.curtain > 0.35);
  assert.equal(final.curtain, 1);
  assert.equal('seamOpacity' in openingCurtain, false);
});

test('the personal logo is the final opening element to leave', () => {
  const interfaceCleared = opening.resolveOpeningFrame(5_240);
  const logoLeaving = opening.resolveOpeningFrame(5_720);
  const logoCleared = opening.resolveOpeningFrame(5_950);

  assert.equal(interfaceCleared.interfaceOpacity, 0);
  assert.equal(interfaceCleared.counterOpacity, 0);
  assert.equal(interfaceCleared.markOpacity, 1);
  assert.ok(logoLeaving.markOpacity > 0);
  assert.ok(logoLeaving.markOpacity < 1);
  assert.equal(logoLeaving.curtain, 0);
  assert.equal(logoCleared.markOpacity, 0);
  assert.equal(logoCleared.curtain, 0);
});

test('custom name glyphs reveal and disappear in deliberately irregular orders', () => {
  const partialReveal = opening.OPENING_LETTERS.split('').map((_, index) => (
    opening.resolveOpeningGlyphOpacity(650, index)
  ));
  const hold = opening.OPENING_LETTERS.split('').map((_, index) => (
    opening.resolveOpeningGlyphOpacity(3_500, index)
  ));
  const partialExit = opening.OPENING_LETTERS.split('').map((_, index) => (
    opening.resolveOpeningGlyphOpacity(4_650, index)
  ));

  assert.ok(new Set(partialReveal.map((value) => value.toFixed(2))).size > 2);
  assert.deepEqual(hold, Array(opening.OPENING_LETTERS.length).fill(1));
  assert.ok(partialExit.some((value) => value === 0));
  assert.ok(partialExit.some((value) => value > 0));
});

test('the C holds after the other name glyphs and still clears before the logo', () => {
  const cIndex = opening.OPENING_LETTERS.indexOf('C');
  const afterOtherGlyphs = opening.OPENING_LETTERS.split('').map((_, index) => (
    opening.resolveOpeningGlyphOpacity(5_200, index)
  ));

  assert.equal(opening.OPENING_C_EXIT_DELAY_MS, 260);
  assert.ok(afterOtherGlyphs[cIndex] > 0);
  assert.ok(afterOtherGlyphs.every((opacity, index) => index === cIndex || opacity === 0));
  assert.equal(opening.resolveOpeningGlyphOpacity(5_400, cIndex), 0);
  assert.equal(opening.resolveOpeningFrame(5_400).markOpacity, 1);
});

test('the Hero warms immediately before the diagonal curtain reveals it', () => {
  assert.equal(opening.resolveOpeningFrame(5_049).prepareHeroEffects, false);
  assert.equal(opening.resolveOpeningFrame(5_050).prepareHeroEffects, true);
  assert.equal(opening.resolveOpeningFrame(5_050).curtain, 0);
});

test('the denser identity interface contains no Hero imagery', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const component = await readFile(new URL('../src/components/OpeningSequence.tsx', import.meta.url), 'utf8');
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const nav = await readFile(new URL('../src/components/SiteNav.tsx', import.meta.url), 'utf8');
  const microChrome = await readFile(new URL('../src/components/HeroMicroChrome.tsx', import.meta.url), 'utf8');
  const personalLogo = await readFile(new URL('../src/components/PersonalLogo.css', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/components/OpeningSequence.css', import.meta.url), 'utf8');
  const microCss = await readFile(new URL('../src/components/HeroMicroChrome.css', import.meta.url), 'utf8');

  assert.match(app, /onPrepareHeroEffects=\{prepareHeroEffects\}/);
  assert.match(app, /onComplete=\{completeOpening\}/);
  assert.match(app, /<SiteNav items=\{SITE_NAV_ITEMS\} deepLinkRestoreReady=\{heroEffectsPrepared\}\s*\/>/);
  assert.match(app, /<Hero active=\{openingComplete\} effectsActive=\{openingComplete \|\| heroEffectsPrepared\}\s*\/>/);
  assert.equal(opening.OPENING_LABEL, 'YIKAI CHEN');
  assert.match(component, /GlyphShape/);
  assert.match(component, /<PersonalLogo className="opening-sequence__brand-logo"/);
  assert.match(nav, /<PersonalLogo className="site-nav__brand-mark"/);
  assert.match(personalLogo, /url\('\/yikai-logo\.png'\)/);
  assert.match(component, /opening-sequence__rail/);
  assert.match(component, /opening-sequence__registration/);
  assert.match(component, /frame\.curtain >= 0\.055 \? 'open' : 'covered'/);
  assert.doesNotMatch(component, /<img/);
  assert.doesNotMatch(component, /opening-sequence__seam/);
  assert.doesNotMatch(component, /forest-opening/);
  assert.doesNotMatch(component, /opening-sequence__energy/);
  assert.match(css, /clip-path:\s*polygon\(0 0, 100% 0, 100% 63\.4%, 0 37\.4%\)/);
  assert.match(css, /clip-path:\s*polygon\(0 36\.6%, 100% 62\.6%, 100% 100%, 0 100%\)/);
  assert.doesNotMatch(css, /opening-sequence__seam/);
  assert.doesNotMatch(css, /clip-path:\s*inset/);
  assert.match(css, /data-curtain-gap='open'/);
  assert.match(css, /--opening-progress/);
  assert.match(css, /--opening-counter-enter/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(hero, /const heroEffectsVisible = effectsActive && heroInViewport/);
  assert.match(app, /<HeroMicroChrome openingActive=\{!openingComplete\}\s*\/>/);
  assert.match(app, /<div className="hero-shell">[\s\S]*<HeroMicroChrome[\s\S]*<Hero /);
  assert.doesNotMatch(hero, /HeroMicroChrome/);
  assert.match(microChrome, /YIKAI CHEN \/ PORTFOLIO 2026/);
  assert.match(microChrome, /HANGZHOU \/ UTC\+08/);
  assert.match(microChrome, /DESIGN · CODE · EXPERIMENTS/);
  assert.match(microChrome, /30\.2741° N/);
  assert.match(microChrome, /formatHangzhouTime/);
  assert.match(microCss, /hero-micro-character-in 1200ms/);
  assert.match(microCss, /var\(--micro-index\) \* 17ms/);
  assert.match(microCss, /hero-micro-time-in 900ms/);
  assert.match(microCss, /\.hero-micro-chrome\s*\{[^}]*position:\s*absolute/s);
  assert.doesNotMatch(microCss, /\.hero-micro-chrome\s*\{[^}]*position:\s*fixed/s);
  assert.match(microCss, /data-opening='true'/);
});
