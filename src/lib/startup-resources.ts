import { prepareImage } from './prepared-images.ts';
import { recordCompletedVisit } from './startup-visit.ts';

export type StartupAsset = { url: string; bytes: number; revision?: string };
export type StartupProgress = { loaded: number; total: number; ready: boolean; error: string | null };

const videoSources = new Map<string, string>();
const completed = new Set<string>();
let pending: Promise<'cached' | 'loaded'> | undefined;

export function preparedMediaSource(url: string): string {
  return videoSources.get(url) ?? url;
}

export function startupProgress(loaded: number, total: number, ready: boolean): number {
  return ready ? 1 : Math.min(0.99, Math.max(0, loaded / Math.max(1, total)));
}

/** Keep complete video blobs alive for this visit, including modal films and later projects. */
export function prepareStartupResources(report: (state: StartupProgress) => void, cacheSignature = ''): Promise<'cached' | 'loaded'> {
  if (pending) return pending;
  pending = (async () => {
    let total = 0;
    const received = new Map<string, number>();
    const publish = (ready = false, error: string | null = null) => report({
      loaded: [...received.values()].reduce((sum, bytes) => sum + bytes, 0), total, ready, error,
    });
    try {
      const manifestResponse = await fetch('/startup-manifest.json', { cache: 'no-cache', signal: AbortSignal.timeout(30000) });
      if (!manifestResponse.ok) throw new Error('资源清单暂时无法加载');
      const assets: StartupAsset[] = await manifestResponse.json();
      if (!Array.isArray(assets) || !assets.length || assets.some(asset => !asset.url?.startsWith('/') || !(asset.bytes > 0))) {
        throw new Error('资源清单无效，请重试');
      }
      total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
      // Cache Storage retains complete responses across reloads, including large
      // films which browsers may evict from their ordinary HTTP cache.
      const cache = typeof caches === 'undefined' ? undefined : await caches.open('portfolio-resources-v1').catch(() => undefined);
      const cacheKey = (asset: StartupAsset) => `${asset.url}?portfolio-revision=${asset.revision}`;
      const finish = async () => {
        await import('../components/PixelBlast');
        await document.fonts.load("400 1em 'Cormorant Garamond Variable'", 'YIKAI CHEN');
        await document.fonts.ready;
        recordCompletedVisit(window.localStorage ?? null, cacheSignature);
        publish(true);
      };
      // An older visit may have filled Cache Storage before it recorded a
      // persistent completion marker. Its versioned public assets are enough
      // to skip a second full read; the current JS bundle is already running.
      if (cache && cacheSignature) {
        const keys = await cache.keys().catch(() => []);
        const available = new Set(keys.map(key => key.url));
        const publicAssets = assets.filter(asset => !asset.url.startsWith('/assets/'));
        if (publicAssets.length && publicAssets.every(asset =>
          !!asset.revision && available.has(new URL(cacheKey(asset), location.origin).href))) {
          await Promise.all(['/portrait.png', '/racing-suit.png'].map(prepareImage));
          await finish();
          return 'cached';
        }
      }
      for (const asset of assets) if (completed.has(asset.url)) received.set(asset.url, asset.bytes);
      publish();
      let cursor = 0;
      let failure: unknown;
      const worker = async () => {
        while (cursor < assets.length && !failure) {
          const asset = assets[cursor++];
          if (completed.has(asset.url)) continue;
          const controller = new AbortController();
          let timer = window.setTimeout(() => controller.abort(), 45000);
          try {
            const cached = asset.revision ? await cache?.match(cacheKey(asset)).catch(() => undefined) : undefined;
            const response = cached ?? await fetch(asset.url, { signal: controller.signal });
            if (!response.ok || !response.body) throw new Error(`资源加载失败：${asset.url.split('/').pop()}`);
            const video = /\.(mp4|webm)$/i.test(asset.url);
            const cacheCopy = !cached && cache && asset.revision ? response.clone() : undefined;
            const chunks: BlobPart[] = [];
            const reader = response.body.getReader();
            let bytes = 0;
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              window.clearTimeout(timer);
              timer = window.setTimeout(() => controller.abort(), 45000);
              bytes += value.byteLength;
              if (video) chunks.push(value);
              received.set(asset.url, Math.min(bytes, asset.bytes));
              publish();
            }
            if (bytes !== asset.bytes) {
              if (cached) await cache?.delete(cacheKey(asset)).catch(() => false);
              throw new Error(`资源不完整：${asset.url.split('/').pop()}`);
            }
            if (video) {
              videoSources.set(asset.url, URL.createObjectURL(new Blob(chunks, { type: video && /\.webm$/i.test(asset.url) ? 'video/webm' : 'video/mp4' })));
            } else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(asset.url)) {
              if (['/portrait.png', '/racing-suit.png'].includes(asset.url)) {
                await prepareImage(asset.url);
              } else {
                const image = new Image();
                image.src = asset.url;
                await image.decode();
              }
            }
            if (cacheCopy) {
              await cache!.put(cacheKey(asset), cacheCopy).catch(() => undefined);
            }
            completed.add(asset.url);
            received.set(asset.url, asset.bytes);
          } catch (error) { failure = error; }
          finally { window.clearTimeout(timer); }
        }
      };
      await Promise.all(Array.from({ length: 4 }, worker));
      if (failure) throw failure;
      if (cache) {
        const currentKeys = new Set(assets.filter(asset => asset.revision).map(asset => new URL(cacheKey(asset), location.origin).href));
        const keys = await cache.keys().catch(() => []);
        await Promise.all(keys.filter(key => !currentKeys.has(key.url)).map(key => cache.delete(key).catch(() => false)));
      }
      await finish();
      return 'loaded';
    } catch (error) {
      publish(false, error instanceof Error && error.name !== 'AbortError' ? error.message : '连接暂时中断，请重试');
      throw error;
    }
  })().finally(() => { pending = undefined; });
  return pending;
}
