import { useEffect, useRef } from 'react';
import {
  getAutoStrokeBands,
  getAutoStrokePoint,
  getAutoStrokeStep,
  getBrushTextureMetrics,
  getNewStrokeStepIndices,
} from '@/lib/reveal-geometry';
import { getRevealOpacity } from '@/lib/reveal-timing';
import { PRESSURE_NAME } from '@/lib/name';

const BRUSH_RADIUS = 54;
const BRUSH_BLEED = 28;
const BRUSH_TEXTURE_DOTS = 16;
const BRUSH_STEP = 5;
const HOLD_MS = 1500;
const FADE_MS = 700;
const AUTO_STROKE_DELAY_MS = 2000;

interface Point {
  x: number;
  y: number;
}

interface InkStamp extends Point {
  createdAt: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
) {
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingQuality = 'high';
}

function paintBrushStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity = 1,
) {
  const brushRadius = radius + BRUSH_BLEED;
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, brushRadius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.45, 'rgba(255, 255, 255, .92)');
  gradient.addColorStop(0.78, 'rgba(255, 255, 255, .34)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < BRUSH_TEXTURE_DOTS; i++) {
    const wobble = Math.sin((x * 0.037 + y * 0.021 + i * 31) * 0.9);
    const angle = i * 2.399 + wobble;
    const distance = brushRadius * (0.25 + ((i * 0.17 + Math.abs(wobble)) % 0.62));
    const dotRadius = brushRadius * (0.025 + (i % 4) * 0.02);

    ctx.globalAlpha = opacity * (0.12 + (i % 4) * 0.04);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * distance,
      y + Math.sin(angle) * distance,
      dotRadius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

function createBrushTexture(dpr: number) {
  const { cssSize, pixelSize } = getBrushTextureMetrics(BRUSH_RADIUS, BRUSH_BLEED, dpr);
  const canvas = document.createElement('canvas');
  canvas.width = pixelSize;
  canvas.height = pixelSize;

  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintBrushStamp(ctx, cssSize / 2, cssSize / 2, BRUSH_RADIUS);

  return { canvas, cssSize };
}

function drawBrushTexture(
  ctx: CanvasRenderingContext2D,
  brushTexture: ReturnType<typeof createBrushTexture>,
  point: Point,
  opacity: number,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(
    brushTexture.canvas,
    point.x - brushTexture.cssSize / 2,
    point.y - brushTexture.cssSize / 2,
    brushTexture.cssSize,
    brushTexture.cssSize,
  );
  ctx.restore();
}

export default function PortraitReveal({ active = true }: { active?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const baseImgRef = useRef<HTMLImageElement>(null);
  const revealCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const stage = stageRef.current;
    const baseImg = baseImgRef.current;
    const revealCanvas = revealCanvasRef.current;
    if (!stage || !baseImg || !revealCanvas) return;

    const revealCtx = revealCanvas.getContext('2d', { willReadFrequently: true })!;

    let suitImg: HTMLImageElement;
    let maskCanvas: HTMLCanvasElement;
    let maskCtx: CanvasRenderingContext2D;
    let tempCanvas: HTMLCanvasElement;
    let tempCtx: CanvasRenderingContext2D;
    let brushTexture: ReturnType<typeof createBrushTexture>;
    let canvasW = 0;
    let canvasH = 0;
    let lastPointer: Point | null = null;
    let fadeFrame: number | null = null;
    let inkStamps: InkStamp[] = [];
    let autoBrushPoints: Point[] = [];
    let cancelled = false;

    function stagePoint(e: PointerEvent): Point {
      const rect = stage!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function setupCanvases() {
      const rect = baseImg!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasW = rect.width;
      canvasH = rect.height;
      brushTexture = createBrushTexture(dpr);

      resizeCanvas(revealCanvas!, revealCtx, canvasW, canvasH, dpr);

      maskCanvas = document.createElement('canvas');
      maskCtx = maskCanvas.getContext('2d')!;
      resizeCanvas(maskCanvas, maskCtx, canvasW, canvasH, dpr);

      tempCanvas = document.createElement('canvas');
      tempCtx = tempCanvas.getContext('2d')!;
      resizeCanvas(tempCanvas, tempCtx, canvasW, canvasH, dpr);

      lastPointer = null;
      clearReveal();
      renderReveal();
    }

    function renderReveal() {
      if (!suitImg || !tempCtx || !revealCtx) return;
      tempCtx.clearRect(0, 0, canvasW, canvasH);
      tempCtx.drawImage(suitImg, 0, 0, canvasW, canvasH);
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(maskCanvas!, 0, 0, canvasW, canvasH);
      tempCtx.globalCompositeOperation = 'source-over';

      revealCtx.clearRect(0, 0, canvasW, canvasH);
      revealCtx.drawImage(tempCanvas!, 0, 0, canvasW, canvasH);
    }

    function rebuildInkMask(now: number) {
      maskCtx!.clearRect(0, 0, canvasW, canvasH);
      inkStamps = inkStamps.filter((stamp) => {
        const elapsed = now - stamp.createdAt;
        if (elapsed >= HOLD_MS + FADE_MS) return false;
        drawBrushTexture(
          maskCtx!,
          brushTexture,
          stamp,
          getRevealOpacity(elapsed, HOLD_MS, FADE_MS),
        );
        return true;
      });
      for (const point of autoBrushPoints) {
        drawBrushTexture(maskCtx!, brushTexture, point, 1);
      }
    }

    function clearReveal() {
      if (!maskCtx || !revealCtx) return;
      if (fadeFrame) {
        cancelAnimationFrame(fadeFrame);
        fadeFrame = null;
      }
      maskCtx.clearRect(0, 0, canvasW, canvasH);
      revealCtx.clearRect(0, 0, canvasW, canvasH);
      revealCanvas!.style.opacity = '1';
      lastPointer = null;
      inkStamps = [];
      autoBrushPoints = [];
    }

    function animateInk() {
      const now = performance.now();
      rebuildInkMask(now);
      renderReveal();
      if (inkStamps.length) {
        fadeFrame = requestAnimationFrame(animateInk);
      } else {
        fadeFrame = null;
        revealCtx!.clearRect(0, 0, canvasW, canvasH);
      }
    }

    function startInkAnimation() {
      if (!fadeFrame) fadeFrame = requestAnimationFrame(animateInk);
    }

    function addBrushStroke(point: Point) {
      const createdAt = performance.now();
      if (!lastPointer) {
        inkStamps.push({ ...point, createdAt });
        lastPointer = point;
        return;
      }
      const dx = point.x - lastPointer.x;
      const dy = point.y - lastPointer.y;
      const distance = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(distance / BRUSH_STEP));
      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        inkStamps.push({
          x: lastPointer.x + dx * progress,
          y: lastPointer.y + dy * progress,
          createdAt,
        });
      }
      lastPointer = point;
    }

    function finishStroke() {
      lastPointer = null;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) clearReveal();
    }

    function onPointerMove(e: PointerEvent) {
      resetAutoStroke();
      addBrushStroke(stagePoint(e));
      startInkAnimation();
    }

    // ── Auto-idle stroke ──

    let autoStrokeTimer: ReturnType<typeof setTimeout>;
    let autoStrokeRaf: number | null = null;

    function resetAutoStroke() {
      clearTimeout(autoStrokeTimer);
      if (autoStrokeRaf) { cancelAnimationFrame(autoStrokeRaf); autoStrokeRaf = null; }
      autoBrushPoints = [];
      autoStrokeTimer = setTimeout(() => {
        if (inkStamps.length > 0) {
          autoStrokeTimer = setTimeout(() => resetAutoStroke(), 500);
          return;
        }
        runAutoStroke();
      }, AUTO_STROKE_DELAY_MS);
    }

    function runAutoStroke() {
      const bands = getAutoStrokeBands();
      const totalDuration = 1600;
      const startTime = performance.now();
      const startX = canvasW * 0.12;
      const endX = canvasW * 0.88;
      const stampStep = getAutoStrokeStep(BRUSH_RADIUS, BRUSH_BLEED, BRUSH_STEP);
      const totalSteps = Math.ceil((endX - startX) / stampStep);
      let lastStep = -1;

      function tick() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const now = performance.now();
        const nextStep = Math.min(totalSteps, Math.floor(eased * totalSteps));
        const newStepIndices = getNewStrokeStepIndices(lastStep, nextStep);

        autoBrushPoints = bands.map((band) => getAutoStrokePoint(
          eased,
          startX,
          endX,
          canvasH * band.yFrac,
          canvasH * band.amp,
        ));

        for (const band of bands) {
          const y = canvasH * band.yFrac;
          const amplitude = canvasH * band.amp;
          for (const i of newStepIndices) {
            const t = i / totalSteps;
            const x = startX + (endX - startX) * t;
            const waveY = y + Math.sin(t * Math.PI * 2.5) * amplitude;
            inkStamps.push({ x, y: waveY, createdAt: now });
          }
        }
        lastStep = nextStep;
        startInkAnimation();

        if (progress < 1) {
          autoStrokeRaf = requestAnimationFrame(tick);
        } else {
          autoStrokeRaf = null;
          autoBrushPoints = [];
          // Wait for ink to fade, then schedule next
          autoStrokeTimer = setTimeout(() => resetAutoStroke(), HOLD_MS + FADE_MS + 2000);
        }
      }

      autoStrokeRaf = requestAnimationFrame(tick);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupCanvases, 120);
    }

    async function init() {
      try {
        suitImg = await loadImage('/racing-suit.png');
      } catch {
        return; // image failed, nothing to reveal
      }
      if (cancelled) return;
      if (!baseImg!.complete) {
        await new Promise((resolve) => {
          baseImg!.addEventListener('load', resolve, { once: true });
          baseImg!.addEventListener('error', resolve, { once: true });
        });
        if (cancelled || !baseImg!.complete) return; // image errored or effect stopped
      }
      setupCanvases();
      resetAutoStroke();
    }

    init().catch(() => {});

    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerenter', resetAutoStroke);
    stage.addEventListener('pointerleave', finishStroke);
    stage.addEventListener('pointerup', finishStroke);
    stage.addEventListener('pointercancel', finishStroke);
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerenter', resetAutoStroke);
      stage.removeEventListener('pointerleave', finishStroke);
      stage.removeEventListener('pointerup', finishStroke);
      stage.removeEventListener('pointercancel', finishStroke);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      clearTimeout(autoStrokeTimer);
      if (autoStrokeRaf) { cancelAnimationFrame(autoStrokeRaf); autoStrokeRaf = null; }
      if (fadeFrame) cancelAnimationFrame(fadeFrame);
    };
  }, [active]);

  return (
    <section
      className="portrait-stage"
      aria-label={`${PRESSURE_NAME} portrait`}
      ref={stageRef}
    >
      <img
        ref={baseImgRef}
        className="portrait-base"
        src="/portrait.png"
        alt={PRESSURE_NAME}
      />
      <canvas
        ref={revealCanvasRef}
        className="reveal-canvas"
        aria-hidden="true"
      />
    </section>
  );
}
