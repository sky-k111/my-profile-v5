/// <reference types="vite/client" />

declare module 'virtual:project-media-sources' {
  const sources: Record<string, string>;
  export default sources;
}

declare module 'virtual:startup-cache-key' {
  const cacheKey: string;
  export default cacheKey;
}
