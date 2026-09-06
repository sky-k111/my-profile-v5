import { useEffect, useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolveProjectsNavigationTimelineTime } from '../lib/navigation-motion';
import { resolveProjectMediaLeadRollDuration } from '../lib/project-media-motion';

gsap.registerPlugin(ScrollTrigger);

export function useProjectsTransitionMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = root.querySelector<HTMLElement>('.projects-transition__stage');
      if (!stage) return;
      const aboutStage = document.querySelector<HTMLElement>('#about .about-stage');

      root.setAttribute('data-transition-motion', '');

      const context = gsap.context(() => {
        const titleCopies = gsap.utils.toArray<HTMLElement>('[data-transition-title-copy]');
        const titleSlices = gsap.utils.toArray<HTMLElement>('[data-transition-title-slice]');
        const bodyWords = gsap.utils.toArray<HTMLElement>('[data-transition-body-word]');
        const next = root.querySelector<HTMLElement>('.projects-transition__next');
        const copy = gsap.utils.toArray<HTMLElement>('[data-transition-copy]');
        const projectDirectory = root.querySelector<HTMLElement>('[data-project-directory]');
        const projectHeading = root.querySelector<HTMLElement>('[data-project-directory-heading]');
        const projectNames = gsap.utils.toArray<HTMLElement>('[data-project-name]');
        const projectDetails = root.querySelector<HTMLElement>('[data-project-details]');
        const projectMedia = root.querySelector<HTMLElement>('[data-project-media]');
        const projectCounter = root.querySelector<HTMLElement>('[data-project-counter]');
        const titleFragmentOffsets = [-112, -38, 38, 112];
        const transitionState = { progress: 0 };
        const canvasDispersal = { progress: 0 };
        const projectMediaRoll = { progress: 0 };
        const projectMediaGallery = { progress: 0 };
        const projectMediaTravelStart = 1.56;
        const projectMediaTravelDuration = .92;
        const projectMediaRollDuration = resolveProjectMediaLeadRollDuration(projectMediaTravelDuration);
        const projectCounterExitTime = projectMediaTravelStart + projectMediaRollDuration * .45;
        const galleryStartTime = projectMediaTravelStart + projectMediaRollDuration * .55;
        let navigationTween: gsap.core.Tween | undefined;

        // Canvas assembly and dispersal are both driven by this one scrubbed
        // timeline, so reversing scroll restores the exact same composition.
        const syncTransitionState = () => {
          root.toggleAttribute('data-transition-interactive', transitionState.progress > .62);
          root.dispatchEvent(new CustomEvent('projects-canvas-assembly', { detail: transitionState.progress }));
        };
        const syncCanvasDispersal = () => {
          root.dispatchEvent(new CustomEvent('projects-canvas-dispersal', { detail: canvasDispersal.progress }));
        };
        const syncProjectMediaRoll = () => {
          projectMedia?.style.setProperty('--project-media-roll', String(projectMediaRoll.progress));
          window.dispatchEvent(new CustomEvent('projects-media-roll-progress', { detail: projectMediaRoll.progress }));
        };
        const syncProjectMediaGallery = () => {
          projectMedia?.style.setProperty('--project-media-gallery', String(projectMediaGallery.progress));
          window.dispatchEvent(new CustomEvent('projects-media-gallery-progress', { detail: projectMediaGallery.progress }));
        };

        gsap.set(stage, { autoAlpha: 0 });
        gsap.set(titleCopies, { x: 0, y: 0, scaleX: 1, willChange: 'transform' });
        gsap.set(titleSlices, {
          autoAlpha: 0,
          x: index => titleFragmentOffsets[index % titleFragmentOffsets.length],
          willChange: 'transform,opacity',
        });
        gsap.set(bodyWords, {
          autoAlpha: 0,
          yPercent: 112,
          willChange: 'transform,opacity',
        });
        gsap.set(next, { y: 10, autoAlpha: 0, willChange: 'transform,opacity' });
        gsap.set(copy, { y: 18, autoAlpha: 0, willChange: 'transform,opacity' });
        gsap.set(projectDirectory, { autoAlpha: 0, willChange: 'opacity' });
        gsap.set(projectHeading, {
          autoAlpha: 0,
          x: -22,
          y: 12,
          willChange: 'transform,opacity',
        });
        gsap.set(projectNames, {
          autoAlpha: 0,
          x: index => (index % 2 === 0 ? -1 : 1) * (54 + index * 14),
          y: index => (index % 3 - 1) * 24,
          scaleX: .72,
          transformOrigin: '0% 50%',
          willChange: 'transform,opacity',
        });
        gsap.set(projectDetails, {
          autoAlpha: 0,
          x: -28,
          y: 20,
          willChange: 'transform,opacity',
        });
        gsap.set(projectMedia, {
          autoAlpha: 1,
          yPercent: 116,
          scale: 1.24,
          transformOrigin: '50% 100%',
          willChange: 'transform',
        });
        gsap.set(projectCounter, {
          yPercent: 0,
          autoAlpha: 1,
          willChange: 'transform,opacity',
        });
        syncTransitionState();
        syncCanvasDispersal();
        syncProjectMediaRoll();
        syncProjectMediaGallery();

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.28,
            // The initial poses are set outside this timeline. Re-reading
            // tween starts during a mid-scroll refresh captures animated poses
            // and corrupts subsequent navigation replays. ScrollTrigger still
            // refreshes its start/end geometry without invalidating tweens.
            invalidateOnRefresh: false,
          },
        });
        const trigger = timeline.scrollTrigger;

        if (aboutStage) {
          timeline.to(aboutStage, { autoAlpha: 0, duration: 0.38, ease: 'power2.inOut' }, 0);
        }

        timeline
          .to(stage, { autoAlpha: 1, duration: 0.38, ease: 'power2.out' }, 0)
          .to('[data-transition-veil]', { autoAlpha: 1, duration: 0.18 }, 0.04)
          .to(titleSlices, { x: 0, autoAlpha: 1, duration: 0.5, stagger: { amount: 0.18, from: 'center' }, ease: 'sine.inOut' }, 0.15)
          .to(transitionState, { progress: 1, duration: 0.58, onUpdate: syncTransitionState }, 0.12)
          .to(copy, { y: 0, autoAlpha: 1, duration: 0.2, stagger: 0.04, ease: 'power2.out' }, 0.64)
          .to(bodyWords, { yPercent: 0, autoAlpha: 1, duration: 0.28, stagger: { amount: 0.22, from: 'start' }, ease: 'power3.out' }, 0.7)
          .to(next, { y: 0, autoAlpha: 1, duration: 0.16, ease: 'power2.out' }, 0.94)
          // Hold the assembled title, copy, and canvas field long enough to
          // read as one complete frame before the archive takes over.
          .addLabel('introDisperses', 1.18)
          .to(canvasDispersal, { progress: 1, duration: .42, onUpdate: syncCanvasDispersal }, 'introDisperses')
          .to(titleSlices, {
            x: index => (index % 2 === 0 ? -1 : 1) * (48 + (index % 6) * 15),
            y: index => (index % 3 - 1) * 34,
            scaleX: .18,
            autoAlpha: 0,
            duration: .34,
            stagger: { amount: .16, from: 'center' },
            ease: 'power2.in',
          }, 'introDisperses')
          .to(bodyWords, {
            x: index => (index % 2 === 0 ? -34 : 34),
            y: index => (index % 3 - 1) * 22,
            autoAlpha: 0,
            duration: .28,
            stagger: { amount: .16, from: 'center' },
            ease: 'power2.in',
          }, 'introDisperses+=.02')
          .to(copy, { x: index => (index % 2 === 0 ? -54 : 54), y: 20, autoAlpha: 0, duration: .28, stagger: .04, ease: 'power2.in' }, 'introDisperses+=.02')
          .to(next, { x: 42, y: 18, autoAlpha: 0, duration: .24, ease: 'power2.in' }, 'introDisperses+=.02')
          .to(projectDirectory, { autoAlpha: 1, duration: .01 }, 1.42)
          .call(() => window.dispatchEvent(new Event('projects-selected-works-entry')), [], 1.41)
          .to(projectHeading, {
            x: 0,
            y: 0,
            autoAlpha: 1,
            duration: .34,
            ease: 'power3.out',
          }, 1.41)
          .to(projectNames, {
            x: 0,
            y: 0,
            scaleX: 1,
            autoAlpha: 1,
            duration: .38,
            stagger: { amount: .22, from: 'center' },
            ease: 'power3.out',
          }, 1.44)
          .to(projectDetails, {
            x: 0,
            y: 0,
            autoAlpha: 1,
            duration: .36,
            ease: 'power3.out',
          }, 1.53)
          .to(projectMedia, {
            yPercent: 0,
            scale: 1,
            duration: projectMediaTravelDuration,
          }, projectMediaTravelStart)
          .to(projectMediaRoll, { progress: 1, duration: projectMediaRollDuration, onUpdate: syncProjectMediaRoll }, projectMediaTravelStart)
          .to(projectCounter, {
            yPercent: -120,
            autoAlpha: 0,
            duration: .26,
            ease: 'power2.in',
          }, projectCounterExitTime)
          .addLabel('galleryStart', galleryStartTime)
          .to(projectMediaGallery, { progress: 1, duration: 1.8, onUpdate: syncProjectMediaGallery }, galleryStartTime);

        const replayProjectsEntry = (event: Event) => {
          const { id } = (event as CustomEvent<{ id?: string }>).detail ?? {};

          if (id !== 'projects') {
            navigationTween?.kill();
            root.removeAttribute('data-transition-nav-entering');
            // A Project visit leaves the shared scrub timeline at progress 1,
            // which includes `aboutStage: autoAlpha(0)`. Restore the base
            // state *before* About (or Home) takes over its own timeline.
            // The trigger must remain available afterward: users can return
            // to Projects with the wheel, not only through the navigation.
            timeline.pause(0);
            transitionState.progress = 0;
            canvasDispersal.progress = 0;
            projectMediaRoll.progress = 0;
            projectMediaGallery.progress = 0;
            syncTransitionState();
            syncCanvasDispersal();
            syncProjectMediaRoll();
            syncProjectMediaGallery();
            gsap.set(stage, { autoAlpha: 0 });
            if (aboutStage) gsap.set(aboutStage, { autoAlpha: 1 });
            trigger?.enable(false, false);
            trigger?.update();
            return;
          }

          navigationTween?.kill();
          root.setAttribute('data-transition-nav-entering', '');
          transitionState.progress = 0;
          canvasDispersal.progress = 0;
          projectMediaRoll.progress = 0;
          projectMediaGallery.progress = 0;
          timeline.pause(0);
          trigger?.disable(false, true);
          syncTransitionState();
          syncCanvasDispersal();
          syncProjectMediaRoll();
          syncProjectMediaGallery();

          navigationTween = gsap.to(timeline, {
            time: resolveProjectsNavigationTimelineTime(id),
            duration: 1.72,
            ease: 'power3.inOut',
            overwrite: true,
            onUpdate: syncTransitionState,
            onComplete: () => {
              const scrollRange = Math.max(0, root.offsetHeight - window.innerHeight);
              const finalScrollTop = root.offsetTop + scrollRange * timeline.progress();
              window.scrollTo({ top: finalScrollTop, behavior: 'auto' });
              root.removeAttribute('data-transition-nav-entering');
              trigger?.enable(false, false);
              trigger?.update();
              window.dispatchEvent(new CustomEvent('site-section-navigation-complete', { detail: { id: 'projects' } }));
            },
          });
        };

        window.addEventListener('site-section-navigation', replayProjectsEntry);

        return () => {
          window.removeEventListener('site-section-navigation', replayProjectsEntry);
          navigationTween?.kill();
          root.removeAttribute('data-transition-nav-entering');
        };
      }, root);

      return () => {
        root.removeAttribute('data-transition-motion');
        root.removeAttribute('data-transition-interactive');
        context.revert();
      };
    });

    return () => media.revert();
  }, [rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      root.toggleAttribute('data-transition-in-view', entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);
}
