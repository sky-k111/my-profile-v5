import { ABOUT_CONTENT } from './about-content';
import AboutScrollCue from './AboutScrollCue';

export function IdentityCopy() {
  return (
    <header className="about-copy about-copy--identity">
      <p className="about-kicker" lang="en">02 / ABOUT</p>
      <h2 id="about-title" className="about-display" lang="en">ABOUT</h2>
      <p className="about-name" lang="en">{ABOUT_CONTENT.nameEn}</p>
      <p className="about-identity" lang="en">{ABOUT_CONTENT.identityEn}</p>
      <p className="about-identity-zh" lang="zh-CN">{ABOUT_CONTENT.identityZh}</p>
      <AboutScrollCue />
    </header>
  );
}

export function BiographyCopy() {
  return (
    <div className="about-copy about-copy--biography">
      <p className="about-biography-label">
        <span lang="en">PERSONAL NOTES</span>
        <span lang="zh-CN">自我注解</span>
      </p>
      <div lang="zh-CN" className="about-copy__primary">
        {ABOUT_CONTENT.biographyZh.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div lang="en" className="about-copy__translation">
        {ABOUT_CONTENT.biographyEn.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </div>
  );
}

export function CuriosityKineticCopy() {
  const statement = ABOUT_CONTENT.biographyTypeEn.join(' ');

  return (
    <div className="about-copy about-curiosity-kinetic">
      <h3 className="about-curiosity-type" lang="en" aria-label={statement}>
        {ABOUT_CONTENT.biographyTypeEn.map((line, lineIndex) => (
          <span className="about-curiosity-type__line" data-type-line key={line}>
            {Array.from(line).map((character, characterIndex) => (
              <span
                className="about-curiosity-type__char"
                data-type-char
                aria-hidden="true"
                key={`${lineIndex}-${characterIndex}`}
              >
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </span>
        ))}
      </h3>
    </div>
  );
}

export function GrowthCopy() {
  return (
    <div className="about-copy about-copy--growth">
      <h3 className="about-display about-display--growth" lang="en">
        {ABOUT_CONTENT.aiTitle.map(line => <span key={line}>{line}</span>)}
      </h3>
      <div lang="zh-CN" className="about-copy__primary">
        <p>{ABOUT_CONTENT.aiZh}</p>
        <p>{ABOUT_CONTENT.growthZh}</p>
      </div>
      <div lang="en" className="about-copy__translation">
        <p>{ABOUT_CONTENT.aiEn}</p>
        <p>{ABOUT_CONTENT.growthEn}</p>
      </div>
    </div>
  );
}

export function InterestLines() {
  return (
    <div className="about-copy about-interests">
      {ABOUT_CONTENT.interests.map(interest => (
        <article className="about-interest" key={interest.index}>
          <span className="about-interest__rule" aria-hidden="true" />
          <span className="about-interest__index" aria-hidden="true">{interest.index}</span>
          <h3 className="about-interest__heading" lang="en">
            <span>{interest.title}</span>
            <em>/ {interest.accent}</em>
          </h3>
          <p className="about-interest__copy" lang="zh-CN">{interest.copyZh}</p>
          <span className="about-interest__meta" aria-hidden="true">{interest.meta}</span>
        </article>
      ))}
    </div>
  );
}

export function ManifestoCopy() {
  return (
    <footer className="about-copy about-manifesto">
      <p className="about-manifesto__en" lang="en">{ABOUT_CONTENT.manifestoEn}</p>
      <p className="about-manifesto__zh" lang="zh-CN">{ABOUT_CONTENT.manifestoZh}</p>
    </footer>
  );
}
