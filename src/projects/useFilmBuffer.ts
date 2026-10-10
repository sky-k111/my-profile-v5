import { useEffect, useRef, useState, type RefObject } from 'react';
import { bufferedSecondsAhead, hasFilmStartBuffer } from '../lib/media-buffer';

export default function useFilmBuffer(videoRef: RefObject<HTMLVideoElement | null>) {
  const [buffering, setBuffering] = useState(true);
  const shouldResume = useRef(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    shouldResume.current = true;
    const tryResume = () => {
      if (!shouldResume.current || video.error || video.readyState < 2) return;
      const ranges: [number, number][] = [];
      for (let index = 0; index < video.buffered.length; index += 1) {
        ranges.push([video.buffered.start(index), video.buffered.end(index)]);
      }
      if (!hasFilmStartBuffer(video.currentTime, video.duration, bufferedSecondsAhead(video.currentTime, ranges))) return;
      shouldResume.current = false;
      setBuffering(false);
      void video.play().catch(() => setBuffering(false));
    };
    const waitForBuffer = () => {
      if (video.paused || video.ended) return;
      shouldResume.current = true;
      setBuffering(true);
      video.pause();
      tryResume();
    };
    const events = ['progress', 'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough', 'seeked'];
    events.forEach(event => video.addEventListener(event, tryResume));
    video.addEventListener('waiting', waitForBuffer);
    tryResume();
    return () => {
      shouldResume.current = false;
      events.forEach(event => video.removeEventListener(event, tryResume));
      video.removeEventListener('waiting', waitForBuffer);
    };
  }, [videoRef]);

  const cancelResume = () => {
    shouldResume.current = false;
    setBuffering(false);
  };
  return { buffering, cancelResume };
}
