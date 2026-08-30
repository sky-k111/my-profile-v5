import { useEffect, useRef, type RefObject } from 'react';
import {
  resolveProjectMediaCurl,
  resolveProjectMediaDistortion,
  resolveProjectMediaHorizontalSmear,
  resolveProjectMediaRollFromViewportTop,
} from '../lib/project-media-motion';

type ProjectMediaGlitchProps = {
  itemIndex: number;
  number: string;
  title: string;
  label: string;
  videoRef: RefObject<HTMLVideoElement | null>;
};

const MAX_STRIP_COUNT = 280;
const HOVER_GLITCH_DURATION = 520;

function drawPlaceholder(context: CanvasRenderingContext2D, width: number, height: number, number: string, title: string, label: string) {
  context.fillStyle = '#18191a';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#0873c5';
  context.fillRect(width * .72, height * .12, width * .19, width * .19);
  context.fillStyle = '#f3f0e9';
  context.font = `800 ${Math.max(12, width * .022)}px "Noto Sans SC Variable", sans-serif`;
  context.fillText(number, width * .065, height * .68);
  context.font = `700 ${Math.max(24, width * .072)}px "Noto Sans SC Variable", sans-serif`;
  context.fillText(title, width * .065, height * .84);
  context.font = `800 ${Math.max(10, width * .017)}px "Noto Sans SC Variable", sans-serif`;
  context.fillText(label.toUpperCase(), width * .065, height * .93);
}

export default function ProjectMediaGlitch({ itemIndex, number, title, label, videoRef }: ProjectMediaGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const item = canvas.closest<HTMLElement>('[data-project-media-item]');
    const media = canvas.closest<HTMLElement>('[data-project-media]');
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let entryAnimationFrame = 0;
    let hoverAnimationFrame = 0;
    let hoverStartedAt = 0;
    let isIntersecting = false;
    let documentVisible = !document.hidden;
    const storedRoll = media?.style.getPropertyValue('--project-media-roll') ?? '';
    let rollProgress = itemIndex === 0
      ? (storedRoll === '' ? 1 : Number(storedRoll))
      : resolveProjectMediaRollFromViewportTop(item?.getBoundingClientRect().top ?? window.innerHeight, window.innerHeight);
    let queuedRollProgress = rollProgress;
    const source = document.createElement('canvas');
    const sourceContext = source.getContext('2d');

    const setDistorting = (canvasAlpha: number) => {
      const isDistorting = canvasAlpha > .001;
      item?.toggleAttribute('data-project-preview-distorting', isDistorting);
      canvas.style.opacity = String(canvasAlpha);
    };

    const paintSource = () => {
      if (!sourceContext) return;
      sourceContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      sourceContext.clearRect(0, 0, width, height);
      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
        const sourceRatio = video.videoWidth / video.videoHeight;
        const targetRatio = width / height;
        const drawWidth = sourceRatio > targetRatio ? height * sourceRatio : width;
        const drawHeight = sourceRatio > targetRatio ? height : width / sourceRatio;
        sourceContext.drawImage(video, (width - drawWidth) * .5, (height - drawHeight) * .5, drawWidth, drawHeight);
        return;
      }
      drawPlaceholder(sourceContext, width, height, number, title, label);
    };

    const drawWarp = (progress: number, now: number, entry: boolean) => {
      const settle = 1 - progress;
      const cylinderDepth = settle * settle;
      const { smear: smearStrength, canvasAlpha } = resolveProjectMediaDistortion(progress);
      const entryCurl = entry ? resolveProjectMediaCurl(progress) : 0;
      const leftTopInset = width * entryCurl * .012;
      const stripCount = Math.max(1, Math.min(MAX_STRIP_COUNT, Math.ceil(height)));
      const stripHeight = height / stripCount;
      const phase = now / 1000;
      paintSource();
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      context.filter = 'none';
      const hasCurl = entry && entryCurl > .01;

      if (hasCurl) {
        const rolledTopWidth = width * (1 - entryCurl * .34);
        context.save();
        context.beginPath();
        context.moveTo(leftTopInset, 0);
        context.lineTo(leftTopInset + rolledTopWidth, 0);
        context.bezierCurveTo(
          leftTopInset + rolledTopWidth,
          height * .32,
          width - width * entryCurl * .12,
          height * .72,
          width,
          height,
        );
        context.lineTo(0, height);
        context.bezierCurveTo(
          width * entryCurl * .004,
          height * .74,
          leftTopInset - width * entryCurl * .003,
          height * .26,
          leftTopInset,
          0,
        );
        context.closePath();
        context.clip();
      }

      for (let stripIndex = 0; stripIndex < stripCount; stripIndex += 1) {
        const y = stripIndex * stripHeight;
        const nextY = Math.min(height, (stripIndex + 1) * stripHeight);
        const row = y / height;
        const bendProgress = Math.max(0, Math.min(1, (row - .18) / .82));
        const bend = bendProgress * bendProgress * (3 - 2 * bendProgress);
        const sourceY = Math.floor(y * pixelRatio);
        const sourceHeight = Math.max(1, Math.ceil(nextY * pixelRatio) - sourceY);
        const stripCompression = cylinderDepth * (1 - row) * width * .04;
        const baseSourceX = Math.round(stripCompression * pixelRatio * .16);
        const baseDestinationWidth = width * (1 - entryCurl * .34 * (1 - bend));
        const baseDestinationX = leftTopInset * (1 - bend);
        const horizontalSmear = resolveProjectMediaHorizontalSmear(stripIndex, smearStrength, width, phase);
        const sourceInset = Math.min(source.width * .24, horizontalSmear.stretchX * pixelRatio * .42);
        const sourceX = baseSourceX + (horizontalSmear.offsetX < 0 ? sourceInset : 0);
        const sourceWidth = Math.max(pixelRatio, source.width - sourceX - (horizontalSmear.offsetX >= 0 ? sourceInset : 0));
        const destinationX = baseDestinationX - horizontalSmear.stretchX * .5 + horizontalSmear.offsetX * .25;
        const destinationWidth = baseDestinationWidth + horizontalSmear.stretchX;
        context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, y, destinationWidth, nextY - y + .75);
      }
      if (hasCurl) {
        context.filter = 'none';
        const edgeGradient = context.createLinearGradient(width * (1 - entryCurl * .58), 0, width, 0);
        edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeGradient.addColorStop(.62, `rgba(255, 255, 255, ${(.09 * entryCurl).toFixed(3)})`);
        edgeGradient.addColorStop(.86, `rgba(0, 0, 0, ${(.14 * entryCurl).toFixed(3)})`);
        edgeGradient.addColorStop(1, `rgba(0, 0, 0, ${(.32 * entryCurl).toFixed(3)})`);
        context.fillStyle = edgeGradient;
        context.fillRect(0, 0, width, height);
        context.restore();
      }
      context.filter = 'none';
      return canvasAlpha;
    };

    const drawEntryFrame = (now: number) => {
      entryAnimationFrame = 0;
      rollProgress = queuedRollProgress;
      const canvasAlpha = drawWarp(rollProgress, now, true);
      setDistorting(canvasAlpha);
    };

    const scheduleEntryFrame = () => {
      if (isIntersecting && documentVisible && !entryAnimationFrame) {
        entryAnimationFrame = requestAnimationFrame(drawEntryFrame);
      }
    };

    const queueRoll = (progress: number) => {
      queuedRollProgress = Math.min(1, Math.max(0, progress));
      scheduleEntryFrame();
    };

    const drawHoverFrame = (now: number) => {
      if (!hoverStartedAt) hoverStartedAt = now;
      const progress = Math.min(1, (now - hoverStartedAt) / HOVER_GLITCH_DURATION);
      const canvasAlpha = drawWarp(progress, now, false);
      setDistorting(canvasAlpha);
      if (progress < 1) hoverAnimationFrame = requestAnimationFrame(drawHoverFrame);
    };

    const startHoverDistortion = () => {
      if (rollProgress < .985) return;
      cancelAnimationFrame(entryAnimationFrame);
      cancelAnimationFrame(hoverAnimationFrame);
      entryAnimationFrame = 0;
      hoverStartedAt = 0;
      setDistorting(1);
      hoverAnimationFrame = requestAnimationFrame(drawHoverFrame);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      source.width = Math.round(width * pixelRatio);
      source.height = Math.round(height * pixelRatio);
      if (itemIndex > 0) {
        rollProgress = resolveProjectMediaRollFromViewportTop(
          item?.getBoundingClientRect().top ?? window.innerHeight,
          window.innerHeight,
        );
      }
      queueRoll(rollProgress);
    };

    const handleRoll = (event: Event) => {
      const progress = (event as CustomEvent<number>).detail;
      if (typeof progress === 'number') queueRoll(progress);
    };

    const refreshCurrentFrame = () => queueRoll(rollProgress);

    const handleVisibilityChange = () => {
      documentVisible = !document.hidden;
      if (documentVisible) scheduleEntryFrame();
      else {
        cancelAnimationFrame(entryAnimationFrame);
        entryAnimationFrame = 0;
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) scheduleEntryFrame();
      else {
        cancelAnimationFrame(entryAnimationFrame);
        entryAnimationFrame = 0;
      }
    }, { rootMargin: '10% 0px', threshold: .01 });
    resizeObserver.observe(canvas);
    if (item) intersectionObserver.observe(item);
    if (itemIndex === 0) window.addEventListener('projects-media-roll-progress', handleRoll);
    else item?.addEventListener('projects-media-item-roll-progress', handleRoll);
    videoRef.current?.addEventListener('loadeddata', refreshCurrentFrame);
    videoRef.current?.addEventListener('playing', refreshCurrentFrame);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resize();
    if (itemIndex === 0 && hasMounted.current) startHoverDistortion();
    else hasMounted.current = true;

    return () => {
      cancelAnimationFrame(entryAnimationFrame);
      cancelAnimationFrame(hoverAnimationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('projects-media-roll-progress', handleRoll);
      item?.removeEventListener('projects-media-item-roll-progress', handleRoll);
      videoRef.current?.removeEventListener('loadeddata', refreshCurrentFrame);
      videoRef.current?.removeEventListener('playing', refreshCurrentFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      item?.removeAttribute('data-project-preview-distorting');
    };
  }, [itemIndex, label, number, title, videoRef]);

  return <canvas ref={canvasRef} className="projects-transition__project-preview-glitch" aria-hidden="true" />;
}
