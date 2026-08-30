import assert from 'node:assert/strict';
import test from 'node:test';

const directoryState = await import('../src/lib/project-directory-state.ts').catch(() => ({}));

test('all project names stay emphasized until one project is hovered', () => {
  assert.equal(typeof directoryState.resolveProjectNameEmphasis, 'function');

  const projectIds = ['homepage', 'ai-name', 'trending-digest', 'educanvas', 'forge-sight'];
  assert.deepEqual(
    projectIds.map(projectId => directoryState.resolveProjectNameEmphasis(projectId, null)),
    ['featured', 'featured', 'featured', 'featured', 'featured'],
  );
});

test('hovering one project mutes every other project name', () => {
  assert.equal(directoryState.resolveProjectNameEmphasis('ai-name', 'ai-name'), 'active');
  assert.equal(directoryState.resolveProjectNameEmphasis('homepage', 'ai-name'), 'muted');
  assert.equal(directoryState.resolveProjectNameEmphasis('educanvas', 'ai-name'), 'muted');
});

test('every project change holds the transition loader for two seconds', () => {
  assert.equal(directoryState.PROJECT_SWITCH_LOADING_MS, 2_000);
  assert.equal(typeof directoryState.shouldStartProjectSwitch, 'function');
  assert.equal(directoryState.shouldStartProjectSwitch('homepage', 'ai-name'), true);
  assert.equal(directoryState.shouldStartProjectSwitch('homepage', 'homepage'), false);
});

test('media crossfades from the loader without extending the fixed loading hold', () => {
  assert.equal(directoryState.PROJECT_MEDIA_REVEAL_MS, 520);
  assert.ok(directoryState.PROJECT_MEDIA_REVEAL_MS < directoryState.PROJECT_SWITCH_LOADING_MS);
});
