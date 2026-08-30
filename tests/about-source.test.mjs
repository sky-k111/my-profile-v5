import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('App owns one main landmark and renders Hero before About', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const hero = await readFile(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  const about = await readFile(new URL('../src/about/AboutSection.tsx', import.meta.url), 'utf8');

  assert.match(app, /<main[^>]*>[\s\S]*<Hero[^>]*\/>[\s\S]*<AboutSection\s*\/>[\s\S]*<\/main>/);
  assert.doesNotMatch(hero, /<main className="hero"/);
  assert.match(about, /<section[^>]*id="about"[^>]*aria-labelledby="about-title"/);
  assert.match(about, /data-chapter="identity"/);
  assert.match(about, /data-chapter="curiosity"/);
  assert.doesNotMatch(about, /data-chapter="resonance"/);
  assert.match(about, /data-chapter="growth"/);
  assert.match(about, /data-chapter="momentum"/);
  assert.match(about, /import \{ createPortal \} from 'react-dom'/);
  assert.match(about, /createPortal\([\s\S]*className="about-cursor"[\s\S]*document\.body/);
});

test('About CSS declares the approved surfaces and motion accessibility hook', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const section = await readFile(new URL('../src/about/AboutSection.tsx', import.meta.url), 'utf8');

  assert.match(section, /import '\.\/about\.css';/);
  assert.match(css, /--about-paper:\s*#f2ede3/);
  assert.match(css, /--about-ink:\s*#211e1c/);
  assert.match(css, /--about-wine:\s*#741f29/);
  assert.match(css, /grid-template-columns:\s*repeat\(12,/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.about::before\s*\{[\s\S]*?top:\s*-32px;[\s\S]*?height:\s*32px;[\s\S]*?background:\s*linear-gradient/);
});

test('About defaults to readable chapter flow and opts into overlays only when motion is ready', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.match(css, /\.about-stage\s*\{[^}]*position:\s*relative/);
  assert.match(css, /\.about-chapter\s*\{[^}]*position:\s*relative;[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(12,/);
  assert.match(css, /\.about\[data-motion='ready'\]\s+\.about-stage\s*\{[^}]*position:\s*sticky/);
  assert.doesNotMatch(css, /\.about\s*\{[^}]*font-variation-settings:/);
});

test('About opens with the numbered portfolio chapter label', async () => {
  const copy = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');

  assert.match(copy, /02 \/ ABOUT/);
});

test('About font stylesheets load as public links instead of Vite CSS imports', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(css, /@import[^;]*fonts\/about/);
  assert.match(html, /<link rel="stylesheet" href="\/fonts\/about\/cormorant-garamond\/index\.css" \/>/);
  assert.match(html, /<link rel="stylesheet" href="\/fonts\/about\/noto-sans-sc\/index\.css" \/>/);
});

test('About motion uses one GSAP scroll driver without a pointer-driven photo tween loop', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.equal(motion.match(/ScrollTrigger\.create\(/g)?.length, 1);
  assert.doesNotMatch(motion, /requestAnimationFrame/);
  assert.doesNotMatch(motion, /window\.addEventListener\('pointermove'/);
  assert.doesNotMatch(motion, /gsap\.quickTo/);
  assert.doesNotMatch(motion, /setState|setPointer|setProgress/);
});

test('Curiosity chapter combines kinetic English copy with one editorial photo stage', async () => {
  const section = await readFile(new URL('../src/about/AboutSection.tsx', import.meta.url), 'utf8');
  const copy = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const sequence = await readFile(new URL('../src/about/CuriosityPhotoSequence.tsx', import.meta.url), 'utf8');

  assert.match(section, /about-photo-group about-photo-group--curiosity/);
  assert.match(section, /<CuriosityPhotoSequence photos=\{photos\}/);
  assert.match(copy, /data-type-char/);
  assert.match(copy, /biographyTypeEn/);
  assert.match(motion, /\[data-type-char\][\s\S]*stagger:/);
  assert.match(motion, /CURIOSITY_PHOTO_SEQUENCE\.forEach/);
  assert.doesNotMatch(motion, /rotation:/);
  assert.match(sequence, /data-curiosity-viewport/);
  assert.match(sequence, /data-curiosity-track/);
  assert.doesNotMatch(sequence, /renderLayer/);
});

test('About presents the four personal photos in one continuous layered editorial canvas', async () => {
  const section = await readFile(new URL('../src/about/AboutSection.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const sequence = await readFile(new URL('../src/about/CuriosityPhotoSequence.tsx', import.meta.url), 'utf8');

  assert.match(section, /<CuriosityPhotoSequence photos=\{photos\}\s*\/>/);
  assert.equal(section.match(/<CuriosityPhotoSequence/g)?.length, 1);
  assert.equal(sequence.match(/className="about-curiosity-canvas"/g)?.length, 1);
  assert.equal(sequence.match(/data-vertical-word/g)?.length, 2);
  assert.deepEqual(
    [...sequence.matchAll(/\{renderPhoto\((\d)\)\}/g)].map(match => Number(match[1])),
    [0, 1, 2, 3],
  );
  assert.match(css, /\.about-curiosity-track\s*\{[^}]*width:\s*max-content/);
  assert.match(css, /\.about-curiosity-canvas\s*\{[^}]*width:\s*250vw/);
  assert.match(css, /\.about-curiosity-vertical-word\s*\{[^}]*writing-mode:\s*vertical-rl/);
  assert.doesNotMatch(sequence, /about-curiosity-panel/);
  assert.doesNotMatch(css, /about-photo-sequence__layer/);
});

test('Curiosity layout layers unequal photos around one vertical editorial spine', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const sequence = await readFile(new URL('../src/about/CuriosityPhotoSequence.tsx', import.meta.url), 'utf8');

  assert.match(css, /\.about-curiosity-viewport \.about-curiosity-kinetic\s*\{[^}]*position:\s*absolute;[^}]*z-index:\s*5/);
  assert.match(css, /\.about\[data-motion='ready'\] \.about-curiosity-canvas \.about-copy--biography\s*\{[^}]*left:\s*207vw/);
  assert.match(css, /\.about-curiosity-shot--photo-04\s*\{[^}]*width:\s*74vw;[^}]*height:\s*min\(76vh, 760px\)/);
  assert.match(css, /\.about-curiosity-shot--photo-05\s*\{[^}]*width:\s*48vw;[^}]*height:\s*min\(68vh, 680px\)/);
  assert.match(css, /\.about-curiosity-vertical-word\s*\{[^}]*top:\s*-42%;[^}]*height:\s*184%;[^}]*background:\s*transparent/);
  assert.doesNotMatch(sequence, /about-curiosity-ink-slab/);
});

test('About removes the curiosity index and lets the identity chapter use the full viewport grid', async () => {
  const copy = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.doesNotMatch(copy, /02 \/ A PORTRAIT IN MOTION/);
  assert.match(css, /\.about-stage\s*\{[^}]*width:\s*100%;[^}]*margin-inline:\s*0/);
  assert.match(css, /\[data-chapter='identity'\] \.about-copy\s*\{\s*grid-column:\s*1 \/ -1;/);
});

test('About interlocks the opening title with its portrait and keeps kinetic copy inside the color frame', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const copy = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');

  assert.match(css, /\.about-photo--01\s*\{[\s\S]*?width:\s*clamp\(320px, 33vw, 530px\);[\s\S]*?left:\s*52%;[\s\S]*?top:\s*7%;/);
  assert.match(css, /\[data-chapter='curiosity'\] \.about-curiosity-kinetic\s*\{\s*grid-column:\s*2 \/ 11;/);
  assert.match(css, /\.about-curiosity-type\s*\{[\s\S]*?font-size:\s*clamp\(3\.5rem, 6\.6vw, 6\.5rem\)/);
  assert.match(motion, /\.set\(OPENING_PHOTOS, \{ autoAlpha: 1 \}, 0\)/);
  assert.match(motion, /\[data-photo="photo-01"\] \.about-photo__media'[\s\S]*?\{ yPercent: 28, clipPath: 'inset\(100% 0 0\)' \}[\s\S]*?clipPath: 'inset\(0% 0 0\)'[\s\S]*?duration: 0\.14/);
  assert.doesNotMatch(copy, /about-curiosity-caret/);
});

test('About identity keeps the portrait visible above the evolved horizontal stage', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.match(css, /\.about-copy--identity\s*\{[^}]*z-index:\s*6;/);
  assert.match(css, /\.about-photo--01\s*\{[^}]*z-index:\s*5;/);
});

test('About opening portrait restores the committed clipped upward reveal', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const openingPortraitTween = motion.match(
    /\.fromTo\(\s*'\[data-photo="photo-01"\] \.about-photo__media',([\s\S]*?)\n\s*\)\s*\n\s*\.to\('\[data-chapter="identity"\]/,
  )?.[1] ?? '';

  assert.match(openingPortraitTween, /yPercent:\s*28/);
  assert.match(openingPortraitTween, /clipPath:\s*'inset\(100% 0 0\)'/);
  assert.match(openingPortraitTween, /clipPath:\s*'inset\(0% 0 0\)'/);
});

test('About opening reveal starts at its clipped zero state at the first chapter and reverses on exit', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.match(motion, /trigger:\s*root,[\s\S]*?start:\s*'top top'/);
  assert.match(motion, /scrub:\s*0\.35/);
});

test('Curiosity curtains stay transparent until their own photo enters', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(
    motion,
    /gsap\.set\('\[data-sequence-photo\] \.about-curiosity-shot__reveal', \{ scaleX: 1 \}\)/,
  );
});

test('Curiosity rail keeps one restrained palette while choreographing collage drift and vertical type', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(motion, /backgroundColor: '#cf6542'/);
  assert.doesNotMatch(motion, /backgroundColor: '#17343a'/);
  assert.doesNotMatch(motion, /backgroundColor: '#741f29', duration: 0\.025/);
  assert.match(motion, /rise: \{ yPercent: 10, xPercent: 0, scaleX: 1\.12, scaleY: 0\.9 \}/);
  assert.match(motion, /\.fromTo\(\s*'\.about-copy--biography',\s*\{ yPercent: 18, autoAlpha: 0 \}/);
  assert.match(motion, /\.fromTo\(\s*'\.about-curiosity-bridge',\s*\{ yPercent: 24, autoAlpha: 0 \}/);
  assert.match(motion, /\.fromTo\(\s*'\.about-curiosity-closing-copy',\s*\{ yPercent: 16, autoAlpha: 0 \}/);
  assert.match(motion, /getVerticalRailMotion\('up'\)/);
  assert.match(motion, /getVerticalRailMotion\('down'\)/);
  assert.match(motion, /'\[data-vertical-word="moments"\]'/);
  assert.match(motion, /'\[data-vertical-word="motion"\]'/);
  assert.match(motion, /const drift = index % 2 === 0 \? -7 : 7/);
});

test('About opening keeps its original restrained Chinese signature and metadata', async () => {
  const copy = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.doesNotMatch(copy, /about-profile-mark|about-meta__item/);
  assert.equal(copy.match(/className="about-meta"/g)?.length, 2);
  assert.match(css, /\.about-name-zh\s*\{[^}]*font-size:\s*clamp\(1\.125rem, 1\.8vw, 1\.625rem\);[^}]*font-weight:\s*600/);
  assert.match(css, /\.about-meta\s*\{[^}]*font-size:\s*0\.75rem;[^}]*line-height:\s*1\.5/);
});

test('The growth photo starts only after the horizontal curiosity rail fades away', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.match(
    motion,
    /\.set\(\s*'\[data-photo="photo-08"\]',\s*\{ scale: 0\.55, clipPath: 'inset\(18%\)', autoAlpha: 1 \},\s*0\.62,\s*\)/,
  );
  assert.match(motion, /\.to\(CURIOSITY_SEQUENCE_SELECTOR, \{ autoAlpha: 0, duration: 0\.035 \}, 0\.605\)/);
});

test('Growth copy fits short desktop viewports and remains visible before momentum begins', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.match(css, /@media \(min-width: 768px\) and \(max-height: 820px\)[\s\S]*?\.about-display--growth\s*\{[^}]*max-width:\s*18ch;[^}]*font-size:\s*clamp\(2\.85rem, 5\.2vw, 4\.75rem\)/);
  assert.match(motion, /\.to\('\[data-chapter="growth"\] \.about-copy', \{ opacity: 0, duration: 0\.05 \}, 0\.74\)/);
  assert.match(motion, /\.to\('\[data-chapter="momentum"\] \.about-copy', \{ opacity: 1, duration: 0\.05 \}, 0\.76\)/);
});

test('Pinned About chapters reserve a clear zone below the fixed navigation', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.match(css, /--about-nav-clearance:\s*88px/);
  assert.match(css, /\.about\[data-motion='ready'\]\s+\.about-stage\s*\{[\s\S]*?padding:\s*var\(--about-nav-clearance\)/);
  assert.match(css, /\.about\[data-motion='ready'\] \[data-chapter='momentum'\] \.about-interests\s*\{[^}]*margin-top:\s*0/);
});

test('Interest copy keeps the original paired reading layout with a clear top-right start', async () => {
  const copy = await readFile(new URL('../src/about/AboutCopy.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.doesNotMatch(copy, /INTEREST_ANCHORS|about-interests__grid|about-interest__anchor/);
  assert.match(copy, /ABOUT_CONTENT\.interests\.map\(interest => \([\s\S]*?<h3 lang="en">\{interest\.title\}<\/h3>[\s\S]*?<p lang="zh-CN">\{interest\.copyZh\}<\/p>/);
  assert.match(css, /\.about-interests\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.about-interest\s*\{[^}]*grid-template-columns:\s*minmax\(8rem, 0\.72fr\) minmax\(0, 1\.28fr\);[^}]*min-height:\s*clamp\(9\.5rem, 18vh, 13rem\);[^}]*border-top/);
  assert.match(css, /\.about-interest h3\s*\{[^}]*font-size:\s*clamp\(0\.9rem, 1\.05vw, 1\.2rem\)/);
  assert.match(css, /\.about-interest p\s*\{[^}]*font-size:\s*clamp\(1\.1rem, 1\.35vw, 1\.55rem\)/);
  assert.match(css, /\.about\[data-motion='ready'\] \[data-chapter='momentum'\] \.about-interests\s*\{[^}]*margin-top:\s*0/);
});

test('About photos do not keep forced compositor layers across the scroll sequence', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(motion, /willChange:\s*'transform,opacity/);
});

test('About cursor uses one display-timed follower instead of spawning mousemove tweens', async () => {
  const cursor = await readFile(new URL('../src/about/useAboutCursor.ts', import.meta.url), 'utf8');

  assert.match(cursor, /gsap\.quickSetter\(cursor, 'x', 'px'\)/);
  assert.match(cursor, /const onMouseMove = \(event: MouseEvent\) => \{[\s\S]*pointerX = event\.clientX;[\s\S]*pointerY = event\.clientY;/);
  assert.match(cursor, /gsap\.ticker\.add\(renderCursor\)/);
  assert.match(cursor, /gsap\.ticker\.deltaRatio\(\)/);
  assert.match(cursor, /gsap\.ticker\.lagSmoothing\(0\)/);
  assert.match(cursor, /gsap\.ticker\.remove\(renderCursor\)/);
  assert.doesNotMatch(cursor, /gsap\.quickTo\(cursor, '[xy]'/);
});

test('About cursor recovers its first photo hover after scrolling under a stationary pointer', async () => {
  const cursor = await readFile(new URL('../src/about/useAboutCursor.ts', import.meta.url), 'utf8');

  assert.match(cursor, /const isInsideAbout = event\.target instanceof Node && root\.contains\(event\.target\);/);
  assert.match(cursor, /if \(!isInsideAbout\) \{[\s\S]*if \(isVisible\) onPointerLeave\(\);[\s\S]*return;/);
  assert.match(cursor, /if \(!isVisible\) \{[\s\S]*setPhotoHover\(isPhotoTarget\(event\.target\)\);[\s\S]*showCursor\(\);/);
  const pointerEnter = cursor.match(/const onPointerEnter = \(event: PointerEvent\) => \{([\s\S]*?)\n\s*\};/s)?.[1] ?? '';
  assert.doesNotMatch(pointerEnter, /setPhotoHover/);
});

test('About cursor delegates photo hover and keeps hit testing out of its tracking frame', async () => {
  const cursor = await readFile(new URL('../src/about/useAboutCursor.ts', import.meta.url), 'utf8');

  assert.match(cursor, /root\.addEventListener\('pointerover', onPointerOver, \{ passive: true \}\)/);
  assert.match(cursor, /root\.addEventListener\('pointerout', onPointerOut, \{ passive: true \}\)/);
  assert.doesNotMatch(cursor, /needsModeUpdate/);
  const renderPointer = cursor.match(/const renderPointer = \(\) => \{([\s\S]*?)\n\s*\};/s)?.[1] ?? '';
  assert.doesNotMatch(renderPointer, /elementsFromPoint|getBoundingClientRect|getComputedStyle/);
});

test('About cursor keeps the reference site global mouse input architecture', async () => {
  const cursor = await readFile(new URL('../src/about/useAboutCursor.ts', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.match(css, /\.about-cursor\s*\{[^}]*width:\s*12px;[^}]*height:\s*12px;[^}]*mix-blend-mode:\s*difference/);
  assert.match(css, /\.about-cursor__dot\s*\{[^}]*transform:\s*translate\(-50%,\s*-50%\)/);
  assert.match(cursor, /window\.addEventListener\('mousemove', onMouseMove, \{ passive: true \}\)/);
  assert.doesNotMatch(cursor, /root\.addEventListener\('pointermove'/);
});

test('About keeps the native pointer visible underneath the custom cursor', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.doesNotMatch(css, /cursor:\s*none/);
});

test('Animated About copy lets pointer hover reach the photos behind it', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.match(css, /\.about\[data-motion='ready'\]\s+\.about-copy\s*\{[^}]*pointer-events:\s*none/);
  assert.doesNotMatch(motion, /pointerEvents:\s*'auto'/);
});

test('About enables its overlay only after motion initializes and removes it in cleanup', async () => {
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.match(motion, /setAttribute\('data-motion', 'ready'\)/);
  assert.match(motion, /removeAttribute\('data-motion'\)/);
  assert.match(motion, /restoreStaticFallback\(root, stage, backdrop\)/);
  assert.doesNotMatch(motion, /data-chapter[^\n]*autoAlpha/);
});

test('About color transitions use a viewport-wide sticky backdrop', async () => {
  const section = await readFile(new URL('../src/about/AboutSection.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');

  assert.match(section, /className="about-backdrop" aria-hidden="true"/);
  assert.match(css, /\.about\[data-motion='ready'\]\s+\.about-backdrop\s*\{[^}]*position:\s*sticky;[^}]*width:\s*100%;[^}]*height:\s*100svh/);
  assert.match(motion, /\.to\(backdrop, \{ backgroundColor:/);
  assert.doesNotMatch(motion, /\.to\(stage, \{ backgroundColor:/);
});

test('About has tablet, mobile, and reduced-motion rules', async () => {
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1023px\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.about-photo-group\s*\{[\s\S]*display:\s*grid/);
});

test('PhotoFrame reserves space and recovers to the empty frame on failure', async () => {
  const frame = await readFile(new URL('../src/about/PhotoFrame.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');

  assert.match(frame, /onLoad=/);
  assert.match(frame, /onError=/);
  assert.match(frame, /about-photo--loaded/);
  assert.match(frame, /about-photo__empty/);
  assert.match(frame, /loading=\{photo\.id === 'photo-01' \? 'eager' : 'lazy'\}/);
  assert.match(frame, /resetPhotoState\(state, photo\.src\)/);
  assert.match(frame, /currentSrc\.current !== src/);
  assert.match(frame, /key=\{photo\.src\}/);
  assert.match(css, /\.about-photo__media\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;/);
});
