export type AboutMotionMode = 'full' | 'compact' | 'static';

export const ABOUT_CLOSING_HOLD_DURATION = 0.06;
export const ABOUT_TIMELINE_END = 1;
export const ABOUT_MOTION_SECTION_VH = 590;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function resolveAboutMotionMode(
  width: number,
  reducedMotion: boolean,
  finePointer: boolean,
): AboutMotionMode {
  if (reducedMotion || width < 768) return 'static';
  if (width < 1024 || !finePointer) return 'compact';
  return 'full';
}
