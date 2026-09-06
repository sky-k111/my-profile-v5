import { useEffect, useRef, type CSSProperties } from 'react';
import './HeroMicroChrome.css';

type HeroMicroChromeProps = {
  openingActive: boolean;
};

function MicroLine({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <span className="hero-micro-chrome__line" aria-label={text}>
      <span aria-hidden="true">
        {Array.from(text).map((character, index) => (
          <i
            key={`${character}-${index}`}
            className="hero-micro-chrome__character"
            style={{ '--micro-index': offset + index } as CSSProperties}
          >
            {character === ' ' ? '\u00a0' : character}
          </i>
        ))}
      </span>
    </span>
  );
}

function formatHangzhouTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
}

export default function HeroMicroChrome({ openingActive }: HeroMicroChromeProps) {
  const timeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      if (timeRef.current) timeRef.current.textContent = formatHangzhouTime();
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside
      className="hero-micro-chrome"
      data-opening={openingActive ? 'true' : 'false'}
      aria-label="Portfolio information"
    >
      <div className="hero-micro-chrome__block hero-micro-chrome__block--top-left">
        <MicroLine text="YIKAI CHEN / PORTFOLIO 2026" />
        <MicroLine text="AI · COMPUTER SCIENCE · AIBUILDER" offset={22} />
      </div>

      <div className="hero-micro-chrome__block hero-micro-chrome__block--top-right">
        <MicroLine text="HANGZHOU / UTC+08" offset={50} />
        <span ref={timeRef} className="hero-micro-chrome__time">--:--:--</span>
      </div>

      <div className="hero-micro-chrome__block hero-micro-chrome__block--bottom-left">
        <MicroLine text="DESIGN · CODE · EXPERIMENTS" offset={66} />
        <MicroLine text="SELECTED WORK / 2026" offset={88} />
      </div>

      <div className="hero-micro-chrome__block hero-micro-chrome__block--bottom-right">
        <MicroLine text="30.2741° N" offset={104} />
        <MicroLine text="120.1551° E" offset={114} />
      </div>
    </aside>
  );
}
