export default function AboutScrollCue() {
  return (
    <div className="about-scroll-cue" aria-hidden="true">
      <span className="about-scroll-cue__label">SCROLL DOWN TO SEE ANOTHER SIDE OF ME</span>
      <svg className="about-scroll-cue__symbol" viewBox="0 0 84 104">
        <circle className="about-scroll-cue__orbit about-scroll-cue__orbit--outer" cx="42" cy="44" r="30" />
        <circle className="about-scroll-cue__orbit about-scroll-cue__orbit--inner" cx="42" cy="44" r="17" />
        <g className="about-scroll-cue__gate">
          <path d="M13 79H34" />
          <path d="M50 79H71" />
        </g>
        <rect className="about-scroll-cue__drop" x="38.5" y="18" width="7" height="7" rx="1" />
      </svg>
    </div>
  );
}
