import sources from 'virtual:project-media-sources';
import { preparedMediaSource } from '../lib/startup-resources';

export function projectMediaSource(src: string): string {
  return preparedMediaSource(sources[src] ?? src);
}
