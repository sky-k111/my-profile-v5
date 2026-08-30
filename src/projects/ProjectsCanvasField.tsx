import { useEffect, useRef } from 'react';
import { resolveProjectsCanvasDispersal } from '../lib/projects-canvas-motion';

type BarColor = 'ink' | 'dark' | 'mid' | 'light' | 'blue';
type BarDepth = 'foreground' | 'middle' | 'distance';
type Bar = {
  seed: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: BarColor;
  style: 'solid' | 'lined';
  depth: BarDepth;
  opacity: number;
};

export const CONFIG = {
  barCount: 72,
} as const;

const COLORS: Record<BarColor, string> = {
  ink: '#202020',
  dark: '#343434',
  mid: '#5d5d5a',
  light: '#8f8d88',
  blue: '#005fae',
};

const BAR_GROUPS = [.025, .145, .255, .38, .49, .615, .735, .85, .97];
const GROUP_SIZE = 6;
const SLOT_OFFSETS = [-.018, .016, -.036, .034, -.006, .05];
const DEPTH_ORDER: Record<BarDepth, number> = { distance: 0, middle: 1, foreground: 2 };
const FLOW_SPEED = 24;
// Keep the color strata moving as one field, but give them a restrained
// parallax: ink is the visual anchor while the lighter/blue marks slip ahead.
const FLOW_RATE: Record<BarColor, number> = {
  ink: .72,
  dark: .82,
  mid: .94,
  light: 1.03,
  blue: 1.12,
};
const DEPTH_FLOW_RATE: Record<BarDepth, number> = {
  foreground: .84,
  middle: .96,
  distance: 1.08,
};
const FLOW_START = .999;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function seeded(seed: number) {
  const next = Math.sin(seed * 999.31) * 15331.78;
  return next - Math.floor(next);
}

function between(seed: number, min: number, max: number) {
  return min + seeded(seed) * (max - min);
}

function centerX(progress: number, width: number) {
  const stops: Array<[number, number]> = [[0, .55], [.18, .48], [.34, .63], [.5, .49], [.66, .62], [.82, .5], [1, .58]];
  const upper = stops.findIndex(([stop]) => progress <= stop);
  if (upper <= 0) return stops[0][1] * width;
  const [startY, startX] = stops[upper - 1];
  const [endY, endX] = stops[upper];
  const ratio = (progress - startY) / (endY - startY);
  return (startX + (endX - startX) * ratio) * width;
}

function makeBar(width: number, height: number, seed: number, y: number): Bar {
  const slot = seed % GROUP_SIZE;
  const depth: BarDepth = slot === 0 ? 'foreground' : slot < 3 ? 'middle' : 'distance';
  const minWidth = depth === 'foreground' ? width * .38 : depth === 'middle' ? width * .24 : width * .15;
  const maxWidth = depth === 'foreground' ? width * .68 : depth === 'middle' ? width * .54 : width * .39;
  const barHeight = depth === 'foreground' ? between(seed + 7, 46, 62) : depth === 'middle' ? between(seed + 7, 36, 50) : between(seed + 7, 30, 40);
  const nominalWidth = between(seed + 11, minWidth, maxWidth);
  const drift = depth === 'foreground' ? width * .22 : depth === 'middle' ? width * .28 : width * .36;
  const colorRoll = seeded(seed + 23);
  const color: BarColor = depth === 'foreground'
    ? (colorRoll < .8 ? 'ink' : 'dark')
    : depth === 'middle'
      ? (colorRoll < .45 ? 'dark' : colorRoll < .72 ? 'blue' : 'ink')
      : (colorRoll < .38 ? 'light' : colorRoll < .7 ? 'mid' : 'blue');
  const barWidth = nominalWidth * (color === 'ink' ? .78 : 1);
  const rawX = centerX(Math.min(1, Math.max(0, y / height)), width) + between(seed + 17, -drift, drift) - barWidth * .5;
  const rightInset = between(seed + 37, width * .025, width * .12);
  const x = Math.min(width - barWidth - rightInset, Math.max(width * .01, rawX));
  const style: Bar['style'] = depth === 'foreground' || seeded(seed + 29) > .52 ? 'solid' : 'lined';
  return {
    seed,
    x,
    y,
    width: barWidth,
    height: barHeight,
    color,
    style,
    depth,
    opacity: depth === 'foreground' ? 1 : depth === 'middle' ? .82 : .58,
  };
}

function assembledBar(bar: Bar, assemblyProgress: number): Bar | null {
  const startAt = seeded(bar.seed + 101) * .56;
  const reveal = clamp01((assemblyProgress - startAt) / .42);
  if (reveal <= 0) return null;

  const width = Math.max(10, bar.width * (.12 + reveal * .88));
  const x = bar.x + (bar.width - width) * seeded(bar.seed + 107);
  return { ...bar, x, width, opacity: bar.opacity * Math.min(1, reveal * 1.7) };
}

function drawLinedBand(context: CanvasRenderingContext2D, bar: Bar) {
  const lineStep = 4;
  context.save();
  context.strokeStyle = COLORS[bar.color];
  context.globalAlpha = bar.opacity * (bar.color === 'light' ? .75 : .92);
  context.lineWidth = 1.5;
  for (let y = bar.y + 1; y < bar.y + bar.height; y += lineStep) {
    context.beginPath();
    context.moveTo(bar.x, y);
    context.lineTo(bar.x + bar.width, y);
    context.stroke();
  }
  context.restore();
}

function makeBars(width: number, height: number, count: number): Bar[] {
  return Array.from({ length: count }, (_, index) => {
    const slot = index % GROUP_SIZE;
    const group = BAR_GROUPS[Math.floor(index / GROUP_SIZE) % BAR_GROUPS.length];
    const y = Math.max(0, Math.min(height - 1, (group + SLOT_OFFSETS[slot] + between(index + 1.7, -.008, .008)) * height));
    return makeBar(width, height, index, y);
  }).sort((a, b) => DEPTH_ORDER[a.depth] - DEPTH_ORDER[b.depth] || a.y - b.y);
}

function drawPaperNoise(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save();
  context.fillStyle = 'rgba(32, 32, 32, .1)';
  for (let index = 0; index < 860; index += 1) {
    const x = seeded(index * 3.1) * width;
    const y = seeded(index * 7.7) * height;
    const size = seeded(index * 13.3) > .9 ? 2 : 1;
    context.fillRect(Math.floor(x), Math.floor(y), size, 1);
  }
  context.restore();
}

export default function ProjectsCanvasField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let bars: Bar[] = [];
    let targetCount = 0;
    let nextSeed = 0;
    let animationFrame: number | null = null;
    let lastFrame = 0;
    let isVisible = false;
    let paperTexture: HTMLCanvasElement | null = null;
    let assemblyProgress = 0;
    let dispersalProgress = 0;
    if (!window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches) assemblyProgress = 1;

    const drawComposition = () => {
      context.clearRect(0, 0, width, height);
      if (paperTexture) context.drawImage(paperTexture, 0, 0, width, height);

      bars.forEach(bar => {
        const visibleBar = assembledBar(bar, assemblyProgress);
        if (!visibleBar) return;
        const dispersal = resolveProjectsCanvasDispersal(bar.seed, dispersalProgress, width, height);
        visibleBar.x += dispersal.offsetX;
        visibleBar.y += dispersal.offsetY;
        visibleBar.width *= dispersal.scaleX;
        visibleBar.opacity *= dispersal.opacity;
        if (visibleBar.opacity <= 0 || visibleBar.width <= 0) return;
        if (visibleBar.style === 'lined') drawLinedBand(context, visibleBar);
        else {
          context.save();
          context.globalAlpha = visibleBar.opacity;
          context.fillStyle = COLORS[visibleBar.color];
          context.fillRect(visibleBar.x, visibleBar.y, visibleBar.width, visibleBar.height);
          context.restore();
        }
      });
    };

    const replenishBars = () => {
      bars = bars.filter(bar => bar.y + bar.height > 0);
      while (bars.length < targetCount) {
        const seed = nextSeed;
        bars.push(makeBar(width, height, seed, height + between(seed + 31, -24, 64)));
        nextSeed += 1;
      }
      bars.sort((a, b) => DEPTH_ORDER[a.depth] - DEPTH_ORDER[b.depth] || a.y - b.y);
    };

    const stopFlow = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
      lastFrame = 0;
    };

    const drawFlow = (now: number) => {
      if (!isVisible || assemblyProgress < FLOW_START) return;
      const deltaSeconds = lastFrame ? Math.min((now - lastFrame) / 1000, .08) : 0;
      lastFrame = now;
      bars.forEach(bar => { bar.y -= FLOW_SPEED * FLOW_RATE[bar.color] * DEPTH_FLOW_RATE[bar.depth] * deltaSeconds; });
      replenishBars();
      drawComposition();
      animationFrame = requestAnimationFrame(drawFlow);
    };

    const startFlow = () => {
      if (assemblyProgress < FLOW_START || dispersalProgress > .001) return;
      if (animationFrame !== null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      animationFrame = requestAnimationFrame(drawFlow);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      targetCount = window.innerWidth < 768 ? 30 : window.innerWidth < 1200 ? 54 : CONFIG.barCount;
      bars = makeBars(width, height, targetCount);
      nextSeed = targetCount;
      paperTexture = document.createElement('canvas');
      paperTexture.width = Math.round(width * pixelRatio);
      paperTexture.height = Math.round(height * pixelRatio);
      const paperContext = paperTexture.getContext('2d');
      if (paperContext) {
        paperContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        drawPaperNoise(paperContext, width, height);
      }
      drawComposition();
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startFlow();
      else stopFlow();
    });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        assemblyProgress = 1;
        stopFlow();
        drawComposition();
      } else if (isVisible) startFlow();
    };
    const root = canvas.closest<HTMLElement>('.projects-transition');
    const handleAssembly = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      const wasFlowing = assemblyProgress >= FLOW_START;
      assemblyProgress = clamp01(typeof value === 'number' ? value : 0);
      if (wasFlowing && assemblyProgress < FLOW_START) {
        // Freeze the live field where it is, then let the shared assembly
        // progress shrink the same bars in place as the scroll retreats.
        stopFlow();
      } else if (assemblyProgress < FLOW_START) {
        stopFlow();
      }
      drawComposition();
      if (assemblyProgress >= FLOW_START && isVisible) startFlow();
    };
    const handleDispersal = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      dispersalProgress = clamp01(typeof value === 'number' ? value : 0);
      if (dispersalProgress > .001) stopFlow();
      drawComposition();
      if (dispersalProgress <= .001 && assemblyProgress >= FLOW_START && isVisible) startFlow();
    };

    resize();
    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    reducedMotion.addEventListener('change', handleMotionChange);
    root?.addEventListener('projects-canvas-assembly', handleAssembly);
    root?.addEventListener('projects-canvas-dispersal', handleDispersal);

    return () => {
      stopFlow();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotion.removeEventListener('change', handleMotionChange);
      root?.removeEventListener('projects-canvas-assembly', handleAssembly);
      root?.removeEventListener('projects-canvas-dispersal', handleDispersal);
    };
  }, []);

  return <canvas ref={canvasRef} className="projects-transition__canvas-field" aria-hidden="true" />;
}
