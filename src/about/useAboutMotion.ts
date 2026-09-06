import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ABOUT_CLOSING_HOLD_DURATION,
  ABOUT_TIMELINE_END,
  resolveAboutMotionMode,
} from '@/lib/about-motion';
import {
  CURIOSITY_PHOTO_SEQUENCE,
  CURIOSITY_RAIL_WINDOW,
  getCuriosityTrackOffset,
  getVerticalRailMotion,
} from './curiosity-sequence';

gsap.registerPlugin(ScrollTrigger);

const OPENING_PHOTOS = '[data-photo="photo-01"]';
const CURIOSITY_SEQUENCE_SELECTOR = CURIOSITY_PHOTO_SEQUENCE.map(
  step => `[data-photo="${step.photoId}"]`,
).join(', ');
const CURIOSITY_CAPTION_SELECTOR = CURIOSITY_PHOTO_SEQUENCE
  .map(step => `[data-sequence-caption="${step.photoId}"]`)
  .join(', ');
const EXPANSION_PHOTOS = '[data-photo="photo-08"]';
const CURIOSITY_TRACK_SELECTOR = '[data-curiosity-track]';

const CURIOSITY_REVEAL_FROM = {
  rise: { yPercent: 10, xPercent: 0, scaleX: 1.12, scaleY: 0.9 },
  band: { yPercent: 0, xPercent: -14, scaleX: 0.88, scaleY: 1.12 },
  wipe: { yPercent: 0, xPercent: 14, scaleX: 1.14, scaleY: 0.9 },
  aperture: { yPercent: -8, xPercent: 0, scaleX: 0.9, scaleY: 1.12 },
} as const;

const CURIOSITY_REVEAL_ORIGIN = {
  rise: 'left center',
  band: 'right center',
  wipe: 'left center',
  aperture: 'right center',
} as const;

function restoreStaticFallback(root: HTMLElement, stage: HTMLElement, backdrop: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(
      '[data-chapter] .about-copy, [data-photo], [data-photo] .about-photo__media, [data-type-char]',
    )
    .forEach(element => {
      ['opacity', 'visibility', 'transform', 'clip-path', 'will-change', 'pointer-events'].forEach(property => {
        element.style.removeProperty(property);
      });
    });
  root.querySelectorAll<HTMLElement>('[data-sequence-caption]').forEach(element => {
    ['opacity', 'visibility', 'transform'].forEach(property => element.style.removeProperty(property));
  });
  root.querySelectorAll<HTMLElement>('[data-sequence-photo] .about-curiosity-shot__reveal').forEach(element => {
    ['transform', 'transform-origin'].forEach(property => element.style.removeProperty(property));
  });
  root.querySelectorAll<HTMLElement>(CURIOSITY_TRACK_SELECTOR).forEach(element => {
    ['opacity', 'visibility', 'transform', 'will-change'].forEach(property => {
      element.style.removeProperty(property);
    });
  });
  root.querySelectorAll<HTMLElement>('[data-vertical-word]').forEach(element => {
    ['opacity', 'visibility', 'transform', 'will-change'].forEach(property => element.style.removeProperty(property));
  });
  stage.style.removeProperty('color');
  backdrop.style.removeProperty('background-color');
  backdrop.style.removeProperty('transform');
  backdrop.style.removeProperty('will-change');
}

export function useAboutMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.removeAttribute('data-motion');
    const media = gsap.matchMedia();

    media.add(
      {
        animate: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        full: '(min-width: 1024px) and (pointer: fine)',
      },
      context => {
        const mode = resolveAboutMotionMode(
          window.innerWidth,
          !context.conditions?.animate,
          Boolean(context.conditions?.full),
        );
        if (mode === 'static') return;

        const stage = root.querySelector<HTMLElement>('.about-stage');
        const backdrop = root.querySelector<HTMLElement>('.about-backdrop');
        const curiosityTrack = root.querySelector<HTMLElement>(CURIOSITY_TRACK_SELECTOR);
        const curiosityViewport = root.querySelector<HTMLElement>('[data-curiosity-viewport]');
        if (!stage || !backdrop || !curiosityTrack || !curiosityViewport) return;

        let timeline: gsap.core.Timeline | undefined;
        let trigger: ScrollTrigger | undefined;

        try {
          gsap.set('[data-chapter="identity"] .about-copy', { opacity: 1 });
          gsap.set(
            '[data-chapter="curiosity"] .about-copy, [data-chapter="growth"] .about-copy, [data-chapter="momentum"] .about-copy, [data-chapter="momentum"] .about-photo-group',
            { opacity: 0 },
          );
          gsap.set('[data-photo]', { autoAlpha: 0 });
          gsap.set('[data-type-char]', { autoAlpha: 0 });
          gsap.set('[data-sequence-caption]', { autoAlpha: 0 });
          gsap.set('[data-vertical-word]', { autoAlpha: 0, willChange: 'transform' });

          const upwardRail = getVerticalRailMotion('up');
          const downwardRail = getVerticalRailMotion('down');

          timeline = gsap.timeline({ defaults: { ease: 'none' } });
          timeline
            .set(backdrop, { scaleX: 1, scaleY: 1, willChange: 'transform,background-color' }, 0)
            .set(OPENING_PHOTOS, { autoAlpha: 1 }, 0)
            .fromTo(
              '[data-photo="photo-01"] .about-photo__media',
              { yPercent: 28, clipPath: 'inset(100% 0 0)' },
              { yPercent: 0, clipPath: 'inset(0% 0 0)', duration: 0.14 },
              0,
            )
            .to('[data-chapter="identity"] .about-copy', { opacity: 0, duration: 0.05 }, 0.16)
            .to(OPENING_PHOTOS, { autoAlpha: 0, duration: 0.04 }, 0.17)
            .set('.about-curiosity-kinetic', { autoAlpha: 1 }, 0.18)
            .set(CURIOSITY_TRACK_SELECTOR, { x: 0, autoAlpha: 1, willChange: 'transform' }, 0.18)
            .fromTo(
              '[data-type-char]',
              { yPercent: 18, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.016, stagger: 0.00045 },
              0.188,
            )
            .to('.about-curiosity-kinetic', { autoAlpha: 0, duration: 0.025 }, 0.315)
            .fromTo(
              '[data-vertical-word="moments"]',
              { yPercent: upwardRail.from, autoAlpha: 0 },
              { yPercent: upwardRail.to, autoAlpha: 1, duration: 0.34 },
              0.205,
            )
            .fromTo(
              '[data-vertical-word="motion"]',
              { yPercent: downwardRail.from, autoAlpha: 0 },
              { yPercent: downwardRail.to, autoAlpha: 1, duration: 0.3 },
              0.285,
            )
            .set('[data-vertical-word]', { clearProps: 'willChange' }, 0.615)
            .fromTo(
              '.about-curiosity-bridge',
              { yPercent: 24, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.04 },
              0.36,
            )
            .to('.about-curiosity-bridge', { autoAlpha: 0, duration: 0.025 }, 0.455)
            .fromTo(
              '.about-copy--biography',
              { yPercent: 18, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.04 },
              0.515,
            )
            .fromTo(
              '.about-curiosity-closing-copy',
              { yPercent: 16, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.04 },
              0.535,
            )
            .to(
              CURIOSITY_TRACK_SELECTOR,
              {
                x: () => getCuriosityTrackOffset(
                  curiosityTrack.scrollWidth,
                  curiosityViewport.clientWidth,
                ),
                duration: CURIOSITY_RAIL_WINDOW.end - CURIOSITY_RAIL_WINDOW.start,
                ease: 'none',
              },
              CURIOSITY_RAIL_WINDOW.start,
            );

          CURIOSITY_PHOTO_SEQUENCE.forEach((step, index) => {
            const frame = `[data-photo="${step.photoId}"]`;
            const mediaFrame = `${frame} .about-photo__media`;
            const caption = `[data-sequence-caption="${step.photoId}"]`;
            const reveal = `[data-sequence-photo="${step.photoId}"] .about-curiosity-shot__reveal`;
            const previous = CURIOSITY_PHOTO_SEQUENCE[index - 1];
            const drift = index % 2 === 0 ? -7 : 7;
            const revealDuration = step.photoId === 'photo-04' ? 0.045 : 0.075;
            const settleAt = step.revealAt + revealDuration;
            if (previous) {
              timeline!.to(
                `[data-sequence-caption="${previous.photoId}"]`,
                { autoAlpha: 0, duration: 0.014 },
                step.revealAt,
              );
            }
            timeline!
              .set(frame, { autoAlpha: 1 }, step.revealAt)
              .fromTo(
                reveal,
                { scaleX: 1, transformOrigin: CURIOSITY_REVEAL_ORIGIN[step.transition] },
                { scaleX: 0, duration: step.photoId === 'photo-04' ? 0.022 : 0.056 },
                step.revealAt,
              )
              .fromTo(
                caption,
                { y: 10, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.03 },
                step.revealAt,
              )
              .fromTo(
                mediaFrame,
                CURIOSITY_REVEAL_FROM[step.transition],
                {
                  xPercent: 0,
                  yPercent: 0,
                  scaleX: 1,
                  scaleY: 1,
                  duration: revealDuration,
                },
                step.revealAt,
              )
              .to(
                mediaFrame,
                {
                  xPercent: drift,
                  yPercent: index % 2 === 0 ? -2 : 2,
                  duration: Math.max(0.035, CURIOSITY_RAIL_WINDOW.end - settleAt),
                },
                settleAt,
              );
          });

          timeline
            .to('[data-chapter="curiosity"] .about-copy', { opacity: 0, duration: 0.035 }, 0.605)
            .to(CURIOSITY_TRACK_SELECTOR, { autoAlpha: 0, duration: 0.035 }, 0.605)
            .to(CURIOSITY_SEQUENCE_SELECTOR, { autoAlpha: 0, duration: 0.035 }, 0.605)
            .to(CURIOSITY_CAPTION_SELECTOR, { autoAlpha: 0, duration: 0.035 }, 0.605)
            .to(backdrop, { scaleX: 0.94, scaleY: 0.9, duration: 0.055 }, 0.58)
            .to(backdrop, { backgroundColor: '#211e1c', duration: 0.065 }, 0.59)
            .to(stage, { color: '#f2ede3', duration: 0.065 }, 0.59)
            .set(CURIOSITY_TRACK_SELECTOR, { clearProps: 'willChange' }, 0.615)
            .set(
              '[data-photo="photo-08"]',
              { scale: 0.55, clipPath: 'inset(18%)', autoAlpha: 1 },
              0.62,
            )
            .to('[data-chapter="growth"] .about-copy', { opacity: 1, duration: 0.05 }, 0.63)
            .to(
              '[data-photo="photo-08"]',
              { scale: 2.8, clipPath: 'inset(0%)', duration: 0.16 },
              0.63,
            )
            .to(backdrop, { scaleX: 1, scaleY: 1, duration: 0.07 }, 0.66)
            .to(backdrop, { backgroundColor: '#741f29', duration: 0.1 }, 0.69)
            .to('[data-chapter="growth"] .about-copy', { opacity: 0, duration: 0.05 }, 0.74)
            .to(EXPANSION_PHOTOS, { autoAlpha: 0, duration: 0.04 }, 0.75)
            .to('[data-chapter="momentum"] .about-copy', { opacity: 1, duration: 0.05 }, 0.76)
            .fromTo(
              '.about-interest__rule',
              { scaleX: 0 },
              { scaleX: 1, duration: 0.065, stagger: 0.012 },
              0.755,
            )
            .fromTo(
              '.about-interest__index, .about-interest__heading, .about-interest__copy, .about-interest__meta',
              { y: 10, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.055, stagger: 0.004 },
              0.765,
            )
            .fromTo('[data-photo="photo-09"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.77)
            .fromTo(
              '[data-photo="photo-09"] .about-photo__media',
              { yPercent: -10 },
              { yPercent: 10, duration: 0.16 },
              0.77,
            )
            .fromTo(
              '[data-photo="photo-10"]',
              { xPercent: -46, scale: 0.72, autoAlpha: 0 },
              { xPercent: 0, scale: 1, autoAlpha: 1, duration: 0.16 },
              0.79,
            )
            .to(backdrop, { scaleX: 0.94, scaleY: 0.9, duration: 0.07 }, 0.77)
            .to(backdrop, { backgroundColor: '#f2ede3', duration: 0.07 }, 0.84)
            .to(stage, { color: '#211e1c', duration: 0.07 }, 0.84)
            .to(backdrop, { scaleX: 1, scaleY: 1, duration: 0.05 }, 0.89)
            .to(
              {},
              { duration: ABOUT_CLOSING_HOLD_DURATION },
              ABOUT_TIMELINE_END - ABOUT_CLOSING_HOLD_DURATION,
            )
            .set(backdrop, { clearProps: 'willChange' }, ABOUT_TIMELINE_END);

          trigger = ScrollTrigger.create({
            trigger: root,
            // The portrait starts at its clipped zero state once About reaches
            // the top. The same scrubbed timeline owns both reveal directions.
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.35,
            animation: timeline,
            invalidateOnRefresh: true,
          });

          root.setAttribute('data-motion', 'ready');
          trigger.refresh();

        } catch (error) {
          trigger?.kill();
          timeline?.kill();
          restoreStaticFallback(root, stage, backdrop);
          root.removeAttribute('data-motion');
          if (import.meta.env.DEV) console.warn('About motion initialization failed.', error);
          return;
        }

        return () => {
          root.removeAttribute('data-motion');
          trigger?.kill();
          timeline?.kill();
        };
      },
      root,
    );

    return () => {
      root.removeAttribute('data-motion');
      media.revert();
    };
  }, [rootRef]);
}
