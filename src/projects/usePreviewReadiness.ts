import { useEffect, useState, type RefObject } from 'react';
import { bufferedSecondsAhead } from '../lib/media-buffer';
import { hasPreviewBuffer } from '../lib/preview-readiness';

export default function usePreviewReadiness(videoRef: RefObject<HTMLVideoElement | null>, src?: string): boolean {
  const [prepared, setPrepared] = useState<{ src?: string; ready: boolean }>({ src, ready: false });
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    const sync = () => {
      if (video.error || video.readyState < 2 || video.currentSrc !== video.src) return;
      const ranges: [number, number][] = [];
      for (let index = 0; index < video.buffered.length; index += 1) ranges.push([video.buffered.start(index), video.buffered.end(index)]);
      if (!hasPreviewBuffer(video.duration, bufferedSecondsAhead(0, ranges))) return;
      setPrepared(previous => previous.src === src && previous.ready ? previous : { src, ready: true });
    };
    const events = ['progress', 'loadeddata', 'loadedmetadata', 'durationchange', 'canplay', 'canplaythrough'];
    events.forEach(event => video.addEventListener(event, sync));
    sync();
    return () => events.forEach(event => video.removeEventListener(event, sync));
  }, [src, videoRef]);
  // A loop or a brief playback wait does not invalidate an already prepared source.
  return !!src && prepared.src === src && prepared.ready;
}
