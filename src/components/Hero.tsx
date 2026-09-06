import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import TextPressure from './TextPressure';
import PortraitReveal from './PortraitReveal';
import Signature from './Signature';
import HeroScrollIndicator from './HeroScrollIndicator';
import SectionMarks from './SectionMarks';
import { HERO_PIXEL_BLAST } from '@/lib/hero-effects';

const PixelBlast = lazy(() => import('./PixelBlast'));

type HeroProps = {
  active?: boolean;
  effectsActive?: boolean;
};

export default function Hero({ active = true, effectsActive = active }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [heroInViewport, setHeroVisible] = useState(false);
  const heroVisible = active && heroInViewport;
  const heroEffectsVisible = effectsActive && heroInViewport;

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
    });
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={heroRef} id="home" className="hero" data-active={heroVisible ? 'true' : 'false'} aria-labelledby="hero-title">
      <SectionMarks />
      <p className="hero-section-index">01 / HOME</p>
      <div className="pixel-blast-stage" aria-hidden="true">
        {heroEffectsVisible && (
          <Suspense fallback={null}>
            <PixelBlast
              {...HERO_PIXEL_BLAST}
              active={heroVisible}
              enableRipples={true}
              transparent
            />
          </Suspense>
        )}
      </div>

      <div className="hero-copy">
        <div className="hero-footer">
          <p className="hero-note" aria-label="在算法与直觉之间，持续向前。">
            <span className="hero-note__line">在算法与直觉之间</span>
            <span className="hero-note__line hero-note__line--delay">持续向前。</span>
          </p>
          <Signature active={heroVisible} />
        </div>
      </div>

      <h1 id="hero-title">
        <TextPressure active={heroVisible} />
      </h1>

      <PortraitReveal active={heroVisible} />
      <HeroScrollIndicator />
    </section>
  );
}
