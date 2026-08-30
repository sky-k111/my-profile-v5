import { useCallback, useEffect, useRef, type AnimationEvent, type CSSProperties } from 'react';
import {
  OPENING_SEQUENCE_DURATION_MS,
  resolveNameTreatment,
  resolveOpeningFrame,
  resolveOpeningPlayback,
} from '@/lib/opening-sequence';
import './OpeningSequence.css';

type OpeningSequenceProps = {
  onComplete: () => void;
  onPrepareHeroEffects: () => void;
};

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

export default function OpeningSequence({ onComplete, onPrepareHeroEffects }: OpeningSequenceProps) {
  const completedRef = useRef(false);
  const heroEffectsPreparedRef = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const constructRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);
  const mediaFrameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement | null>(null);

  const finishOpening = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const playback = resolveOpeningPlayback(reducedMotion, window.location.hash);

    if (!playback.shouldPlay) {
      onPrepareHeroEffects();
      finishOpening();
      return undefined;
    }

    document.documentElement.dataset.portfolioOpening = 'active';
    const fallbackTimer = window.setTimeout(finishOpening, playback.durationMs + 300);
    const startedAt = performance.now();
    let animationFrame = 0;

    const renderFrame = (now: number) => {
      const elapsed = Math.min(now - startedAt, playback.durationMs);
      const frame = resolveOpeningFrame(elapsed);
      if (frame.prepareHeroEffects && !heroEffectsPreparedRef.current) {
        heroEffectsPreparedRef.current = true;
        onPrepareHeroEffects();
      }
      const compact = window.innerWidth <= 700;
      const startSide = compact ? 78 : 104;
      const finalWidth = Math.min(window.innerWidth * (compact ? 0.88 : 0.82), 1_320);
      const finalHeight = Math.min(window.innerHeight * (compact ? 0.7 : 0.72), 790);
      const constructWidth = mix(startSide, finalWidth, frame.spread);
      const constructHeight = mix(startSide, finalHeight, frame.spread);
      const mediaStart = compact ? 58 : 76;
      const frameGap = compact ? 24 : Math.min(64, finalWidth * 0.045);
      const mediaWidth = Math.min(
        mix(mediaStart, finalWidth - frameGap * 2, frame.mediaReveal),
        Math.max(mediaStart, constructWidth - frameGap * 2),
      );
      const mediaHeight = Math.min(
        mix(mediaStart, finalHeight - frameGap * 2, frame.mediaReveal),
        Math.max(mediaStart, constructHeight - frameGap * 2),
      );
      const armWidth = mix(startSide, compact ? 72 : Math.min(190, finalWidth * 0.18), frame.spread);
      const armHeight = mix(startSide, compact ? 72 : Math.min(140, finalHeight * 0.2), frame.spread);

      rootRef.current?.style.setProperty('--opening-handoff', `${frame.handoff}`);

      if (constructRef.current) {
        constructRef.current.style.width = `${constructWidth}px`;
        constructRef.current.style.height = `${constructHeight}px`;
        constructRef.current.style.setProperty('--opening-arm-width', `${armWidth}px`);
        constructRef.current.style.setProperty('--opening-arm-height', `${armHeight}px`);
        constructRef.current.style.setProperty('--opening-slash-reveal', `${frame.slashReveal}`);
      }

      if (nameRef.current) {
        const nameTreatment = resolveNameTreatment(frame.mediaReveal);
        nameRef.current.style.opacity = `${frame.nameReveal}`;
        nameRef.current.style.color = `rgba(${nameTreatment.tone}, ${nameTreatment.tone}, ${nameTreatment.tone}, ${nameTreatment.alpha})`;
        nameRef.current.style.filter = `blur(${nameTreatment.blurPx}px)`;
        nameRef.current.style.textShadow = frame.mediaReveal > 0
          ? `0 0 ${3 * frame.mediaReveal}px rgba(255, 255, 255, ${0.07 * frame.mediaReveal})`
          : 'none';
        nameRef.current.style.clipPath = `inset(0 ${50 * (1 - frame.nameReveal)}% 0 ${50 * (1 - frame.nameReveal)}%)`;
        nameRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${mix(0.96, 1, frame.nameReveal)})`;
      }

      if (mediaFrameRef.current) {
        mediaFrameRef.current.style.width = `${mediaWidth}px`;
        mediaFrameRef.current.style.height = `${mediaHeight}px`;
        mediaFrameRef.current.style.opacity = `${frame.mediaReveal}`;
      }

      if (mediaRef.current) {
        mediaRef.current.style.transform = `scale(${frame.cameraScale})`;
      }

      if (elapsed < playback.durationMs) {
        animationFrame = window.requestAnimationFrame(renderFrame);
      }
    };

    animationFrame = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(fallbackTimer);
      delete document.documentElement.dataset.portfolioOpening;
    };
  }, [finishOpening, onPrepareHeroEffects]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (event.target === event.currentTarget && event.animationName === 'opening-sequence-exit') {
      finishOpening();
    }
  };

  return (
    <section
      ref={rootRef}
      className="opening-sequence"
      style={{ '--opening-duration': `${OPENING_SEQUENCE_DURATION_MS}ms` } as CSSProperties}
      aria-hidden="true"
      onAnimationEnd={handleAnimationEnd}
    >
      <div ref={constructRef} className="opening-sequence__construct">
        <div className="opening-sequence__corner opening-sequence__corner--top-left" aria-hidden="true">
          <span className="opening-sequence__corner-horizontal" />
          <span className="opening-sequence__corner-vertical" />
        </div>
        <div className="opening-sequence__corner opening-sequence__corner--bottom-right" aria-hidden="true">
          <span className="opening-sequence__corner-horizontal" />
          <span className="opening-sequence__corner-vertical" />
        </div>

        <div ref={mediaFrameRef} className="opening-sequence__media-frame">
          <img
            ref={mediaRef}
            className="opening-sequence__media"
            src="/opening/forest-opening.webp"
            alt=""
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>

        <div ref={nameRef} className="opening-sequence__name">
          <span>YIKAI</span>
          <span>CHEN</span>
        </div>

        <span className="opening-sequence__slash" aria-hidden="true" />
      </div>

      <p className="opening-sequence__edition">PORTFOLIO / 2026</p>
    </section>
  );
}
