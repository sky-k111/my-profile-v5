import { useEffect, useRef, useState } from 'react';
import PersonalLogo from '@/components/PersonalLogo';
import SectionMarks from '@/components/SectionMarks';
import EthanSignature from './EthanSignature';
import './contact.css';

const EMAIL = '1503794397@qq.com';
const WECHAT_ID = 'chenyikaizuishuai';
const CONTACT_MARQUEE_HOVER_RATE = 0.28;

const SOCIAL_LINKS = [
  { label: 'GITHUB', detail: 'SKY-K111', href: 'https://github.com/sky-k111', icon: '/ai-brands/github.svg' },
  { label: 'X', detail: '@YKCHENXXX', href: 'https://x.com/ykchenxxx', icon: '/ai-brands/x.svg' },
  {
    label: 'FACEBOOK',
    detail: 'YIKAI CHEN',
    href: 'https://www.facebook.com/profile.php?id=61593491366698',
    icon: '/ai-brands/facebook.svg',
  },
] as const;

const AI_PIT_CREW = [
  { name: 'ChatGPT', icon: '/ai-brands/openai.svg' },
  { name: 'Codex', icon: '/ai-brands/codex.svg' },
  { name: 'Claude', icon: '/ai-brands/claude.svg' },
  { name: 'Gemini', icon: '/ai-brands/gemini.svg' },
  { name: 'DeepSeek', icon: '/ai-brands/deepseek.svg' },
  { name: 'Kimi', icon: '/ai-brands/kimi.svg' },
  { name: 'Grok', icon: '/ai-brands/grok.svg' },
  { name: 'Qwen', icon: '/ai-brands/qwen.png' },
  { name: '智谱清言', icon: '/ai-brands/zhipu.ico' },
  { name: '豆包', icon: '/ai-brands/doubao.png' },
] as const;

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <span className="contact-marquee__group" aria-hidden={hidden || undefined}>
      {AI_PIT_CREW.map(tool => (
        <span className="contact-marquee__item" key={tool.name}>
          <span className="contact-marquee__icon" aria-hidden="true">
            <img src={tool.icon} alt="" loading="lazy" />
          </span>
          {tool.name}
        </span>
      ))}
    </span>
  );
}

export default function ContactSection() {
  const rootRef = useRef<HTMLElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<number | undefined>(undefined);
  const [signatureReady, setSignatureReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const setContactActive = (active: boolean) => {
      root.toggleAttribute('data-contact-visible', active);
      document.documentElement.toggleAttribute('data-contact-active', active);
    };

    const observer = new IntersectionObserver(
      entries => setContactActive(entries.some(entry => entry.isIntersecting)),
      { rootMargin: '-28% 0px -28% 0px' },
    );
    const signatureObserver = new IntersectionObserver(
      entries => {
        const nearlyFull = entries.some(entry => {
          const visibleTargetHeight = Math.min(entry.boundingClientRect.height, window.innerHeight);
          const visibleRatio = entry.intersectionRect.height / Math.max(visibleTargetHeight, 1);
          return visibleRatio >= 0.88;
        });
        setSignatureReady(nearlyFull);
      },
      { threshold: [0, 0.5, 0.75, 0.88, 1] },
    );
    observer.observe(root);
    signatureObserver.observe(root);

    const marqueeTrack = marqueeTrackRef.current;
    const marqueeGroup = root.querySelector<HTMLElement>('.contact-marquee__group');
    const syncMarqueeDistance = () => {
      const groupWidth = marqueeGroup?.getBoundingClientRect().width ?? 0;
      if (groupWidth > 0) marqueeTrack?.style.setProperty('--marquee-shift', `${-groupWidth}px`);
    };
    const marqueeObserver = new ResizeObserver(syncMarqueeDistance);
    if (marqueeGroup) marqueeObserver.observe(marqueeGroup);
    syncMarqueeDistance();
    void document.fonts?.ready.then(syncMarqueeDistance);

    return () => {
      observer.disconnect();
      signatureObserver.disconnect();
      marqueeObserver.disconnect();
      document.documentElement.removeAttribute('data-contact-active');
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const copyWechat = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(WECHAT_ID);
      } else {
        const field = document.createElement('textarea');
        field.value = WECHAT_ID;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        const copiedWithFallback = document.execCommand('copy');
        field.remove();
        if (!copiedWithFallback) throw new Error('Clipboard unavailable');
      }
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const setMarqueePlaybackRate = (playbackRate: number) => {
    marqueeTrackRef.current
      ?.getAnimations()
      .forEach(animation => animation.updatePlaybackRate(playbackRate));
  };

  return (
    <section ref={rootRef} id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact__shell">
        <SectionMarks />
        <div className="contact__contours" aria-hidden="true" />
        <div className="contact__grid" aria-hidden="true" />

        <a className="contact__identity" href="#home" aria-label="Back to Yikai Chen home">
          <PersonalLogo className="contact__identity-mark" />
          <span className="contact__identity-name">
            <strong>YIKAI</strong>
            <strong>CHEN</strong>
          </span>
        </a>

        <p className="contact__section-index">04 / CONTACT</p>

        <p className="contact__availability">
          <span aria-hidden="true" />
          AVAILABLE FOR COLLABORATION
        </p>

        <div className="contact__headline-wrap">
          <EthanSignature active={signatureReady} />
          <h2 id="contact-title" className="contact__headline">
            <span className="contact__headline-line">
              <span>ALWAYS</span>
              <em>BUILDING</em>
            </span>
            <span className="contact__headline-line contact__headline-line--second">
              WHAT&apos;S <em>NEXT.</em>
            </span>
          </h2>
        </div>

        <aside className="contact__panel contact__panel--details" aria-labelledby="contact-details-title">
          <p id="contact-details-title" className="contact__panel-label">DIRECT CHANNELS</p>
          <a className="contact__primary-link" href={`mailto:${EMAIL}`}>
            <span className="contact__link-lead">
              <span className="contact__mini-icon" aria-hidden="true">
                <img src="/contact-icons/mail.svg" alt="" />
              </span>
              EMAIL ME
            </span>
            <span aria-hidden="true">↗</span>
          </a>
          <span className="contact__detail">{EMAIL}</span>
          <button className="contact__copy" type="button" onClick={copyWechat}>
            <span className="contact__link-lead">
              <span className="contact__mini-icon" aria-hidden="true">
                <img src="/ai-brands/wechat.svg" alt="" />
              </span>
              {copied ? 'COPIED' : 'COPY WECHAT'}
            </span>
            <span aria-hidden="true">{copied ? '✓' : '＋'}</span>
          </button>
          <span className="contact__detail" aria-live="polite">
            {copied ? 'WECHAT ID COPIED' : WECHAT_ID}
          </span>
          <p className="contact__location">
            <span className="contact__mini-icon" aria-hidden="true">
              <img src="/contact-icons/location.svg" alt="" />
            </span>
            <span>HANGZHOU, CHINA<br />UTC+8</span>
          </p>
        </aside>

        <aside className="contact__panel contact__panel--social" aria-labelledby="contact-social-title">
          <p id="contact-social-title" className="contact__panel-label">FOLLOW / FIND ME ONLINE</p>
          <div className="contact__social-list">
            {SOCIAL_LINKS.map(link => (
              <a href={link.href} target="_blank" rel="noreferrer" key={link.label}>
                <span className="contact__mini-icon" aria-hidden="true">
                  <img src={link.icon} alt="" />
                </span>
                <span>{link.label}</span>
                <small>{link.detail}</small>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </aside>

        <img
          className="contact__driver"
          src="/racing-suit-cutout.png"
          alt="身穿官方人工智能品牌标识赛车服、头戴红色赛车头盔的人像"
        />

        <a className="contact__cta" href={`mailto:${EMAIL}`}>
          <span>START A CONVERSATION</span>
          <span aria-hidden="true">↗</span>
        </a>

        <div
          className="contact-marquee"
          aria-label={`AI pit crew: ${AI_PIT_CREW.map(tool => tool.name).join(', ')}`}
          onMouseEnter={() => setMarqueePlaybackRate(CONTACT_MARQUEE_HOVER_RATE)}
          onMouseLeave={() => setMarqueePlaybackRate(1)}
        >
          <p className="contact-marquee__label">AI PIT CREW / TOOLS I BUILD WITH</p>
          <div className="contact-marquee__viewport">
            <div ref={marqueeTrackRef} className="contact-marquee__track">
              <MarqueeGroup />
              <MarqueeGroup hidden />
            </div>
          </div>
        </div>

        <footer className="contact__footer">
          <span>© 2026 YIKAI CHEN. ALL RIGHTS RESERVED</span>
          <a href="#home">BACK TO TOP ↑</a>
        </footer>
      </div>
    </section>
  );
}
