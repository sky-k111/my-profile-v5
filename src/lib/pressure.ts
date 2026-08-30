export function pressureValue(distance: number, maxDistance: number, minValue: number, maxValue: number) {
  const progress = Math.min(Math.max(distance / Math.max(maxDistance, 1), 0), 1);
  return minValue + (maxValue - minValue) * (1 - progress);
}

export const HERO_NAME_FONT = "'Cormorant Garamond Variable', Georgia, serif";
export const HERO_NAME_FONT_QUERY = "400 1em 'Cormorant Garamond Variable'";

export function getHeroNameStyle(fontReady: boolean) {
  return {
    fontFamily: HERO_NAME_FONT,
    opacity: fontReady ? 1 : 0,
  };
}

export function getHeroPressureVariation(distance: number, maxDistance: number) {
  const weight = Math.round(pressureValue(distance, maxDistance, 300, 700));
  return `'wght' ${weight}`;
}

export function getHeroPressureTransform(distance: number, maxDistance: number) {
  const influence = pressureValue(distance, maxDistance, 0, 1);
  const scaleX = 0.96 + influence * 0.22;
  const scaleY = 1 + influence * 0.08;
  const lift = influence * -0.025;
  return `scaleX(${scaleX.toFixed(3)}) scaleY(${scaleY.toFixed(3)}) translateY(${lift.toFixed(3)}em)`;
}
