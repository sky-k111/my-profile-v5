import { forwardRef, type CSSProperties } from 'react';
import './BrandMark.css';

type BrandMarkProps = {
  className?: string;
  progress?: number;
  title?: string;
};

const BrandMark = forwardRef<SVGSVGElement, BrandMarkProps>(function BrandMark(
  { className = '', progress = 1, title },
  ref,
) {
  const classes = ['brand-mark', className].filter(Boolean).join(' ');

  return (
    <svg
      ref={ref}
      className={classes}
      viewBox="0 0 256 256"
      preserveAspectRatio="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ '--brand-progress': progress } as CSSProperties}
    >
      <path className="brand-mark__path" pathLength="1" d="M94 36H34V96" />
      <path className="brand-mark__path" pathLength="1" d="M162 220H222V160" />
      <path className="brand-mark__slash" pathLength="1" d="M150 102L106 152" />
    </svg>
  );
});

export default BrandMark;
