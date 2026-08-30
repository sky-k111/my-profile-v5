import { useEffect, useRef } from 'react';

const FRAME_INTERVAL = 1000 / 12;
const SAMPLE_SCALE = .58;
const SNOW_FRAME_COUNT = 3;
const MAX_SAMPLE_PIXELS = 900_000;
const MIN_LARGE_GRAINS = 4;
const LARGE_GRAIN_VARIATION = 9;

function nextRandom(seed: number) {
  return (seed * 1664525 + 1013904223) >>> 0;
}

export default function ProjectsSnowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let lastFrame = 0;
    let raf: number | null = null;
    let visible = false;
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let randomSeed = 814729;
    let snowFrames: HTMLCanvasElement[] = [];
    let snowFrameIndex = 0;

    const createSnowFrame = (sampleWidth: number, sampleHeight: number) => {
      const frame = document.createElement('canvas');
      frame.width = sampleWidth;
      frame.height = sampleHeight;
      const frameContext = frame.getContext('2d', { alpha: true });
      if (!frameContext) return frame;
      const image = frameContext.createImageData(sampleWidth, sampleHeight);

      for (let index = 0; index < image.data.length; index += 4) {
        randomSeed = nextRandom(randomSeed);
        const sample = randomSeed & 255;
        const intensity = (randomSeed >>> 8) & 255;
        const alpha = sample < 42 ? 78 + ((randomSeed >>> 16) & 68) : sample < 178 ? 12 + ((randomSeed >>> 16) & 38) : 0;
        image.data[index] = intensity;
        image.data[index + 1] = intensity;
        image.data[index + 2] = intensity;
        image.data[index + 3] = alpha;
      }

      // Hard-edged pixel bursts: many simultaneous, uneven CRT noise blocks.
      randomSeed = nextRandom(randomSeed);
      const largeGrainCount = MIN_LARGE_GRAINS + Math.floor((randomSeed & 255) / 256 * LARGE_GRAIN_VARIATION);

      for (let grainIndex = 0; grainIndex < largeGrainCount; grainIndex += 1) {
        randomSeed = nextRandom(randomSeed);
        const centerX = Math.floor((randomSeed & 0xffff) / 0x10000 * sampleWidth);
        randomSeed = nextRandom(randomSeed);
        const centerY = Math.floor((randomSeed & 0xffff) / 0x10000 * sampleHeight);
        randomSeed = nextRandom(randomSeed);
        const width = 4 + ((randomSeed >>> 8) & 27);
        randomSeed = nextRandom(randomSeed);
        const height = 3 + ((randomSeed >>> 12) & 21);
        randomSeed = nextRandom(randomSeed);
        const brightness = 68 + ((randomSeed >>> 16) & 187);

        for (let y = Math.max(0, centerY - height); y < Math.min(sampleHeight, centerY + height); y += 1) {
          for (let x = Math.max(0, centerX - width); x < Math.min(sampleWidth, centerX + width); x += 1) {
            randomSeed = nextRandom(randomSeed);
            if (((randomSeed >>> 7) & 7) === 0) continue;
            const index = (y * sampleWidth + x) * 4;
            image.data[index] = brightness;
            image.data[index + 1] = brightness;
            image.data[index + 2] = brightness;
            image.data[index + 3] = 112 + ((randomSeed >>> 16) & 105);
          }
        }
      }

      frameContext.putImageData(image, 0, 0);
      return frame;
    };

    const paintSnow = () => {
      const frame = snowFrames[snowFrameIndex];
      if (!frame) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frame, 0, 0);
      snowFrameIndex = (snowFrameIndex + 1) % snowFrames.length;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const requestedDensity = Math.min(window.devicePixelRatio || 1, 1.25) * SAMPLE_SCALE;
      const pixelBudgetDensity = Math.sqrt(MAX_SAMPLE_PIXELS / Math.max(1, rect.width * rect.height));
      const density = Math.min(requestedDensity, pixelBudgetDensity);
      canvas.width = Math.max(1, Math.round(rect.width * density));
      canvas.height = Math.max(1, Math.round(rect.height * density));
      context.imageSmoothingEnabled = false;
      snowFrames = Array.from(
        { length: SNOW_FRAME_COUNT },
        () => createSnowFrame(canvas.width, canvas.height),
      );
      snowFrameIndex = 0;
      paintSnow();
    };

    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      lastFrame = 0;
    };

    const draw = (now: number) => {
      if (!visible || reduced) return;
      if (now - lastFrame >= FRAME_INTERVAL) {
        lastFrame = now;
        paintSnow();
      }
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!visible || reduced || raf !== null) return;
      raf = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) stop();
      else start();
    };

    resize();
    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="projects-transition__paper-grain" aria-hidden="true" />;
}
