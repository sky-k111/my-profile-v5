const STORAGE_KEY = 'portfolio-complete-media-v1';

export function hasCompletedVisit(storage: Pick<Storage, 'getItem'> | null, signature: string): boolean {
  try { return !!signature && storage?.getItem(STORAGE_KEY) === signature; }
  catch { return false; }
}

export function recordCompletedVisit(storage: Pick<Storage, 'setItem'> | null, signature: string): void {
  if (!signature) return;
  try { storage?.setItem(STORAGE_KEY, signature); }
  catch { /* Private browsing or disabled storage still supports the first-visit opening. */ }
}
