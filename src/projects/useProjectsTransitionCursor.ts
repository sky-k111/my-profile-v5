import { useEffect, type RefObject } from 'react';

type Point = { x: number; y: number; time: number };

const TRAIL_LIFETIME = 420;
const MAX_POINTS = 28;

export function useProjectsTransitionCursor(
  rootRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  crosshairRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const crosshair = crosshairRef.current;
    if (!root || !canvas || !crosshair || !window.matchMedia('(pointer: fine)').matches) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    const points: Point[] = [];
    let frame = 0;
    let idleTimer = 0;
    let pointerX = -100;
    let pointerY = -100;
    let active = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = () => {
      frame = 0;
      const now = performance.now();
      while (points.length && now - points[0].time > TRAIL_LIFETIME) points.shift();
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (points.length > 1) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        for (let index = 1; index < points.length; index += 1) {
          const alpha = Math.max(0, 1 - (now - points[index].time) / TRAIL_LIFETIME);
          context.beginPath();
          context.moveTo(points[index - 1].x, points[index - 1].y);
          context.lineTo(points[index].x, points[index].y);
          context.strokeStyle = `rgba(8, 115, 197, ${alpha * .72})`;
          context.lineWidth = 1.25;
          context.stroke();
        }
      }
      crosshair.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      if (points.length) frame = window.requestAnimationFrame(render);
    };

    const queueRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const armIdle = () => {
      window.clearTimeout(idleTimer);
      root.removeAttribute('data-transition-idle');
      idleTimer = window.setTimeout(() => {
        if (active) root.setAttribute('data-transition-idle', 'true');
      }, 900);
    };

    const onPointerEnter = () => {
      active = true;
      root.setAttribute('data-transition-cursor', 'true');
      armIdle();
    };
    const onPointerLeave = () => {
      active = false;
      root.removeAttribute('data-transition-cursor');
      root.removeAttribute('data-transition-idle');
      window.clearTimeout(idleTimer);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      const previous = points[points.length - 1];
      if (!previous || Math.hypot(previous.x - pointerX, previous.y - pointerY) > 3) {
        points.push({ x: pointerX, y: pointerY, time: performance.now() });
        if (points.length > MAX_POINTS) points.shift();
      }
      armIdle();
      queueRender();
    };

    resize();
    root.addEventListener('pointerenter', onPointerEnter, { passive: true });
    root.addEventListener('pointerleave', onPointerLeave, { passive: true });
    root.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, crosshairRef, rootRef]);
}
