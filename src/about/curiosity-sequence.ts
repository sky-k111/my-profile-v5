import type { PhotoId } from './about-content';

export type CuriosityPhotoSequenceStep = {
  photoId: PhotoId;
  revealAt: number;
  transition: 'rise' | 'band' | 'wipe' | 'aperture';
  label: string;
  caption: string;
};

export type CuriosityRailMode = 'horizontal' | 'vertical';
export type VerticalRailDirection = 'up' | 'down';

export const CURIOSITY_RAIL_WINDOW = {
  start: 0.29,
  end: 0.59,
} as const;

export function getCuriosityTrackOffset(trackWidth: number, viewportWidth: number) {
  return Math.min(0, viewportWidth - trackWidth);
}

export function getCuriosityRailProgress(progress: number) {
  const normalized = (progress - CURIOSITY_RAIL_WINDOW.start) /
    (CURIOSITY_RAIL_WINDOW.end - CURIOSITY_RAIL_WINDOW.start);

  return Math.min(1, Math.max(0, normalized));
}

export function resolveCuriosityRailMode(
  viewportWidth: number,
  prefersReducedMotion: boolean,
): CuriosityRailMode {
  return viewportWidth >= 768 && !prefersReducedMotion ? 'horizontal' : 'vertical';
}

export function getVerticalRailMotion(direction: VerticalRailDirection) {
  return direction === 'up'
    ? { from: 30, to: -72 }
    : { from: -34, to: 68 };
}

export const CURIOSITY_PHOTO_SEQUENCE: readonly CuriosityPhotoSequenceStep[] = [
  {
    photoId: 'photo-04',
    revealAt: 0.205,
    transition: 'rise',
    label: 'OPEN AIR',
    caption: 'ROOM TO BREATHE.',
  },
  {
    photoId: 'photo-07',
    revealAt: 0.27,
    transition: 'band',
    label: 'EVERYDAY',
    caption: 'THE EVERYDAY, SEEN DIFFERENTLY.',
  },
  {
    photoId: 'photo-05',
    revealAt: 0.37,
    transition: 'wipe',
    label: 'RESONANCE',
    caption: 'MOVING WITH THE SOUND.',
  },
  {
    photoId: 'photo-06',
    revealAt: 0.47,
    transition: 'aperture',
    label: 'FOCUS',
    caption: 'STILL MAKING. STILL MOVING.',
  },
] as const;
