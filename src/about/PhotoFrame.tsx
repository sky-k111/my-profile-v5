import { useLayoutEffect, useRef, useState } from 'react';
import {
  createPhotoState,
  resetPhotoState,
  resolvePhotoStatus,
  type PhotoStatus,
} from '@/lib/photo-state';
import type { AboutPhoto } from './about-content';

type PhotoFrameProps = {
  photo: AboutPhoto;
  className?: string;
};

const STATUS_CLASSES: Record<PhotoStatus, string> = {
  empty: 'about-photo--empty',
  loading: 'about-photo--loading',
  loaded: 'about-photo--loaded',
  failed: 'about-photo--failed',
};

export default function PhotoFrame({ photo, className = '' }: PhotoFrameProps) {
  const currentSrc = useRef(photo.src);
  currentSrc.current = photo.src;
  const [imageState, setImageState] = useState(() => createPhotoState(photo.src));
  const status = resolvePhotoStatus(imageState, photo.src);
  const number = photo.id.slice(-2);

  useLayoutEffect(() => {
    setImageState(state => resetPhotoState(state, photo.src));
  }, [photo.src]);

  const updateStatus = (src: string, nextStatus: Extract<PhotoStatus, 'loaded' | 'failed'>) => {
    if (currentSrc.current !== src) return;
    setImageState({ src, status: nextStatus });
  };

  return (
    <figure
      className={`about-photo about-photo--${number} ${STATUS_CLASSES[status]} ${className}`.trim()}
      data-photo={photo.id}
      style={{ aspectRatio: photo.ratio }}
    >
      <div className="about-photo__media">
        {photo.src && status !== 'failed' ? (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.altZh}
            loading={photo.id === 'photo-01' ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => updateStatus(photo.src!, 'loaded')}
            onError={() => {
              if (import.meta.env.DEV) console.warn(`About image failed: ${photo.src}`);
              updateStatus(photo.src!, 'failed');
            }}
            style={{ objectPosition: photo.objectPosition ?? '50% 50%' }}
          />
        ) : (
          <div className="about-photo__empty" aria-hidden="true">
            <span>IMAGE {number}</span>
            <small>{photo.ratio.replace('/', ':')}</small>
          </div>
        )}
      </div>
    </figure>
  );
}
