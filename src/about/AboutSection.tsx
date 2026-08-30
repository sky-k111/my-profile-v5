import { useRef } from 'react';
import { createPortal } from 'react-dom';
import SectionMarks from '@/components/SectionMarks';
import { ABOUT_PHOTOS, type PhotoId } from './about-content';
import {
  GrowthCopy,
  IdentityCopy,
  InterestLines,
  ManifestoCopy,
} from './AboutCopy';
import CuriosityPhotoSequence from './CuriosityPhotoSequence';
import NestedPhotoFrame from './NestedPhotoFrame';
import PhotoFrame from './PhotoFrame';
import { useAboutCursor } from './useAboutCursor';
import { useAboutMotion } from './useAboutMotion';
import './about.css';

export default function AboutSection() {
  const rootRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  useAboutMotion(rootRef);
  useAboutCursor(rootRef, cursorRef);
  const photos = new Map(ABOUT_PHOTOS.map(photo => [photo.id, photo] as const));
  const photo = (id: PhotoId) => {
    const value = photos.get(id);
    if (!value) throw new Error(`Missing About photo slot: ${id}`);
    return value;
  };

  return (
    <>
      {createPortal(
        <div ref={cursorRef} className="about-cursor" aria-hidden="true">
          <div className="about-cursor__dot">
            <span className="about-cursor__label">MOMENT</span>
          </div>
        </div>,
        document.body,
      )}
      <section ref={rootRef} id="about" className="about" aria-labelledby="about-title">
      <div className="about-backdrop" aria-hidden="true" />
      <div className="about-stage">
        <SectionMarks />
        <div className="about-chapter" data-chapter="identity">
          <IdentityCopy />
          <div className="about-photo-group">
            <PhotoFrame photo={photo('photo-01')} />
          </div>
        </div>
        <div className="about-chapter" data-chapter="curiosity">
          <div className="about-photo-group about-photo-group--curiosity">
            <CuriosityPhotoSequence photos={photos} />
          </div>
        </div>
        <div className="about-chapter" data-chapter="growth">
          <GrowthCopy />
          <div className="about-photo-group">
            <PhotoFrame photo={photo('photo-08')} />
          </div>
        </div>
        <div className="about-chapter" data-chapter="momentum">
          <InterestLines />
          <div className="about-photo-group">
            <NestedPhotoFrame outer={photo('photo-09')} inner={photo('photo-10')} variant="closing" />
          </div>
          <ManifestoCopy />
        </div>
      </div>
      </section>
    </>
  );
}
