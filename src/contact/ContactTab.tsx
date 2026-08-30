import { useEffect, useRef, useState, type MouseEvent } from 'react';
import BrandMark from '@/components/BrandMark';

export default function ContactTab({ visible }: { visible: boolean }) {
  const [contactActive, setContactActive] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const contact = document.getElementById('contact');
    if (!contact) return;

    observerRef.current = new IntersectionObserver(
      entries => setContactActive(entries.some(entry => entry.isIntersecting)),
      { rootMargin: '-28% 0px -28% 0px' },
    );
    observerRef.current.observe(contact);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const id = contactActive ? 'home' : 'contact';
    const target = document.getElementById(id);
    if (!target) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    const url = id === 'home'
      ? `${window.location.pathname}${window.location.search}`
      : `${window.location.pathname}${window.location.search}#contact`;
    window.history.replaceState(window.history.state, '', url);
  };

  const label = contactActive ? 'BACK TO TOP' : 'CONTACT';

  return (
    <a
      className="contact-tab"
      data-visible={visible ? 'true' : 'false'}
      data-contact-active={contactActive ? 'true' : 'false'}
      href={contactActive ? '#home' : '#contact'}
      aria-label={contactActive ? 'Back to top' : 'Contact Yikai Chen'}
      onClick={navigate}
    >
      <BrandMark className="contact-tab__mark" />
      <span>{label}</span>
    </a>
  );
}
