type EthanSignatureProps = {
  active: boolean;
};

const STROKES = [
  'M52 67C81 32 143 19 165 37C181 51 154 69 116 77C83 84 54 81 35 73C57 81 88 91 103 108C116 124 94 139 63 133C37 128 31 110 44 95',
  'M109 108C132 98 155 83 178 61C194 45 202 30 202 19C205 42 199 73 194 100C191 119 199 128 212 117',
  'M169 70C190 65 212 62 234 61',
  'M211 117C227 91 242 59 249 31C253 17 262 20 260 38C257 65 242 96 230 117C242 94 256 78 268 80C280 83 268 109 277 117C286 125 297 112 303 102',
  'M303 102C310 85 325 78 336 84C346 91 335 112 323 117C311 121 306 110 311 98M338 84C333 99 335 116 345 119C354 121 365 108 371 99',
  'M371 99C376 89 381 80 386 80C391 81 385 101 385 115C393 96 405 80 416 82C427 85 414 111 424 119C434 127 447 113 453 103',
  'M132 143C213 132 317 132 457 139C429 142 399 149 375 159',
] as const;

export default function EthanSignature({ active }: EthanSignatureProps) {
  return (
    <svg
      className="contact-signature"
      viewBox="0 0 490 170"
      role="img"
      aria-label="Ethan signature"
      data-active={active ? 'true' : 'false'}
    >
      <title>Ethan</title>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {STROKES.map((path, index) => (
          <path key={path} d={path} pathLength="1" style={{ '--stroke-index': index } as CSSProperties} />
        ))}
      </g>
    </svg>
  );
}
import type { CSSProperties } from 'react';
