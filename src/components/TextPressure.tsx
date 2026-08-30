import { useLayoutEffect, useRef, useState } from 'react';
import { getPressureCharacters, isPressureSpace, PRESSURE_NAME } from '@/lib/name';
import {
  getHeroNameStyle,
  getHeroPressureTransform,
  getHeroPressureVariation,
  HERO_NAME_FONT_QUERY,
} from '@/lib/pressure';

export default function TextPressure({ active = true }: { active?: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [fontReady, setFontReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;

    if (!document.fonts) {
      setFontReady(true);
      return;
    }

    document.fonts
      .load(HERO_NAME_FONT_QUERY, PRESSURE_NAME)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setFontReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const title = containerRef.current;
    if (!active || !fontReady || !title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letters = Array.from(title.querySelectorAll<HTMLSpanElement>(':scope > span'));
    const cursor = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let hasPointerInteraction = false;
    let rafId: number;

    const center = () => {
      const rect = title.getBoundingClientRect();
      cursor.x = rect.left + rect.width / 2;
      cursor.y = rect.top + rect.height / 2;
      smooth.x = cursor.x;
      smooth.y = cursor.y;
    };

    const move = (event: PointerEvent) => {
      hasPointerInteraction = true;
      cursor.x = event.clientX;
      cursor.y = event.clientY;
    };

    let titleRect = title.getBoundingClientRect();
    let rectFrame = 0;

    const render = () => {
      rectFrame++;
      // Only recalc rect every 10 frames to avoid layout thrashing
      if (rectFrame % 10 === 0) {
        titleRect = title.getBoundingClientRect();
      }

      smooth.x += (cursor.x - smooth.x) / 14;
      smooth.y += (cursor.y - smooth.y) / 14;

      if (!hasPointerInteraction) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const maxDistance = titleRect.width * 0.56;

      for (const span of letters) {
        if (span.classList.contains('text-pressure-space')) continue;
        const rect = span.getBoundingClientRect();
        const distance = Math.hypot(
          smooth.x - (rect.left + rect.width / 2),
          smooth.y - (rect.top + rect.height / 2),
        );
        span.style.fontVariationSettings = getHeroPressureVariation(distance, maxDistance);
        span.style.transform = getHeroPressureTransform(distance, maxDistance);
      }
      rafId = requestAnimationFrame(render);
    };

    center();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', center);
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', center);
    };
  }, [active, fontReady]);

  return (
    <span
      ref={containerRef}
      id="name-pressure"
      aria-label={PRESSURE_NAME}
      aria-busy={!fontReady}
      data-font-ready={fontReady ? 'true' : 'false'}
      style={getHeroNameStyle(fontReady)}
    >
      {getPressureCharacters().map((character, index) => (
        <span
          key={`${character}-${index}`}
          className={isPressureSpace(character) ? 'text-pressure-space' : undefined}
        >
          {character}
        </span>
      ))}
    </span>
  );
}
