import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { resolveInitialSectionId, resolveSectionNavigationUrl, type SiteNavItem } from '@/lib/navigation';
import { resolveNavigationScrollBehavior } from '@/lib/navigation-motion';
import PersonalLogo from './PersonalLogo';
import './SiteNav.css';

type SiteNavProps = {
  items: SiteNavItem[];
  deepLinkRestoreReady: boolean;
};

type SectionRange = {
  id: string;
  top: number;
  bottom: number;
};

function syncSectionUrl(id: string) {
  const nextUrl = resolveSectionNavigationUrl(id, window.location.pathname, window.location.search);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl === currentUrl) return;
  window.history.replaceState(window.history.state, '', nextUrl);
}

export default function SiteNav({ items, deepLinkRestoreReady }: SiteNavProps) {
  const initialSectionIdRef = useRef(resolveInitialSectionId(window.location.hash, items));
  const [activeId, setActiveId] = useState(initialSectionIdRef.current ?? items[0]?.id ?? '');
  const activeIdRef = useRef(activeId);
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const sectionRangesRef = useRef<SectionRange[]>([]);
  const scrollRangeRef = useRef(1);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const forcedActiveRef = useRef<string | null>(null);
  const refreshActiveSectionRef = useRef<() => void>(() => undefined);
  const navigationReleaseTimerRef = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!deepLinkRestoreReady) return;

    const initialSectionId = initialSectionIdRef.current;
    if (!initialSectionId) return;

    const section = document.getElementById(initialSectionId);
    if (!section) return;

    // Projects overlaps About by one viewport. Arm its paper stage before the
    // opening overlay is removed so a deep-link refresh never exposes the red
    // handoff frame on its own.
    if (initialSectionId === 'projects') {
      window.dispatchEvent(new CustomEvent('site-section-navigation', {
        detail: { id: initialSectionId },
      }));
    }

    section.scrollIntoView({ block: 'start', behavior: 'auto' });

    if (initialSectionId !== 'projects') {
      window.dispatchEvent(new CustomEvent('site-section-navigation', {
        detail: { id: initialSectionId },
      }));
    }

    initialSectionIdRef.current = null;
    requestAnimationFrame(() => refreshActiveSectionRef.current());
  }, [deepLinkRestoreReady]);

  useEffect(() => {
    let scrollFrame = 0;
    let measureFrame = 0;
    let disposed = false;

    const commitActiveId = (id: string, syncUrl: boolean) => {
      if (activeIdRef.current === id) return;
      activeIdRef.current = id;
      setActiveId(id);
      if (syncUrl) syncSectionUrl(id);
    };

    const measureSections = () => {
      measureFrame = 0;
      const scrollY = window.scrollY;
      sectionRangesRef.current = items.flatMap(item => {
        const section = document.getElementById(item.id);
        if (!section) return [];
        const rect = section.getBoundingClientRect();
        return [{ id: item.id, top: scrollY + rect.top, bottom: scrollY + rect.bottom }];
      });
      scrollRangeRef.current = Math.max(
        1,
        Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight,
      );
    };

    const updateActiveSection = (syncUrl = true) => {
      scrollFrame = 0;
      const scrollY = window.scrollY;
      const scrollProgress = Math.min(1, Math.max(0, scrollY / scrollRangeRef.current));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${scrollProgress.toFixed(5)})`;
      if (forcedActiveRef.current) {
        commitActiveId(forcedActiveRef.current, false);
        return;
      }

      const focusLine = scrollY + window.innerHeight * 0.34;
      let closest = { id: items[0]?.id ?? '', distance: Number.POSITIVE_INFINITY };

      for (const section of sectionRangesRef.current) {
        const containsFocusLine = section.top <= focusLine && section.bottom >= focusLine;
        const distance = containsFocusLine
          ? 0
          : Math.min(Math.abs(section.top - focusLine), Math.abs(section.bottom - focusLine));
        if (distance <= closest.distance) closest = { id: section.id, distance };
      }

      if (closest.id) {
        const initialSectionId = initialSectionIdRef.current;
        if (initialSectionId && !deepLinkRestoreReady) {
          commitActiveId(initialSectionId, false);
          return;
        }
        if (initialSectionId && closest.id !== initialSectionId) {
          commitActiveId(initialSectionId, false);
          return;
        }
        initialSectionIdRef.current = null;
        commitActiveId(closest.id, syncUrl);
      }
    };

    const scheduleScrollUpdate = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(() => updateActiveSection());
    };
    const scheduleMeasure = () => {
      if (measureFrame) return;
      measureFrame = requestAnimationFrame(() => {
        measureSections();
        updateActiveSection();
      });
    };
    refreshActiveSectionRef.current = () => {
      measureSections();
      updateActiveSection();
    };

    measureSections();
    updateActiveSection(false);

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(document.body);
    sectionRangesRef.current.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) resizeObserver.observe(element);
    });
    void document.fonts?.ready.then(() => {
      if (!disposed) scheduleMeasure();
    });

    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    const releaseForcedActive = (event: Event) => {
      const { id } = (event as CustomEvent<{ id?: string }>).detail ?? {};
      if (!id || forcedActiveRef.current !== id) return;
      forcedActiveRef.current = null;
      updateActiveSection();
    };
    window.addEventListener('site-section-navigation-complete', releaseForcedActive);

    return () => {
      disposed = true;
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(measureFrame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleScrollUpdate);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('site-section-navigation-complete', releaseForcedActive);
      refreshActiveSectionRef.current = () => undefined;
      if (navigationReleaseTimerRef.current) {
        window.clearTimeout(navigationReleaseTimerRef.current);
      }
    };
  }, [items, deepLinkRestoreReady]);

  useLayoutEffect(() => {
    const activeLink = linkRefs.current.get(activeId);
    if (!activeLink) return;

    const updateIndicator = () => {
      setIndicator({ x: activeLink.offsetLeft, width: activeLink.offsetWidth });
    };

    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    if (trackRef.current) observer.observe(trackRef.current);
    observer.observe(activeLink);
    return () => observer.disconnect();
  }, [activeId, items]);

  const navigateTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const section = document.getElementById(id);
    const about = document.getElementById('about');
    if (!section) return;
    initialSectionIdRef.current = null;
    forcedActiveRef.current = id;
    activeIdRef.current = id;
    setActiveId(id);
    syncSectionUrl(id);
    const targetTop = window.scrollY + section.getBoundingClientRect().top;
    const distance = Math.abs(targetTop - window.scrollY);
    const behavior = resolveNavigationScrollBehavior(
      distance,
      window.innerHeight,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    const shouldReverseAboutExit = id === 'home' && about
      ? about.getBoundingClientRect().top <= 0 && about.getBoundingClientRect().bottom > 0
      : false;

    // Let Projects cover the completed About frame before this synchronous jump.
    if (id === 'projects') {
      window.dispatchEvent(new CustomEvent('site-section-navigation', { detail: { id } }));
    }

    window.scrollTo({
      top: targetTop,
      behavior: shouldReverseAboutExit ? 'smooth' : id === 'about' || id === 'projects' ? 'auto' : behavior,
    });

    if (id !== 'projects') {
      window.dispatchEvent(new CustomEvent('site-section-navigation', { detail: { id } }));

      const releaseActiveLock = () => {
        if (forcedActiveRef.current !== id) return;
        forcedActiveRef.current = null;
        refreshActiveSectionRef.current();
      };

      if (shouldReverseAboutExit) {
        window.addEventListener('scrollend', releaseActiveLock, { once: true });
        if (navigationReleaseTimerRef.current) {
          window.clearTimeout(navigationReleaseTimerRef.current);
        }
        navigationReleaseTimerRef.current = window.setTimeout(releaseActiveLock, 900);
      } else {
        requestAnimationFrame(() => requestAnimationFrame(releaseActiveLock));
      }
    }
  };

  return (
    <>
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="site-nav__shell">
          <a className="site-nav__brand" href="/" aria-label="Refresh page">
            <PersonalLogo className="site-nav__brand-mark" />
          </a>
          <div ref={trackRef} className="site-nav__track">
            <span
              className="site-nav__indicator"
              aria-hidden="true"
              style={{ width: indicator.width, transform: `translate3d(${indicator.x}px, 0, 0)` }}
            />
            {items.map(item => {
              const active = item.id === activeId;
              return (
                <a
                  key={item.id}
                  ref={node => {
                    if (node) linkRefs.current.set(item.id, node);
                    else linkRefs.current.delete(item.id);
                  }}
                  className="site-nav__link"
                  data-active={active ? 'true' : 'false'}
                  href={`#${item.id}`}
                  aria-current={active ? 'location' : undefined}
                  onClick={event => navigateTo(event, item.id)}
                >
                  <span className="site-nav__label">
                    <span className="site-nav__label-stack">
                      <span>{item.label}</span>
                      <span aria-hidden="true">{item.label}</span>
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="portfolio-progress" data-section={activeId} aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </>
  );
}
