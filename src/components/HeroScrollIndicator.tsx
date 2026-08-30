import type { MouseEvent } from 'react';
import { resolveNavigationScrollBehavior } from '@/lib/navigation-motion';

export default function HeroScrollIndicator() {
  const scrollToAbout = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const about = document.getElementById('about');
    if (!about) return;

    const targetTop = window.scrollY + about.getBoundingClientRect().top;
    const behavior = resolveNavigationScrollBehavior(
      Math.abs(targetTop - window.scrollY),
      window.innerHeight,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    window.scrollTo({ top: targetTop, behavior });
  };

  return (
    <a
      className="hero-scroll-indicator"
      href="#about"
      aria-label="Scroll to About"
      onClick={scrollToAbout}
    >
      <span className="hero-scroll-indicator__label" aria-hidden="true">SCROLL</span>
      <svg
        className="hero-scroll-indicator__icon"
        viewBox="0 0 28 38"
        fill="none"
        aria-hidden="true"
      >
        <path className="hero-scroll-indicator__stem" d="M14 2V28" />
        <path className="hero-scroll-indicator__chevron" d="M5 21L14 30L23 21" />
        <path className="hero-scroll-indicator__echo" d="M8 29L14 35L20 29" />
      </svg>
    </a>
  );
}
