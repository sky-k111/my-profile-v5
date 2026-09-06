import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('The projects transition overlays the About exit with a masked type assembly intro', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const aboutMotion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const transition = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(app, /<AboutSection\s*\/>[\s\S]*<ProjectsTransition\s*\/>/);
  assert.match(aboutMotion, /\[data-chapter="momentum"\] \.about-copy, \[data-chapter="momentum"\] \.about-photo-group/);
  assert.match(transition, /data-transition-letter/);
  assert.match(transition, /ProjectsCanvasField/);
  assert.match(transition, /Below is a selection of work and experiments/);
  assert.match(transition, /我把一些走过的路留在这里/);
  assert.match(transition, /经过反复的构思、屏幕前的深夜/);
  assert.match(transition, /projects-transition__statement-language--zh" lang="zh-CN"/);
  assert.match(transition, /projects-transition__statement-paragraph" data-transition-copy/);
  assert.match(transition, /03 \/ PROLOGUE/);
  assert.match(motion, /data-transition-title-copy/);
});

test('The projects statement uses a calm word-by-word reveal and a sourced downward archive arrow', async () => {
  const transition = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(transition, /data-transition-body-word/);
  assert.match(transition, /data-transition-body-copy/);
  assert.match(transition, /split\(' '\)/);
  assert.match(motion, /data-transition-body-word/);
  assert.match(motion, /yPercent: 112/);
  assert.match(transition, /projects-transition__archive-arrow/);
  assert.match(transition, /M12 5v14/);
  assert.match(transition, /m19 12-7 7-7-7/);
  assert.match(css, /\.projects-transition__footer \{ left: var\(--transition-copy-left\); right: auto;/);
  assert.match(css, /\.projects-transition__statement-word \{ display: inline-block; overflow: hidden;/);
  assert.match(css, /\.projects-transition__statement-word \{[^}]*margin-right: \.24em;/);
  assert.match(css, /@keyframes projects-archive-arrow/);
});

test('The projects transition keeps pointer work bounded to a crosshair and straight canvas trail', async () => {
  const transition = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const cursor = await readFile(new URL('../src/projects/useProjectsTransitionCursor.ts', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(cursor, /lineTo\(/);
  assert.match(cursor, /requestAnimationFrame/);
  assert.match(cursor, /addEventListener\('pointermove'/);
  assert.match(css, /\.projects-transition__crosshair/);
  assert.match(transition, /projects-transition__crosshair-line--x/);
  assert.match(transition, /projects-transition__crosshair-line--y/);
  assert.match(css, /\.projects-transition__crosshair-line--y/);
  assert.match(css, /\.projects-transition__noise/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('The projects intro assembles one complete masthead through narrow moving masks', async () => {
  const transition = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(transition, /const TITLE_TEXT = 'YIKAI CHEN \/ PROJECTS'/);
  assert.match(transition, /data-transition-title-slice/);
  assert.match(transition, /data-transition-title-copy/);
  assert.match(transition, /length: 32/);
  assert.match(motion, /data-transition-title-copy/);
  assert.match(transition, /--slice-offset/);
  assert.match(css, /container-type: inline-size/);
  assert.match(css, /left: calc\(-1 \* var\(--slice-offset\)\)/);
});

test('The projects intro uses paper grain and a Canvas-based glitch field', async () => {
  const transition = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const canvasField = await readFile(new URL('../src/projects/ProjectsCanvasField.tsx', import.meta.url), 'utf8');
  const snowField = await readFile(new URL('../src/projects/ProjectsSnowField.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.doesNotMatch(transition, /data-transition-manifesto/);
  assert.match(transition, /ProjectsSnowField/);
  assert.doesNotMatch(transition, /projects-transition__raster/);
  assert.match(canvasField, /const CONFIG =/);
  assert.match(canvasField, /barCount: 72/);
  assert.match(canvasField, /devicePixelRatio/);
  assert.match(canvasField, /drawComposition/);
  assert.match(canvasField, /centerX/);
  assert.match(canvasField, /style: 'solid' \| 'lined'/);
  assert.match(canvasField, /drawLinedBand/);
  assert.match(canvasField, /lineStep = 4/);
  assert.match(canvasField, /type BarDepth = 'foreground' \| 'middle' \| 'distance'/);
  assert.match(canvasField, /const BAR_GROUPS = \[\.025, \.145, \.255, \.38, \.49, \.615, \.735, \.85, \.97\]/);
  assert.match(canvasField, /const GROUP_SIZE = 6/);
  assert.match(canvasField, /const depth: BarDepth = slot === 0 \? 'foreground' : slot < 3 \? 'middle' : 'distance'/);
  assert.match(canvasField, /opacity: depth === 'foreground' \? 1 : depth === 'middle' \? \.82 : \.58/);
  assert.match(canvasField, /\[\[0, \.55\], \[\.18, \.48\], \[\.34, \.63\]/);
  assert.match(canvasField, /drawPaperNoise/);
  assert.match(snowField, /const FRAME_INTERVAL = 1000 \/ 12/);
  assert.doesNotMatch(snowField, /SNOW_FRAME_COUNT|snowFrameIndex/);
  assert.match(snowField, /const MAX_SAMPLE_PIXELS = 900_000/);
  assert.match(snowField, /const frame = createSnowFrame\(canvas.width, canvas.height\)/);
  assert.match(snowField, /context\.putImageData\(frame, 0, 0\)/);
  assert.equal(snowField.match(/createImageData\(/g)?.length, 1);
  assert.match(snowField, /const MIN_LARGE_GRAINS = 4/);
  assert.match(snowField, /Hard-edged pixel bursts/);
  assert.match(snowField, /imageSmoothingEnabled = false/);
  assert.match(snowField, /new IntersectionObserver/);
  assert.match(snowField, /prefers-reduced-motion: reduce/);
  assert.match(canvasField, /window\.innerWidth/);
  assert.match(css, /projects-transition__paper-grid/);
  assert.match(css, /projects-transition__canvas-field/);
  assert.match(css, /top: clamp\(0px, 2vw, 34px\)/);
  assert.match(css, /projects-transition__title \{ position: absolute; z-index: 7;/);
  assert.match(css, /\.projects-transition__canvas-field \{ position: absolute; z-index: 6; top: 0; left: 45vw; width: 50vw;/);
});

test('The canvas field drifts upward in one visibility-aware animation loop', async () => {
  const canvasField = await readFile(new URL('../src/projects/ProjectsCanvasField.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(canvasField, /scheduleGlitch/);
  assert.match(canvasField, /const FLOW_SPEED = 24/);
  assert.match(canvasField, /const FLOW_RATE: Record<BarColor, number> = \{/);
  assert.match(canvasField, /const DEPTH_FLOW_RATE: Record<BarDepth, number> = \{/);
  assert.match(canvasField, /foreground: \.84/);
  assert.match(canvasField, /distance: 1\.08/);
  assert.match(canvasField, /ink: \.72/);
  assert.match(canvasField, /blue: 1\.12/);
  assert.match(canvasField, /requestAnimationFrame\(drawFlow\)/);
  assert.match(canvasField, /cancelAnimationFrame\(animationFrame\)/);
  assert.match(canvasField, /new IntersectionObserver/);
  assert.match(canvasField, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(canvasField, /bar\.y -= FLOW_SPEED \* FLOW_RATE\[bar\.color\] \* DEPTH_FLOW_RATE\[bar\.depth\] \* deltaSeconds/);
  assert.match(canvasField, /bars = bars\.filter\(bar => bar\.y \+ bar\.height > 0\)/);
  assert.match(canvasField, /while \(bars\.length < targetCount\)/);
  assert.match(canvasField, /height \+ between\(seed \+ 31, -24, 64\)/);
  assert.doesNotMatch(canvasField, /addEventListener\('pointermove'/);
  assert.match(canvasField, /between\(seed \+ 7, 46, 62\)/);
  assert.match(canvasField, /between\(seed \+ 7, 30, 40\)/);
  assert.doesNotMatch(canvasField, /between\(seed \+ 3, 2, 5\)/);
  assert.match(canvasField, /const style: Bar\['style'\] = depth === 'foreground' \|\| seeded\(seed \+ 29\) > \.52 \? 'solid' : 'lined'/);
  assert.match(canvasField, /between\(seed \+ 17, -drift, drift\)/);
  assert.match(canvasField, /context\.lineTo\(bar\.x \+ bar\.width, y\)/);
  assert.match(canvasField, /width \* \.38/);
  assert.match(canvasField, /width \* \.15/);
  assert.match(canvasField, /dark: '#343434'/);
  assert.match(canvasField, /mid: '#5d5d5a'/);
  assert.match(canvasField, /light: '#8f8d88'/);
  assert.match(canvasField, /blue: '#005fae'/);
  assert.match(canvasField, /const barWidth = nominalWidth \* \(color === 'ink' \? \.78 : 1\)/);
  assert.match(canvasField, /const rightInset = between\(seed \+ 37, width \* \.025, width \* \.12\)/);
  assert.match(canvasField, /const drift = depth === 'foreground' \? width \* \.22 : depth === 'middle' \? width \* \.28 : width \* \.36/);
});

test('Projects keeps the canvas field empty until its title-led fragment assembly begins', async () => {
  const canvasField = await readFile(new URL('../src/projects/ProjectsCanvasField.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');

  assert.match(canvasField, /projects-canvas-assembly/);
  assert.match(canvasField, /assemblyProgress = 0/);
  assert.match(canvasField, /const FLOW_START = \.999/);
  assert.match(canvasField, /if \(!isVisible \|\| assemblyProgress < FLOW_START\) return/);
  assert.match(motion, /new CustomEvent\('projects-canvas-assembly'/);
  assert.match(motion, /transitionState/);
});

test('About keeps only a brief closing hold before the Projects handoff', async () => {
  const aboutMotion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const aboutCss = await readFile(new URL('../src/about/about.css', import.meta.url), 'utf8');
  const projectsCss = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(aboutCss, /min-height: 590svh/);
  assert.match(aboutMotion, /ABOUT_CLOSING_HOLD_DURATION/);
  assert.doesNotMatch(aboutMotion, /\.to\(\{\}, \{ duration: 0\.34 \}, 0\.89\)/);
  assert.match(projectsCss, /margin-top: 0/);
});

test('Projects crossfades the completed About stage before assembling its own intro', async () => {
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(motion, /document\.querySelector<HTMLElement>\('#about \.about-stage'\)/);
  assert.match(motion, /gsap\.set\(stage, \{ autoAlpha: 0 \}/);
  assert.match(motion, /\.to\(aboutStage, \{ autoAlpha: 0/);
  assert.match(motion, /\.to\(stage, \{ autoAlpha: 1/);
  assert.match(styles, /margin-top: -100svh/);
});

test('Leaving Projects restores the About stage before About navigation takes over', async () => {
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');

  assert.match(motion, /if \(id !== 'projects'\) \{[\s\S]*?timeline\.pause\(0\);[\s\S]*?gsap\.set\(aboutStage, \{ autoAlpha: 1 \}\)/);
  assert.match(motion, /if \(id !== 'projects'\) \{[\s\S]*?gsap\.set\(stage, \{ autoAlpha: 0 \}\)/);
  assert.match(
    motion,
    /if \(aboutStage\) gsap\.set\(aboutStage, \{ autoAlpha: 1 \}\);\s*trigger\?\.enable\(false, false\);\s*trigger\?\.update\(\);\s*return;/,
  );
});

test('Projects uses one scroll-driven state for a fully reversible About handoff and fragment assembly', async () => {
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(motion, /const transitionState = \{ progress: 0 \}/);
  assert.match(motion, /const syncTransitionState = \(\) => \{/);
  assert.match(motion, /new CustomEvent\('projects-canvas-assembly'/);
  assert.match(motion, /\.to\(transitionState, \{ progress: 1/);
  assert.doesNotMatch(motion, /introTimeline/);
  assert.doesNotMatch(motion, /window\.addEventListener\('scroll'/);
  assert.doesNotMatch(motion, /\.play\(/);
  assert.doesNotMatch(motion, /\.reverse\(/);
  assert.match(styles, /data-transition-motion\]:not\(\[data-transition-interactive\]\)/);
});

test('Projects follows the shortened About finale and reveals an aligned masthead through the shared state', async () => {
  const aboutMotion = await readFile(new URL('../src/about/useAboutMotion.ts', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');

  assert.match(aboutMotion, /duration: ABOUT_CLOSING_HOLD_DURATION/);
  assert.match(aboutMotion, /ABOUT_TIMELINE_END/);
  assert.match(motion, /const titleSlices = gsap\.utils\.toArray<HTMLElement>\('\[data-transition-title-slice\]'/);
  assert.match(motion, /gsap\.set\(titleCopies, \{ x: 0, y: 0, scaleX: 1/);
  assert.match(motion, /gsap\.set\(titleSlices, \{/);
  assert.match(motion, /autoAlpha: 0/);
  assert.match(motion, /\.to\(titleSlices, \{ x: 0, autoAlpha: 1/);
  assert.match(motion, /\.to\(transitionState, \{ progress: 1/);
});

test('Projects masthead begins as orderly offset strips and resolves through stable slices without a state swap', async () => {
  const component = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(motion, /const titleFragmentOffsets = \[-112, -38, 38, 112\]/);
  assert.match(motion, /x: index => titleFragmentOffsets\[index % titleFragmentOffsets\.length\]/);
  assert.match(motion, /stagger: \{ amount: 0\.18, from: 'center' \}/);
  assert.match(motion, /ease: 'sine\.inOut'/);
  assert.match(motion, /scrub: 0\.28/);
  assert.doesNotMatch(motion, /data-title-ready/);
  assert.doesNotMatch(motion, /introTimeline/);
  assert.doesNotMatch(component, /YYYYYCCCC \/ PPPJJJJJ/);
  assert.doesNotMatch(styles, /@keyframes projects-masthead/);
  assert.doesNotMatch(styles, /data-title-ready/);
});

test('The canvas retracts the live field in place whenever the scroll state retreats from flow', async () => {
  const canvasField = await readFile(new URL('../src/projects/ProjectsCanvasField.tsx', import.meta.url), 'utf8');

  assert.match(canvasField, /const wasFlowing = assemblyProgress >= FLOW_START/);
  assert.match(canvasField, /Freeze the live field where it is/);
  assert.match(canvasField, /progress shrink the same bars in place/);
  assert.doesNotMatch(canvasField, /When scroll retreats, restore the seeded snapshot/);
});

test('Projects reveals a scrolling media gallery and changes galleries on project-name hover', async () => {
  const component = await readFile(new URL('../src/projects/ProjectsTransition.tsx', import.meta.url), 'utf8');
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(component, /ProjectDirectory/);
  assert.match(directory, /useState/);
  assert.match(directory, /<ul[\s\S]*className="projects-transition__project-list"/);
  assert.match(directory, /<li key=\{project\.id\}>/);
  assert.match(directory, /onPointerEnter/);
  assert.match(directory, /onFocus/);
  assert.match(directory, /mediaSrcs/);
  assert.match(directory, /homepage-01\.mp4/);
  assert.match(directory, /homepage-09\.mp4/);
  assert.match(directory, /<video/);
  assert.match(directory, /projects-transition__project-media-rail/);
  assert.match(directory, /projects-transition__project-media-item/);
  assert.match(motion, /const canvasDispersal = \{ progress: 0 \}/);
  assert.match(motion, /const projectDirectory/);
  assert.match(motion, /const projectMedia/);
  assert.match(motion, /yPercent: 116/);
  assert.match(motion, /projects-canvas-dispersal/);
  assert.doesNotMatch(motion, /\.to\(canvasField, \{ autoAlpha: 0/);
  assert.match(motion, /const projectMediaRoll = \{ progress: 0 \}/);
  assert.match(motion, /const projectMediaGallery = \{ progress: 0 \}/);
  assert.match(motion, /projects-media-gallery-progress/);
  assert.match(motion, /projectMediaGallery, \{ progress: 1/);
  assert.match(styles, /projects-transition__project-directory/);
  assert.match(styles, /projects-transition__project-list/);
  assert.match(styles, /data-project-emphasis='featured'/);
  assert.match(styles, /data-project-emphasis='muted'/);
  assert.match(styles, /projects-transition__project-media-rail/);
  assert.match(styles, /projects-transition__project-media-item/);
  assert.match(
    styles,
    /projects-transition__project-media \{ position: absolute;[^}]*overflow: visible;/s,
  );
});

test('Projects breaks apart the intro before staggered project names and media enter', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const canvasField = await readFile(new URL('../src/projects/ProjectsCanvasField.tsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(motion, /const projectNames = gsap\.utils\.toArray<HTMLElement>\('\[data-project-name\]'/);
  assert.match(directory, /<DecryptedHeading text="SELECTED WORKS" \/>/);
  assert.match(motion, /projects-selected-works-entry/);
  assert.match(motion, /const projectHeading = root\.querySelector<HTMLElement>\('\[data-project-directory-heading\]'/);
  assert.match(motion, /\.to\(projectHeading, \{/);
  assert.match(motion, /new CustomEvent\('projects-canvas-dispersal'/);
  assert.match(motion, /\.to\(titleSlices, \{[\s\S]*autoAlpha: 0[\s\S]*stagger:/);
  assert.match(motion, /\.to\(projectNames, \{[\s\S]*autoAlpha: 1[\s\S]*stagger:/);
  assert.match(canvasField, /projects-canvas-dispersal/);
  assert.match(styles, /projects-transition__project-media \{ position: absolute;[^}]*width: min\(41vw, 840px\);/s);
});

test('The project archive presents a split current-total counter that media pushes away', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(directory, /data-project-counter/);
  assert.match(directory, /project\.number/);
  assert.match(directory, /String\(PROJECTS\.length\)\.padStart\(2, '0'\)/);
  assert.match(motion, /const projectCounter = root\.querySelector<HTMLElement>\('\[data-project-counter\]'/);
  assert.match(motion, /\.to\(projectCounter, \{[\s\S]*yPercent: -120[\s\S]*autoAlpha: 0/);
  assert.match(styles, /projects-transition__project-counter/);
  assert.match(styles, /justify-content: space-between/);
});

test('ForgeSight is the fifth project and links to its real repository', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');

  assert.match(directory, /id: 'forge-sight'/);
  assert.match(directory, /number: '05'/);
  assert.match(directory, /title: 'ForgeSight'/);
  assert.match(directory, /href: 'https:\/\/github\.com\/sky-k111\/forge-sight'/);
  assert.match(directory, /LangGraph/);
  assert.match(directory, /Recharts/);
});

test('Project changes use the supplied marquee loader and commit after the fixed transition', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const loader = await readFile(new URL('../src/projects/ProjectMediaLoader.tsx', import.meta.url), 'utf8');

  assert.match(directory, /PROJECT_SWITCH_LOADING_MS/);
  assert.match(directory, /setTimeout\([\s\S]*PROJECT_SWITCH_LOADING_MS/);
  assert.match(loader, /project-loader-marquee/);
  assert.doesNotMatch(loader, /LineWobble/);
});

test('Pending project media preloads behind the loader and crossfades without remounting', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(directory, /const galleryProject = pendingProject \?\? activeProject/);
  assert.match(directory, /data-project-revealing/);
  assert.match(directory, /projects-transition__project-media-reveal-shell/);
  assert.match(directory, /preload=\{isRolled \? 'auto' : 'metadata'\}/);
  assert.match(styles, /@keyframes projects-media-switch-reveal/);
  assert.match(styles, /data-project-revealing.*projects-transition__project-loader/s);
});

test('The homepage gallery ships every edited clip in sequence', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const mediaSources = [
    '/projects/homepage-01.mp4',
    '/projects/homepage-02.mp4',
    '/projects/homepage-03.mp4',
    '/projects/homepage-04.mp4',
    '/projects/homepage-05.mp4',
    '/projects/homepage-06.mp4',
    '/projects/homepage-07.mp4',
    '/projects/homepage-08.mp4',
    '/projects/homepage-09.mp4',
  ];

  await Promise.all(
    mediaSources.map(mediaSrc =>
      assert.doesNotReject(access(new URL(`../public${mediaSrc}`, import.meta.url))),
    ),
  );

  for (const mediaSrc of mediaSources) {
    assert.match(directory, new RegExp(mediaSrc.replaceAll('.', '\\.')));
  }
});

test('The AI Name gallery ships every supplied recording in sequence', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const mediaSources = [
    '/projects/ai-name-01.mp4',
    '/projects/ai-name-02.mp4',
    '/projects/ai-name-03.mp4',
    '/projects/ai-name-04.mp4',
    '/projects/ai-name-05.mp4',
    '/projects/ai-name-06.mp4',
  ];

  await Promise.all(
    mediaSources.map(mediaSrc =>
      assert.doesNotReject(access(new URL(`../public${mediaSrc}`, import.meta.url))),
    ),
  );

  for (const mediaSrc of mediaSources) {
    assert.match(directory, new RegExp(mediaSrc.replaceAll('.', '\\.')));
  }
});

test('The GitHub Trending Digest gallery ships every supplied recording in sequence', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const mediaSources = [
    '/projects/trending-digest-01.mp4',
    '/projects/trending-digest-02.mp4',
    '/projects/trending-digest-03.mp4',
  ];

  await Promise.all(
    mediaSources.map(mediaSrc =>
      assert.doesNotReject(access(new URL(`../public${mediaSrc}`, import.meta.url))),
    ),
  );

  for (const mediaSrc of mediaSources) {
    assert.match(directory, new RegExp(mediaSrc.replaceAll('.', '\\.')));
  }
});

test('The EduCanvas gallery ships every supplied recording in sequence', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const mediaSources = [
    '/projects/educanvas-01.mp4',
    '/projects/educanvas-02.mp4',
    '/projects/educanvas-03.mp4',
    '/projects/educanvas-04.mp4',
    '/projects/educanvas-05.mp4',
    '/projects/educanvas-06.mp4',
    '/projects/educanvas-07.mp4',
    '/projects/educanvas-08.mp4',
  ];

  await Promise.all(
    mediaSources.map(mediaSrc =>
      assert.doesNotReject(access(new URL(`../public${mediaSrc}`, import.meta.url))),
    ),
  );

  for (const mediaSrc of mediaSources) {
    assert.match(directory, new RegExp(mediaSrc.replaceAll('.', '\\.')));
  }
});

test('The first two project media share one visibility-aware animated roll renderer', async () => {
  const directory = await readFile(new URL('../src/projects/ProjectDirectory.tsx', import.meta.url), 'utf8');
  const glitch = await readFile(new URL('../src/projects/ProjectMediaGlitch.tsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(directory, /ProjectMediaGlitch/);
  assert.match(directory, /itemIndex=\{index\}/);
  assert.match(directory, /usesProjectMediaRoll\(index\)/);
  assert.match(glitch, /const MAX_STRIP_COUNT = 280/);
  assert.match(glitch, /requestAnimationFrame\(drawHoverFrame\)/);
  assert.match(glitch, /requestAnimationFrame\(drawEntryFrame\)/);
  assert.match(glitch, /new IntersectionObserver/);
  assert.match(glitch, /context\.drawImage\(/);
  assert.match(glitch, /prefers-reduced-motion: reduce/);
  assert.match(glitch, /cancelAnimationFrame/);
  assert.doesNotMatch(glitch, /\{ root: media,/);
  assert.match(styles, /projects-transition__project-preview-glitch/);
});

test('The project curl paints only on a visible viewport frame or a new progress value', async () => {
  const glitch = await readFile(new URL('../src/projects/ProjectMediaGlitch.tsx', import.meta.url), 'utf8');
  const entryFrame = glitch.match(/const drawEntryFrame = \(now: number\) => \{([\s\S]*?)\n    \};/)?.[1] ?? '';

  assert.doesNotMatch(entryFrame, /requestAnimationFrame\(drawEntryFrame\)/);
  assert.match(glitch, /new IntersectionObserver\(\(\[entry\]\) => \{/);
  assert.match(glitch, /\{ rootMargin: '10% 0px', threshold: \.01 \}/);
});

test('Media rises as a full-height curled plane whose scanline warp follows scroll progress', async () => {
  const motion = await readFile(new URL('../src/projects/useProjectsTransitionMotion.ts', import.meta.url), 'utf8');
  const glitch = await readFile(new URL('../src/projects/ProjectMediaGlitch.tsx', import.meta.url), 'utf8');

  assert.match(motion, /const projectMediaRoll = \{ progress: 0 \}/);
  assert.match(motion, /projects-media-roll-progress/);
  assert.match(motion, /yPercent: 116/);
  assert.match(motion, /scale: 1\.24/);
  assert.match(motion, /scale: 1,/);
  assert.doesNotMatch(motion, /scaleY: \.025/);
  assert.doesNotMatch(motion, /rotateX: -78/);
  assert.match(glitch, /const entryCurl = entry \? resolveProjectMediaCurl\(progress\) : 0/);
  assert.match(glitch, /const rolledTopWidth = width \* \(1 - entryCurl \* \.34\)/);
  assert.match(glitch, /const leftTopInset = width \* entryCurl \* \.012/);
  assert.match(glitch, /const bendProgress = Math\.max\(0, Math\.min\(1, \(row - \.18\) \/ \.82\)\)/);
  assert.match(glitch, /const bend = bendProgress \* bendProgress \* \(3 - 2 \* bendProgress\)/);
  assert.match(glitch, /const baseDestinationWidth = width \* \(1 - entryCurl \* \.34 \* \(1 - bend\)\)/);
  assert.match(glitch, /const baseDestinationX = leftTopInset \* \(1 - bend\)/);
  assert.match(glitch, /leftTopInset \+ rolledTopWidth,\s*height \* \.32/);
  assert.match(glitch, /width - width \* entryCurl \* \.12/);
  assert.match(glitch, /const stripCompression = cylinderDepth \* \(1 - row\) \* width \* \.04/);
  assert.match(glitch, /projects-media-roll-progress/);
  assert.match(glitch, /data-project-preview-distorting/);
});

test('Media preserves a zero-valued scroll position so its curled entrance is visible from the first frame', async () => {
  const glitch = await readFile(new URL('../src/projects/ProjectMediaGlitch.tsx', import.meta.url), 'utf8');

  assert.match(glitch, /const storedRoll = media\?\.style\.getPropertyValue\('--project-media-roll'\)/);
  assert.match(glitch, /storedRoll === '' \? 1 : Number\(storedRoll\)/);
  assert.doesNotMatch(glitch, /Number\(media\?\.style\.getPropertyValue\('--project-media-roll'\)\) \|\| 1/);
});

test('The live source stays hidden until the curled canvas becomes completely flat', async () => {
  const styles = await readFile(new URL('../src/projects/projects-transition.css', import.meta.url), 'utf8');

  assert.match(styles, /\[data-project-preview-distorting\] \.projects-transition__project-preview-surface \{ visibility: hidden; \}/);
});

test('The curled outline uses cylindrical compression while horizontal smear resolves continuously', async () => {
  const glitch = await readFile(new URL('../src/projects/ProjectMediaGlitch.tsx', import.meta.url), 'utf8');

  assert.match(glitch, /const cylinderDepth = settle \* settle/);
  assert.match(glitch, /const entryCurl = entry \? resolveProjectMediaCurl\(progress\) : 0/);
  assert.match(glitch, /const rolledTopWidth = width \* \(1 - entryCurl \* \.34\)/);
  assert.match(glitch, /resolveProjectMediaDistortion/);
  assert.match(glitch, /now \/ 1000/);
  assert.match(glitch, /resolveProjectMediaHorizontalSmear/);
  assert.doesNotMatch(glitch, /sourceContext\.filter = .*blur/);
  assert.match(glitch, /const bendProgress = Math\.max\(0, Math\.min\(1, \(row - \.18\) \/ \.82\)\)/);
  assert.match(glitch, /const bend = bendProgress \* bendProgress \* \(3 - 2 \* bendProgress\)/);
  assert.match(glitch, /const baseDestinationWidth = width \* \(1 - entryCurl \* \.34 \* \(1 - bend\)\)/);
  assert.match(glitch, /const baseDestinationX = leftTopInset \* \(1 - bend\)/);
  assert.match(glitch, /const stripCompression = cylinderDepth \* \(1 - row\) \* width \* \.04/);
  assert.match(glitch, /context\.createLinearGradient\(/);
  assert.match(glitch, /context\.bezierCurveTo\(/);
  assert.doesNotMatch(glitch, /Math\.sin\(y \* \.19/);
});
