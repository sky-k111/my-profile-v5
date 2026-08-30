export function getRevealOpacity(elapsedMs: number, holdMs = 1500, fadeMs = 700) {
  if (elapsedMs <= holdMs) return 1;

  const progress = Math.min(1, (elapsedMs - holdMs) / fadeMs);
  return (1 - progress) ** 2;
}
