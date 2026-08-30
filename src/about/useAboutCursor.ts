import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';

const CURSOR_MEDIA =
  '(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const CURSOR_EXPANDED_SIZE = 84;
const SCROLL_HOVER_DELAY = 90;

export function useAboutCursor(
  rootRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor) return;

    const media = gsap.matchMedia();
    media.add(CURSOR_MEDIA, () => {
      const label = cursor.querySelector<HTMLElement>('.about-cursor__label');
      let isOverPhoto = false;
      let isVisible = false;
      let scrollHoverTimer: ReturnType<typeof setTimeout> | undefined;
      let pointerX = window.innerWidth / 2;
      let pointerY = window.innerHeight / 2;
      let renderedX = pointerX;
      let renderedY = pointerY;
      const xSet = gsap.quickSetter(cursor, 'x', 'px');
      const ySet = gsap.quickSetter(cursor, 'y', 'px');

      gsap.ticker.lagSmoothing(0);
      gsap.set(cursor, { autoAlpha: 0, force3D: true });
      const hoverTimeline = gsap
        .timeline({ paused: true })
        .to(
          cursor,
          {
            width: CURSOR_EXPANDED_SIZE,
            height: CURSOR_EXPANDED_SIZE,
            duration: 0.25,
            ease: 'back.out(1.7)',
          },
          0,
        );
      if (label) {
        hoverTimeline.to(label, { opacity: 1, y: 0, duration: 0.35, ease: 'none' }, 0);
      }
      root.setAttribute('data-cursor', 'ready');

      const setPhotoHover = (nextIsOverPhoto: boolean) => {
        if (nextIsOverPhoto === isOverPhoto) return;
        isOverPhoto = nextIsOverPhoto;
        cursor.toggleAttribute('data-photo-hover', isOverPhoto);
        if (isOverPhoto) hoverTimeline.play();
        else hoverTimeline.reverse();
      };

      const isPhotoTarget = (target: EventTarget | null) =>
        target instanceof Element && Boolean(target.closest('[data-photo]'));

      const syncPhotoFromPoint = () => {
        scrollHoverTimer = undefined;
        if (!isVisible) return;
        const nextIsOverPhoto = document
          .elementsFromPoint(pointerX, pointerY)
          .some(element => Boolean(element.closest('[data-photo]')));
        setPhotoHover(nextIsOverPhoto);
      };

      const showCursor = () => {
        if (isVisible) return;
        isVisible = true;
        gsap.to(cursor, { autoAlpha: 1, duration: 0.16, overwrite: 'auto' });
      };

      const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') {
          onPointerLeave();
          return;
        }
        pointerX = event.clientX;
        pointerY = event.clientY;
        showCursor();
      };

      const onMouseMove = (event: MouseEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        const isInsideAbout = event.target instanceof Node && root.contains(event.target);
        if (!isInsideAbout) {
          if (isVisible) onPointerLeave();
          return;
        }
        // Scrolling can place the pointer inside the pinned About section
        // without dispatching a fresh pointerenter. Recover on the first real
        // mouse move, then return to the event-driven hover path.
        if (!isVisible) {
          setPhotoHover(isPhotoTarget(event.target));
          showCursor();
        }
      };

      // Keep the cursor on the same single GSAP ticker used by the reference
      // site. Rendering at display cadence smooths uneven OS mouse events
      // without adding a tween for every incoming event.
      const renderCursor = () => {
        const delta = 1 - Math.pow(0.8, gsap.ticker.deltaRatio());
        renderedX += (pointerX - renderedX) * delta;
        renderedY += (pointerY - renderedY) * delta;
        xSet(renderedX);
        ySet(renderedY);
      };

      const onPointerOver = (event: PointerEvent) => {
        if (event.pointerType === 'mouse') setPhotoHover(isPhotoTarget(event.target));
      };

      const onPointerOut = (event: PointerEvent) => {
        if (event.pointerType === 'mouse') setPhotoHover(isPhotoTarget(event.relatedTarget));
      };

      const onPointerLeave = () => {
        isVisible = false;
        setPhotoHover(false);
        cursor.removeAttribute('data-pressed');
        gsap.to(cursor, { autoAlpha: 0, duration: 0.12, overwrite: 'auto' });
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') {
          onPointerLeave();
          return;
        }
        cursor.setAttribute('data-pressed', '');
      };

      const onPointerUp = (event: PointerEvent) => {
        cursor.removeAttribute('data-pressed');
        if (event.pointerType !== 'mouse') onPointerLeave();
      };

      const onPointerCancel = () => onPointerLeave();
      const onScroll = () => {
        if (!isVisible) return;
        if (scrollHoverTimer) clearTimeout(scrollHoverTimer);
        scrollHoverTimer = setTimeout(syncPhotoFromPoint, SCROLL_HOVER_DELAY);
      };

      root.addEventListener('pointerenter', onPointerEnter, { passive: true });
      root.addEventListener('pointerover', onPointerOver, { passive: true });
      root.addEventListener('pointerout', onPointerOut, { passive: true });
      root.addEventListener('pointerleave', onPointerLeave, { passive: true });
      root.addEventListener('pointerdown', onPointerDown, { passive: true });
      root.addEventListener('pointerup', onPointerUp, { passive: true });
      root.addEventListener('pointercancel', onPointerCancel, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      gsap.ticker.add(renderCursor);

      return () => {
        root.removeEventListener('pointerenter', onPointerEnter);
        root.removeEventListener('pointerover', onPointerOver);
        root.removeEventListener('pointerout', onPointerOut);
        root.removeEventListener('pointerleave', onPointerLeave);
        root.removeEventListener('pointerdown', onPointerDown);
        root.removeEventListener('pointerup', onPointerUp);
        root.removeEventListener('pointercancel', onPointerCancel);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('mousemove', onMouseMove);
        gsap.ticker.remove(renderCursor);
        if (scrollHoverTimer) clearTimeout(scrollHoverTimer);
        hoverTimeline.kill();
        root.removeAttribute('data-cursor');
        cursor.removeAttribute('data-photo-hover');
        cursor.removeAttribute('data-pressed');
        gsap.killTweensOf([cursor, label]);
        gsap.set(cursor, { clearProps: 'all' });
        if (label) gsap.set(label, { clearProps: 'all' });
      };
    });

    return () => media.revert();
  }, [cursorRef, rootRef]);
}
