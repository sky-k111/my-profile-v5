import { useEffect, useState, type RefObject } from 'react';
import { resolveMediaLoading, type MediaLoadingEvent } from '../lib/media-loading';

export default function useMediaLoading(videoRef: RefObject<HTMLVideoElement | null>, src?: string) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const sync = (event: Event) => setLoading(current => resolveMediaLoading(video.readyState, event.type as MediaLoadingEvent, !!video.error, current));
    const events: MediaLoadingEvent[] = ['loadstart', 'emptied', 'waiting', 'stalled', 'seeking', 'loadeddata', 'canplay', 'playing', 'seeked', 'error'];
    events.forEach(event => video.addEventListener(event, sync));
    setLoading(!src || resolveMediaLoading(video.readyState, 'initial', !!video.error));
    return () => events.forEach(event => video.removeEventListener(event, sync));
  }, [src, videoRef]);

  return loading;
}
