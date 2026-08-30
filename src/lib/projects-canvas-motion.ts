const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function seeded(seed: number) {
  const next = Math.sin(seed * 999.31) * 15331.78;
  return next - Math.floor(next);
}

export function resolveProjectsCanvasDispersal(seed: number, progress: number, width: number, height: number) {
  const amount = clamp01(progress);
  if (amount === 0) return { offsetX: 0, offsetY: 0, scaleX: 1, opacity: 1 };

  const delay = seeded(seed + 211) * .22;
  const local = clamp01((amount - delay) / (1 - delay));
  const eased = local * local * (3 - 2 * local);
  const directionX = seeded(seed + 223) > .5 ? 1 : -1;
  const directionY = seeded(seed + 227) > .5 ? 1 : -1;
  const distanceX = Math.max(0, width) * (.18 + seeded(seed + 229) * .34);
  const distanceY = Math.max(0, height) * (.04 + seeded(seed + 233) * .12);

  return {
    offsetX: directionX * distanceX * eased,
    offsetY: directionY * distanceY * eased,
    scaleX: 1 - eased * (.72 + seeded(seed + 239) * .16),
    opacity: 1 - eased,
  };
}
