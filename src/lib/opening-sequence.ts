export const OPENING_SEQUENCE_DURATION_MS = 6_000;

export type OpeningFrame = {
  spread: number;
  slashReveal: number;
  nameReveal: number;
  mediaReveal: number;
  cameraScale: number;
  handoff: number;
  prepareHeroEffects: boolean;
};

export type OpeningNameTreatment = {
  tone: number;
  alpha: number;
  blurPx: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp01((value - start) / (end - start || 1));
  return progress * progress * (3 - 2 * progress);
};

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

export function resolveNameTreatment(mediaReveal: number): OpeningNameTreatment {
  const progress = clamp01(mediaReveal);

  return {
    tone: Math.round(mix(23, 244, progress)),
    alpha: Number(mix(1, 0.46, progress).toFixed(3)),
    blurPx: Number(mix(0, 0.35, progress).toFixed(3)),
  };
}

export function resolveOpeningFrame(elapsedMs: number): OpeningFrame {
  const mediaReveal = smoothstep(3_000, 5_100, elapsedMs);

  return {
    spread: smoothstep(1_350, 3_600, elapsedMs),
    slashReveal: smoothstep(1_450, 2_150, elapsedMs),
    nameReveal: smoothstep(1_900, 2_800, elapsedMs),
    mediaReveal,
    cameraScale: mix(1.14, 1, mediaReveal),
    handoff: smoothstep(5_300, OPENING_SEQUENCE_DURATION_MS, elapsedMs),
    prepareHeroEffects: elapsedMs >= 250,
  };
}

type OpeningPlayback = {
  shouldPlay: boolean;
  durationMs: number;
};

export function resolveOpeningPlayback(reducedMotion: boolean, _hash: string): OpeningPlayback {
  const shouldPlay = !reducedMotion;

  return {
    shouldPlay,
    durationMs: shouldPlay ? OPENING_SEQUENCE_DURATION_MS : 0,
  };
}
