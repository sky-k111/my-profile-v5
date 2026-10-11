import { useCallback, useLayoutEffect, useState } from 'react';
import AboutSection from './about/AboutSection';
import Hero from './components/Hero';
import HeroMicroChrome from './components/HeroMicroChrome';
import OpeningSequence from './components/OpeningSequence';
import SiteNav from './components/SiteNav';
import ContactSection from './contact/ContactSection';
import ContactTab from './contact/ContactTab';
import { SITE_NAV_ITEMS } from './lib/navigation';
import { hasCompletedVisit } from './lib/startup-visit';
import startupCacheKey from 'virtual:startup-cache-key';
import ProjectsTransition from './projects/ProjectsTransition';

export default function App() {
  const [previousVisitReady] = useState(() => hasCompletedVisit(window.localStorage, startupCacheKey));
  const [openingComplete, setOpeningComplete] = useState(false);
  const [heroEffectsPrepared, setHeroEffectsPrepared] = useState(false);

  const prepareHeroEffects = useCallback(() => setHeroEffectsPrepared(true), []);
  const completeOpening = useCallback(() => {
    setOpeningComplete(true);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-portfolio-booting');
  }, []);

  useLayoutEffect(() => {
    if (!openingComplete || document.documentElement.dataset.portfolioRefreshReset !== 'home') return;
    window.history.scrollRestoration = 'auto';
    delete document.documentElement.dataset.portfolioRefreshReset;
  }, [openingComplete]);

  return (
    <>
      {!openingComplete && (
        <OpeningSequence
          warmStart={previousVisitReady}
          onPrepareHeroEffects={prepareHeroEffects}
          onComplete={completeOpening}
        />
      )}
      <SiteNav items={SITE_NAV_ITEMS} deepLinkRestoreReady={heroEffectsPrepared} />
      <ContactTab visible={openingComplete} />
      <main>
        <div className="hero-shell">
          <HeroMicroChrome openingActive={!openingComplete} />
          <Hero active={openingComplete} effectsActive={openingComplete || heroEffectsPrepared} />
        </div>
        <AboutSection />
        {heroEffectsPrepared && <ProjectsTransition />}
        <ContactSection />
      </main>
    </>
  );
}
