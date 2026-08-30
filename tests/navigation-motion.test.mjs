import assert from 'node:assert/strict';
import test from 'node:test';

const navigationMotion = await import('../src/lib/navigation-motion.ts').catch(() => ({}));

test('section navigation avoids animated long-distance scrolling', () => {
  assert.equal(typeof navigationMotion.resolveNavigationScrollBehavior, 'function');
  assert.equal(navigationMotion.resolveNavigationScrollBehavior(900, 900, false), 'auto');
  assert.equal(navigationMotion.resolveNavigationScrollBehavior(2400, 900, false), 'auto');
});

test('section navigation preserves smooth motion for nearby targets only', () => {
  assert.equal(navigationMotion.resolveNavigationScrollBehavior(320, 900, false), 'smooth');
  assert.equal(navigationMotion.resolveNavigationScrollBehavior(320, 900, true), 'auto');
});

test('Projects navigation lands on the completed intro before the second page starts', () => {
  assert.equal(typeof navigationMotion.resolveProjectsNavigationTimelineTime, 'function');

  const landingTime = navigationMotion.resolveProjectsNavigationTimelineTime('projects');
  assert.equal(landingTime, 1.02);
  assert.ok(landingTime < 1.18, 'navigation must stop before the intro begins dispersing');
  assert.ok(landingTime < 1.41, 'navigation must stop before Selected Works enters');
});
