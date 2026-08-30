import type { AboutPhoto } from './about-content';
import PhotoFrame from './PhotoFrame';

type NestedPhotoFrameProps = {
  outer: AboutPhoto;
  inner: AboutPhoto;
  variant: 'opening' | 'curiosity' | 'closing';
};

export default function NestedPhotoFrame({ outer, inner, variant }: NestedPhotoFrameProps) {
  return (
    <div className={`about-photo-nest about-photo-nest--${variant}`} data-photo-nest={variant}>
      <PhotoFrame photo={outer} className="about-photo-nest__outer" />
      <div className="about-photo-nest__inner">
        <PhotoFrame photo={inner} />
      </div>
    </div>
  );
}
