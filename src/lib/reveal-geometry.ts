export function getAutoStrokeStep(
  brushRadius: number,
  brushBleed: number,
  minimumStep = 1,
) {
  return Math.max(1, minimumStep, brushRadius + brushBleed);
}

export function getAutoStrokeBands() {
  return [
    { yFrac: 0.18, amp: 0.04 },
    { yFrac: 0.30, amp: 0.07 },
    { yFrac: 0.42, amp: 0.09 },
    { yFrac: 0.55, amp: 0.10 },
    { yFrac: 0.62, amp: 0.025 },
    { yFrac: 0.68, amp: 0.08 },
    { yFrac: 0.80, amp: 0.04 },
  ];
}

export function getBrushTextureMetrics(
  brushRadius: number,
  brushBleed: number,
  dpr: number,
) {
  const cssSize = Math.ceil((brushRadius + brushBleed) * 2);
  return {
    cssSize,
    pixelSize: Math.max(1, Math.ceil(cssSize * dpr)),
  };
}

export function getNewStrokeStepIndices(previousStep: number, nextStep: number) {
  const indices: number[] = [];
  for (let step = Math.max(0, previousStep + 1); step <= nextStep; step++) {
    indices.push(step);
  }
  return indices;
}

export function getAutoStrokePoint(
  progress: number,
  startX: number,
  endX: number,
  baseY: number,
  amplitude: number,
) {
  const t = Math.min(1, Math.max(0, progress));
  return {
    x: startX + (endX - startX) * t,
    y: baseY + Math.sin(t * Math.PI * 2.5) * amplitude,
  };
}
