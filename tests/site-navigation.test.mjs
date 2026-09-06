import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('site navigation has one configuration entry for every current page section', async () => {
  const navigation = await import('../src/lib/navigation.ts').catch(() => ({}));

  assert.deepEqual(navigation.SITE_NAV_ITEMS, [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
  ]);
});

test('section URLs preserve non-Hero refresh destinations without adding history entries', async () => {
  const navigation = await import('../src/lib/navigation.ts').catch(() => ({}));
  const nav = await readFile(new URL('../src/components/SiteNav.tsx', import.meta.url), 'utf8');

  assert.equal(typeof navigation.resolveSectionNavigationUrl, 'function');
  assert.equal(navigation.resolveSectionNavigationUrl('home', '/portfolio', '?preview=1'), '/portfolio?preview=1');
  assert.equal(navigation.resolveSectionNavigationUrl('about', '/portfolio', '?preview=1'), '/portfolio?preview=1#about');
  assert.equal(navigation.resolveSectionNavigationUrl('projects', '/', ''), '/#projects');
  assert.equal(navigation.resolveSectionNavigationUrl('contact', '/', ''), '/#contact');
  assert.equal(navigation.resolveInitialSectionId('#about', navigation.SITE_NAV_ITEMS), 'about');
  assert.equal(navigation.resolveInitialSectionId('#projects', navigation.SITE_NAV_ITEMS), 'projects');
  assert.equal(navigation.resolveInitialSectionId('#contact', navigation.SITE_NAV_ITEMS), 'contact');
  assert.equal(navigation.resolveInitialSectionId('#missing', navigation.SITE_NAV_ITEMS), null);
  assert.match(nav, /window\.history\.replaceState/);
  assert.match(nav, /if \(syncUrl\) syncSectionUrl\(id\)/);
  assert.match(nav, /sectionRangesRef/);
  assert.match(nav, /scrollRangeRef/);
  assert.match(nav, /initialSectionIdRef/);
  assert.match(nav, /deepLinkRestoreReady/);
  assert.match(nav, /if \(!deepLinkRestoreReady\) return/);
  assert.match(nav, /initialSectionId && !deepLinkRestoreReady/);
  assert.match(nav, /initialSectionId === 'projects'[\s\S]*site-section-navigation[\s\S]*scrollIntoView/);
  assert.match(nav, /updateActiveSection\(false\)/);
  assert.match(nav, /distance <= closest\.distance/);
  assert.match(nav, /syncSectionUrl\(id\)/);
});

test('App mounts the persistent navigation outside its single main landmark', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.match(app, /<SiteNav items=\{SITE_NAV_ITEMS\} deepLinkRestoreReady=\{heroEffectsPrepared\}\s*\/>[\s\S]*?<main>/);
});

test('section navigation keeps About scroll-driven while Projects retain their own entry event', async () => {
  const nav = await readFile(new URL('../src/components/SiteNav.tsx', import.meta.url), 'utf8');
  const aboutMotion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const projectsMotion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const projectsCss = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(nav, /new CustomEvent\('site-section-navigation', \{ detail: \{ id \} \}\)/);
  // About's opening portrait is owned only by its scrubbed ScrollTrigger.
  // Navigation may position the page but never directly plays or resets it.
  assert.doesNotMatch(aboutMotion, /addEventListener\('site-section-navigation'/);
  assert.doesNotMatch(aboutMotion, /navigationTween/);
  assert.match(aboutMotion, /trigger:\s*root,[\s\S]*?start:\s*'top top'/);
  assert.match(projectsMotion, /addEventListener\('site-section-navigation'/);
  assert.match(projectsMotion, /id !== 'projects'/);
  assert.match(projectsMotion, /trigger\?\.disable/);
  assert.match(projectsMotion, /trigger\?\.enable/);
  assert.match(projectsMotion, /gsap\.to\(timeline/);
  assert.match(projectsMotion, /data-transition-nav-entering/);
  assert.match(nav, /if \(id === 'projects'\) \{\s*window\.dispatchEvent/);
  assert.match(nav, /forcedActiveRef/);
  assert.match(projectsMotion, /site-section-navigation-complete/);
  assert.match(projectsCss, /data-transition-nav-entering[^}]*background:\s*var\(--transition-paper\)/);
  assert.match(projectsCss, /data-transition-nav-entering[^}]*\.projects-transition__veil[^}]*opacity:\s*1/);
});

test('About opening is reversible exclusively through its scroll trigger', async () => {
  const aboutMotion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.equal(aboutMotion.match(/ScrollTrigger\.create\(/g)?.length, 1);
  assert.match(aboutMotion, /\.fromTo\([\s\S]*?\[data-photo="photo-01"\] \.about-photo__media[\s\S]*?clipPath: 'inset\(100% 0 0\)'[\s\S]*?clipPath: 'inset\(0% 0 0\)'/);
});

test('Navigation indicator moves on the compositor instead of causing a layout jump', async () => {
  const css = await readFile(new URL('../src/components/SiteNav.css', import.meta.url), 'utf8');

  assert.match(css, /\.site-nav__indicator\s*\{[^}]*will-change:\s*transform, width/);
});

test('Hero particle field uses the higher-contrast but bounded configuration', async () => {
  const effects = await import('../src/lib/hero-effects.ts').catch(() => ({}));

  assert.deepEqual(effects.HERO_PIXEL_BLAST, {
    color: '#d85a42',
    pixelSize: 8,
    patternDensity: 1.15,
    edgeFade: 0.28,
    speed: 0.38,
  });
});
