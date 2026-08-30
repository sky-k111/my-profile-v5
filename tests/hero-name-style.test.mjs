import assert from 'node:assert/strict';
import test from 'node:test';
import * as heroPresentation from '../src/lib/pressure.ts';

test('Hero name waits for the shared About display font before becoming visible', () => {
  assert.equal(typeof heroPresentation.getHeroNameStyle, 'function');

  assert.deepEqual(heroPresentation.getHeroNameStyle(false), {
    fontFamily: "'Cormorant Garamond Variable', Georgia, serif",
    opacity: 0,
  });
  assert.equal(heroPresentation.getHeroNameStyle(true).opacity, 1);
});

test('Hero pressure interaction uses only axes supported by the About display font', () => {
  assert.equal(typeof heroPresentation.getHeroPressureVariation, 'function');

  assert.equal(heroPresentation.getHeroPressureVariation(0, 100), "'wght' 700");
  assert.equal(heroPresentation.getHeroPressureVariation(100, 100), "'wght' 300");
});

test('Hero pressure interaction adds a strong compositor-only letter response', () => {
  assert.equal(typeof heroPresentation.getHeroPressureTransform, 'function');

  assert.equal(
    heroPresentation.getHeroPressureTransform(0, 100),
    'scaleX(1.180) scaleY(1.080) translateY(-0.025em)',
  );
  assert.equal(
    heroPresentation.getHeroPressureTransform(100, 100),
    'scaleX(0.960) scaleY(1.000) translateY(0.000em)',
  );
});
