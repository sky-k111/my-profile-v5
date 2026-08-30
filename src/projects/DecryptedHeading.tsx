import { useEffect, useRef, useState } from 'react';

const GLYPHS = '01/<>[]{}+=*#';

function scramble(text: string, revealedCharacters: number) {
  return Array.from(text, (character, index) => {
    if (character === ' ' || index < revealedCharacters) return character;
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }).join('');
}

export default function DecryptedHeading({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const run = () => {
      window.clearInterval(intervalRef.current);
      if (reduceMotion.matches) {
        setDisplayText(text);
        return;
      }

      let revealedCharacters = 0;
      setDisplayText(scramble(text, revealedCharacters));
      intervalRef.current = window.setInterval(() => {
        revealedCharacters += 1;
        setDisplayText(scramble(text, revealedCharacters));
        if (revealedCharacters >= text.length) window.clearInterval(intervalRef.current);
      }, 42);
    };

    window.addEventListener('projects-selected-works-entry', run);
    return () => {
      window.clearInterval(intervalRef.current);
      window.removeEventListener('projects-selected-works-entry', run);
    };
  }, [text]);

  return (
    <span className="projects-transition__decrypted-heading" aria-label={text}>
      {Array.from(text).map((character, index) => (
        <span
          className={`projects-transition__decrypted-slot${character === ' ' ? ' projects-transition__decrypted-slot--space' : ''}`}
          aria-hidden="true"
          data-final={character === ' ' ? '\u00a0' : character}
          key={`${character}-${index}`}
        >
          <span className="projects-transition__decrypted-glyph">{displayText[index] === ' ' ? '\u00a0' : displayText[index]}</span>
        </span>
      ))}
    </span>
  );
}
