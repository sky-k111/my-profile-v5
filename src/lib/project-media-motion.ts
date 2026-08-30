type ProjectMediaItemRollInput = {
  itemIndex: number;
  itemTop: number;
  viewportHeight: number;
  travel: number;
  galleryProgress: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const HOMEPAGE_MEDIA_COUNT = 5;
const OVERFLOW_TRAVEL_START = .72;

export function resolveProjectMediaReferenceTravel(travel: number, itemCount: number, itemPitch: number) {
  const safeTravel = Math.max(0, travel);
  const safeCount = Math.max(0, itemCount);
  const safePitch = Math.max(0, itemPitch);
  return Math.max(0, safeTravel + (HOMEPAGE_MEDIA_COUNT - safeCount) * safePitch);
}

export function resolveProjectMediaGalleryOffset(travel: number, referenceTravel: number, progress: number) {
  const safeTravel = Math.max(0, travel);
  const safeReference = Math.max(0, referenceTravel);
  const safeProgress = clamp01(progress);
  const homepagePacedOffset = safeReference * safeProgress;

  if (safeTravel <= safeReference) return Math.min(safeTravel, homepagePacedOffset);

  const overflowProgress = clamp01((safeProgress - OVERFLOW_TRAVEL_START) / (1 - OVERFLOW_TRAVEL_START));
  const easedOverflow = overflowProgress * overflowProgress * (3 - 2 * overflowProgress);
  return Math.min(safeTravel, homepagePacedOffset + (safeTravel - safeReference) * easedOverflow);
}

export function resolveProjectMediaRollFromViewportTop(visualTop: number, viewportHeight: number) {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return visualTop <= 0 ? 1 : 0;
  return clamp01((viewportHeight - visualTop) / (viewportHeight * .5));
}

export function usesProjectMediaRoll(itemIndex: number) {
  return itemIndex >= 0 && itemIndex < 2;
}

export function resolveProjectMediaLeadRollDuration(travelDuration: number) {
  return Math.max(0, travelDuration) * .5;
}

export function resolveProjectMediaItemRoll({
  itemIndex,
  itemTop,
  viewportHeight,
  travel,
  galleryProgress,
}: ProjectMediaItemRollInput) {
  if (itemIndex <= 0) return 1;
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return galleryProgress >= 1 ? 1 : 0;

  const visualTop = itemTop - Math.max(0, travel) * clamp01(galleryProgress);
  return resolveProjectMediaRollFromViewportTop(visualTop, viewportHeight);
}

export function resolveProjectMediaCurl(progress: number) {
  return Math.pow(1 - clamp01(progress), .62);
}

export function resolveProjectMediaHorizontalSmear(stripIndex: number, intensity: number, width: number, phase = 0) {
  const amount = clamp01(intensity);
  if (amount === 0 || width <= 0) return { offsetX: 0, stretchX: 0 };

  const row = Math.max(0, stripIndex);
  const time = Number.isFinite(phase) ? phase : 0;
  const broad = Math.sin(row * .105 + time * 1.9);
  const middle = Math.sin(row * .39 - time * 2.7);
  const drift = Math.sin(row * .025 + time * .7);
  const grain = Math.sin(row * 1.73 + time * 4.1);
  const wave = broad * .55 + middle * .2 + drift * .25;
  const tornWave = Math.sign(wave) * Math.pow(Math.abs(wave), 1.35) + grain * .08;

  return {
    offsetX: tornWave * width * .052 * amount,
    stretchX: (Math.abs(tornWave) * .31 + Math.max(0, broad) ** 2 * .08) * width * amount,
  };
}

export function resolveProjectMediaDistortion(progress: number) {
  const settle = 1 - clamp01(progress);

  return {
    smear: Math.pow(settle, 1.35),
    canvasAlpha: settle > 0 ? 1 : 0,
  };
}
