export type MediaLoadingEvent = 'loadstart' | 'emptied' | 'waiting' | 'stalled' | 'seeking' | 'loadeddata' | 'canplay' | 'playing' | 'seeked' | 'error' | 'initial';

// Metadata alone cannot produce a frame; a stalled download may still have playable data.
export function resolveMediaLoading(readyState: number, event: MediaLoadingEvent, hasError = false, wasLoading = false): boolean {
  if (hasError || event === 'error' || event === 'loadstart' || event === 'emptied' || event === 'waiting') return true;
  if (event === 'seeking') return readyState < 3;
  if (event === 'stalled' && readyState >= 2) return wasLoading;
  return readyState < 2;
}
