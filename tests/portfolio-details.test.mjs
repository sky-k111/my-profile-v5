import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the global edge chrome keeps reading progress without a left chapter navigation', async () => {
  const nav = await readFile(new URL('../src/components/SiteNav.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/components/SiteNav.css', import.meta.url), 'utf8');

  assert.doesNotMatch(nav, /ChapterBadge/);
  assert.doesNotMatch(css, /chapter-badge/);
  assert.match(nav, /className="portfolio-progress" data-section=\{activeId\}/);
  assert.match(nav, /scrollRangeRef/);
  assert.match(nav, /sectionRangesRef/);
  assert.match(nav, /progressRef\.current\.style\.transform/);
  assert.equal(nav.match(/addEventListener\('scroll'/g)?.length, 1);
  assert.match(css, /\.portfolio-progress > span\s*\{[^}]*scaleX\(0\)/);
});

test('each major chapter repeats the opening registration-mark language', async () => {
  const marks = await readFile(new URL('../src/components/SectionMarks.tsx', import.meta.url), 'utf8');
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const about = await readFile(new URL('../src/about/AboutSection.tsx', import.meta.url), 'utf8');
  const projects = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const contact = await readFile(new URL('../src/contact/ContactSection.tsx', import.meta.url), 'utf8');

  assert.match(marks, /section-marks__corner--top-left/);
  assert.match(marks, /section-marks__corner--bottom-right/);
  for (const source of [hero, about, projects, contact]) assert.match(source, /<SectionMarks\s*\/>/);
});

test('the portfolio chapter numbers run continuously from Home through Contact', async () => {
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const about = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');
  const projects = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const contact = await readFile(new URL('../src/contact/ContactSection.tsx', import.meta.url), 'utf8');

  assert.match(hero, /01 \/ HOME/);
  assert.match(about, /02 \/ ABOUT/);
  assert.match(projects, /03 \/ PROLOGUE/);
  assert.match(contact, /04 \/ CONTACT/);
});

test('the finishing details include a Home edition plate, selection color, and project micro status', async () => {
  const heroChrome = await readFile(new URL('../src/components/HeroMicroChrome.tsx', import.meta.url), 'utf8');
  const globalCss = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');

  assert.match(heroChrome, /PORTFOLIO 2026/);
  assert.match(heroChrome, /HANGZHOU \/ UTC\+08/);
  assert.match(globalCss, /::selection\s*\{[^}]*background:\s*#8f1f2a/);
  assert.match(directory, /projects-transition__project-name-status/);
  assert.match(directory, /isSelected \? 'SELECTED' : 'PREVIEW'/);
  assert.match(directory, /data-project-id=\{project\.id\}/);
});

test('project hover selection persists until a different project is selected', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.doesNotMatch(directory, /onPointerLeave=\{\(\) => setHoveredId\(null\)\}/);
  assert.match(directory, /projects-selected-works-entry/);
  assert.match(directory, /setActiveId\('homepage'\)/);
  assert.match(directory, /setHoveredId\(null\)/);
  assert.match(directory, /setHoveredId\(project\.id\)/);
  assert.match(css, /projects-transition__project-name-main[^}]*white-space:\s*nowrap/);
});

test('the AI pit crew marquee loops by one measured group and slows on hover', async () => {
  const contact = await readFile(new URL('../src/contact/ContactSection.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/contact/contact.css', import.meta.url), 'utf8');

  assert.match(contact, /getBoundingClientRect\(\)\.width/);
  assert.match(contact, /--marquee-shift/);
  assert.match(contact, /new ResizeObserver\(syncMarqueeDistance\)/);
  assert.match(contact, /CONTACT_MARQUEE_HOVER_RATE = 0\.28/);
  assert.match(contact, /onMouseEnter=\{\(\) => setMarqueePlaybackRate\(CONTACT_MARQUEE_HOVER_RATE\)\}/);
  assert.match(contact, /onMouseLeave=\{\(\) => setMarqueePlaybackRate\(1\)\}/);
  assert.match(contact, /updatePlaybackRate\(playbackRate\)/);
  assert.match(css, /animation:\s*contact-marquee[^;]*infinite/);
  assert.match(css, /translate3d\(var\(--marquee-shift\), 0, 0\)/);
  assert.doesNotMatch(css, /contact-marquee:hover[\s\S]*?animation-play-state:\s*paused/);
});
