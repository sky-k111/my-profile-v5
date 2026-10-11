export type PreviewReadiness = { ready: boolean };
export type GalleryReadiness = {
  projectId: string;
  items: Record<number, PreviewReadiness>;
  revealed: boolean;
};

export function hasPreviewBuffer(duration: number, bufferedSeconds: number): boolean {
  if (!Number.isFinite(duration) || duration <= 0) return false;
  return bufferedSeconds >= duration - .1;
}

export function hasPreparedPreviewFrame(src: string, readyState: number, duration: number, bufferedSeconds: number): boolean {
  if (readyState < 2) return false;
  // Startup has already read every byte of a Blob URL. Waiting for the
  // browser to mark its whole timeline buffered needlessly holds the gallery.
  return src.startsWith('blob:') || hasPreviewBuffer(duration, bufferedSeconds);
}

export function updateGalleryReadiness(previous: GalleryReadiness, projectId: string, count: number, index: number, item: PreviewReadiness): GalleryReadiness {
  const current = previous.projectId === projectId ? previous : { projectId, items: {}, revealed: false };
  const previousItem = current.items[index];
  if (previousItem?.ready === item.ready) return current;
  const items = { ...current.items, [index]: item };
  const prepared = Object.keys(items).length === count && Object.values(items).every(value => value.ready);
  return { projectId, items, revealed: current.revealed || prepared };
}
