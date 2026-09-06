export const OPENING_SEQUENCE_DURATION_MS = 7_200;

export const OPENING_LABEL = 'YIKAI CHEN';
export const OPENING_LETTERS = 'YIKAICHEN';

export const OPENING_GLYPH_REVEAL_ORDER = [0, 5, 1, 7, 3, 8, 2, 6, 4] as const;
export const OPENING_GLYPH_EXIT_ORDER = [6, 2, 7, 4, 0, 8, 3, 5, 1] as const;
export const OPENING_C_EXIT_DELAY_MS = 260;

export type OpeningFrame = {
  counter: number;
  progress: number;
  counterEntrance: number;
  counterOpacity: number;
  markOpacity: number;
  interfaceOpacity: number;
  curtain: number;
  prepareHeroEffects: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp01((value - start) / (end - start || 1));
  return progress * progress * (3 - 2 * progress);
};

const LOAD_STOPS = [
  [0, 0],
  [420, 0.08],
  [850, 0.19],
  [1_350, 0.36],
  [1_850, 0.54],
  [2_300, 0.72],
  [2_680, 0.87],
  [2_980, 0.96],
  [3_250, 1],
] as const;

export function resolveOpeningProgress(elapsedMs: number) {
  if (elapsedMs <= LOAD_STOPS[0][0]) return 0;

  for (let index = 1; index < LOAD_STOPS.length; index += 1) {
    const [endTime, endValue] = LOAD_STOPS[index];
    const [startTime, startValue] = LOAD_STOPS[index - 1];
    if (elapsedMs <= endTime) {
      const progress = smoothstep(startTime, endTime, elapsedMs);
      return startValue + (endValue - startValue) * progress;
    }
  }

  return 1;
}

function flicker(progress: number, elapsedMs: number, index: number) {
  const pulse = Math.sin(elapsedMs * 0.047 + index * 2.31);
  const gate = pulse > 0.12 ? 1 : 0.16;
  return Math.max(progress * 0.2, progress * gate);
}

export function resolveOpeningGlyphOpacity(elapsedMs: number, index: number) {
  const revealRank = OPENING_GLYPH_REVEAL_ORDER[index] ?? index;
  const revealStart = 180 + revealRank * 72;
  const revealEnd = revealStart + 620;
  const revealProgress = smoothstep(revealStart, revealEnd, elapsedMs);
  const revealed = elapsedMs < revealEnd
    ? flicker(revealProgress, elapsedMs, index)
    : 1;

  const exitRank = OPENING_GLYPH_EXIT_ORDER[index] ?? index;
  const exitDelay = index === 5 ? OPENING_C_EXIT_DELAY_MS : 0;
  const exitStart = 4_180 + exitRank * 64 + exitDelay;
  const exitEnd = exitStart + 430;
  if (elapsedMs <= exitStart) return revealed;

  const exitProgress = smoothstep(exitStart, exitEnd, elapsedMs);
  const remaining = 1 - exitProgress;
  return elapsedMs < exitEnd
    ? Math.min(revealed, flicker(remaining, elapsedMs, index + 13))
    : 0;
}

export function resolveOpeningFrame(elapsedMs: number): OpeningFrame {
  const progress = resolveOpeningProgress(elapsedMs);
  const counterExit = smoothstep(4_420, 5_160, elapsedMs);
  const markReveal = smoothstep(380, 1_220, elapsedMs);
  const markExit = smoothstep(5_500, 5_950, elapsedMs);
  const interfaceReveal = smoothstep(260, 1_080, elapsedMs);
  const interfaceExit = smoothstep(4_440, 5_240, elapsedMs);
  const curtain = smoothstep(6_000, 7_050, elapsedMs);

  return {
    counter: Math.round(progress * 100),
    progress,
    counterEntrance: smoothstep(120, 820, elapsedMs),
    counterOpacity: smoothstep(120, 720, elapsedMs) * (1 - counterExit),
    markOpacity: markReveal * (1 - markExit),
    interfaceOpacity: interfaceReveal * (1 - interfaceExit),
    curtain,
    prepareHeroEffects: elapsedMs >= 5_050,
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
