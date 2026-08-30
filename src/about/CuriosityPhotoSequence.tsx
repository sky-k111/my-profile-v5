import type { AboutPhoto, PhotoId } from './about-content';
import { CURIOSITY_PHOTO_SEQUENCE } from './curiosity-sequence';
import { BiographyCopy, CuriosityKineticCopy } from './AboutCopy';
import PhotoFrame from './PhotoFrame';

type CuriosityPhotoSequenceProps = {
  photos: ReadonlyMap<PhotoId, AboutPhoto>;
};

export default function CuriosityPhotoSequence({ photos }: CuriosityPhotoSequenceProps) {
  const photoFor = (photoId: PhotoId) => {
    const photo = photos.get(photoId);
    if (!photo) throw new Error(`Missing curiosity sequence photo: ${photoId}`);
    return photo;
  };

  const renderPhoto = (index: number) => {
    const step = CURIOSITY_PHOTO_SEQUENCE[index];

    return (
      <div
        className={`about-curiosity-shot about-curiosity-shot--${step.photoId}`}
        data-sequence-step={index}
        data-sequence-photo={step.photoId}
        data-sequence-transition={step.transition}
      >
        <PhotoFrame photo={photoFor(step.photoId)} className="about-curiosity-shot__photo" />
        <span className="about-curiosity-shot__reveal" aria-hidden="true" />
        <div
          className="about-curiosity-shot__caption"
          data-sequence-caption={step.photoId}
          aria-hidden="true"
        >
          <span>{step.label}</span>
          <span>{step.caption}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="about-curiosity-viewport"
      data-photo-sequence="all"
      data-curiosity-viewport
    >
      <CuriosityKineticCopy />
      <div className="about-curiosity-track" data-curiosity-track>
        <section className="about-curiosity-canvas" aria-label="Personal moments in motion">
          <div
            className="about-curiosity-vertical-word about-curiosity-vertical-word--moments"
            data-vertical-word="moments"
            aria-hidden="true"
          >
            <span>MOMENTS</span>
            <i className="about-curiosity-asterisk" />
          </div>

          {renderPhoto(0)}
          {renderPhoto(1)}
          <p className="about-copy about-curiosity-bridge" lang="en" aria-hidden="true">
            <span>LISTEN.</span>
            <span>MAKE.</span>
            <span>MOVE.</span>
          </p>

          {renderPhoto(2)}
          {renderPhoto(3)}

          <div
            className="about-curiosity-vertical-word about-curiosity-vertical-word--motion"
            data-vertical-word="motion"
            aria-hidden="true"
          >
            <span>IN MOTION</span>
            <i className="about-curiosity-asterisk" />
          </div>

          <BiographyCopy />
          <p className="about-copy about-curiosity-closing-copy" lang="en">
            Curiosity keeps the frame open.
          </p>
        </section>
      </div>
    </div>
  );
}
