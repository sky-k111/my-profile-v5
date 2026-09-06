import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import {
  OPENING_LABEL,
  OPENING_SEQUENCE_DURATION_MS,
  resolveOpeningFrame,
  resolveOpeningGlyphOpacity,
  resolveOpeningPlayback,
} from '@/lib/opening-sequence';
import PersonalLogo from './PersonalLogo';
import './OpeningSequence.css';

type OpeningSequenceProps = {
  onComplete: () => void;
  onPrepareHeroEffects: () => void;
};

const openingWords = ['YIKAI', 'CHEN'] as const;

function GlyphShape({ letter }: { letter: string }) {
  switch (letter) {
    case 'Y':
      return <path d="M0 0h16l16 32L48 0h16L40 48v48H24V48Z" />;
    case 'I':
      return <path d="M0 0h64v16H40v64h24v16H0V80h24V16H0Z" />;
    case 'K':
      return <path d="M0 0h16v38L47 0h19L35 46l32 50H48L24 59l-8 11v26H0Z" />;
    case 'A':
      return (
        <path
          fillRule="evenodd"
          d="M24 0h16l24 96H47l-6-24H23l-6 24H0Zm3 56h10l-5-24Z"
        />
      );
    case 'C':
      return <path d="M15 0h49v16H21l-5 5v54l5 5h43v16H15L0 81V15Z" />;
    case 'H':
      return <path d="M0 0h16v39h32V0h16v96H48V55H16v41H0Z" />;
    case 'E':
      return <path d="M0 0h64v16H16v23h39v16H16v25h48v16H0Z" />;
    case 'N':
      return <path d="M0 0h16l32 62V0h16v96H48L16 34v62H0Z" />;
    default:
      return null;
  }
}

export default function OpeningSequence({ onComplete, onPrepareHeroEffects }: OpeningSequenceProps) {
  const completedRef = useRef(false);
  const heroEffectsPreparedRef = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const markRef = useRef<HTMLDivElement | null>(null);
  const glyphRefs = useRef<Array<SVGSVGElement | null>>([]);

  const finishOpening = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    delete document.documentElement.dataset.portfolioOpening;
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
    const fallbackTimer = window.setTimeout(finishOpening, playback.durationMs + 500);
    const startedAt = performance.now();
    let animationFrame = 0;

    const renderFrame = (now: number) => {
      const elapsed = Math.min(now - startedAt, playback.durationMs);
      const frame = resolveOpeningFrame(elapsed);

      if (frame.prepareHeroEffects && !heroEffectsPreparedRef.current) {
        heroEffectsPreparedRef.current = true;
        onPrepareHeroEffects();
      }

      rootRef.current?.style.setProperty('--opening-interface-opacity', `${frame.interfaceOpacity}`);
      rootRef.current?.style.setProperty('--opening-progress', `${frame.progress}`);
      rootRef.current?.style.setProperty('--opening-counter-enter', `${frame.counterEntrance}`);
      rootRef.current?.style.setProperty('--opening-curtain', `${frame.curtain}`);
      rootRef.current?.setAttribute(
        'data-curtain-gap',
        frame.curtain >= 0.055 ? 'open' : 'covered',
      );

      if (counterRef.current) {
        counterRef.current.textContent = String(frame.counter);
        counterRef.current.style.opacity = `${frame.counterOpacity}`;
      }

      if (markRef.current) markRef.current.style.opacity = `${frame.markOpacity}`;

      glyphRefs.current.forEach((glyph, index) => {
        if (!glyph) return;
        glyph.style.opacity = `${resolveOpeningGlyphOpacity(elapsed, index)}`;
      });

      if (elapsed < playback.durationMs) {
        animationFrame = window.requestAnimationFrame(renderFrame);
      } else {
        finishOpening();
      }
    };

    animationFrame = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(fallbackTimer);
      delete document.documentElement.dataset.portfolioOpening;
    };
  }, [finishOpening, onPrepareHeroEffects]);

  return (
    <section
      ref={rootRef}
      className="opening-sequence"
      style={{ '--opening-duration': `${OPENING_SEQUENCE_DURATION_MS}ms` } as CSSProperties}
      aria-hidden="true"
    >
      <div className="opening-sequence__curtain">
        <div className="opening-sequence__panel opening-sequence__panel--top" />
        <div className="opening-sequence__panel opening-sequence__panel--bottom" />
      </div>

      <div className="opening-sequence__registration opening-sequence__registration--one" />
      <div className="opening-sequence__registration opening-sequence__registration--two" />
      <div className="opening-sequence__registration opening-sequence__registration--three" />
      <div className="opening-sequence__registration opening-sequence__registration--four" />

      <div className="opening-sequence__stage">
        <div className="opening-sequence__identity">
          <h1 className="opening-sequence__label" aria-label={OPENING_LABEL}>
            {openingWords.map((word, wordIndex) => (
              <span className="opening-sequence__word" key={word}>
                {word.split('').map((letter, letterIndex) => {
                  const glyphIndex = wordIndex === 0 ? letterIndex : 5 + letterIndex;
                  return (
                    <svg
                      key={`${letter}-${glyphIndex}`}
                      ref={(element) => { glyphRefs.current[glyphIndex] = element; }}
                      className="opening-sequence__glyph"
                      viewBox="0 0 64 96"
                      aria-hidden="true"
                    >
                      <GlyphShape letter={letter} />
                    </svg>
                  );
                })}
              </span>
            ))}
          </h1>
        </div>

        <div ref={markRef} className="opening-sequence__mark">
          <PersonalLogo className="opening-sequence__brand-logo" />
        </div>

        <span ref={counterRef} className="opening-sequence__counter">0</span>
      </div>

      <footer className="opening-sequence__footer">
        <div className="opening-sequence__rail">
          <span className="opening-sequence__rail-fill" />
          {[0, 25, 50, 75, 100].map((tick) => (
            <span
              key={tick}
              className="opening-sequence__rail-tick"
              style={{
                '--tick-position': `${tick}%`,
                '--tick-index': tick / 25,
                '--tick-anchor': tick === 0 ? '0%' : tick === 100 ? '-100%' : '-50%',
              } as CSSProperties}
            >
              {String(tick).padStart(2, '0')}
            </span>
          ))}
        </div>
      </footer>
    </section>
  );
}
