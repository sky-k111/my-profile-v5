import { useCallback, useLayoutEffect, useState } from 'react';
import AboutSection from './about/AboutSection';
import Hero from './components/Hero';
import OpeningSequence from './components/OpeningSequence';
import SiteNav from './components/SiteNav';
import ContactSection from './contact/ContactSection';
import ContactTab from './contact/ContactTab';
import { SITE_NAV_ITEMS } from './lib/navigation';
import ProjectsTransition from './projects/ProjectsTransition';

export default function App() {
  const [openingComplete, setOpeningComplete] = useState(false);
  const [heroEffectsPrepared, setHeroEffectsPrepared] = useState(false);

  const prepareHeroEffects = useCallback(() => setHeroEffectsPrepared(true), []);
  const completeOpening = useCallback(() => setOpeningComplete(true), []);

  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-portfolio-booting');
  }, []);

  return (
    <>
      {!openingComplete && (
        <OpeningSequence
          onPrepareHeroEffects={prepareHeroEffects}
          onComplete={completeOpening}
        />
      )}
      <SiteNav items={SITE_NAV_ITEMS} />
      <ContactTab visible={openingComplete} />
      <main>
        <Hero active={openingComplete} effectsActive={openingComplete || heroEffectsPrepared} />
        <AboutSection />
        <ProjectsTransition />
        <ContactSection />
      </main>
    </>
  );
}
