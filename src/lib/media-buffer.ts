export function bufferedSecondsAhead(currentTime: number, ranges: readonly (readonly [number, number])[]): number {
  for (const [start, end] of ranges) {
    if (currentTime >= start && currentTime <= end) return Math.max(0, end - currentTime);
  }
  return 0;
}

export function hasFilmStartBuffer(currentTime: number, duration: number, bufferedSeconds: number): boolean {
  if (!Number.isFinite(duration) || duration <= 0) return false;
  return bufferedSeconds >= Math.min(8, Math.max(0, duration - currentTime)) - .1;
}
