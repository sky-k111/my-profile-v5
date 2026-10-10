import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { ProjectFilmMedia } from './ProjectFilm';
import MediaLoading from './MediaLoading';
import useMediaLoading from './useMediaLoading';
import useFilmBuffer from './useFilmBuffer';
import { projectMediaSource } from './project-media-source';

function formatTime(seconds: number) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export default function ProjectFilmPlayer({ videoRef, onError, title, film, idPrefix }: {
  videoRef: RefObject<HTMLVideoElement | null>;
  onError: () => void;
  title: string;
  film: ProjectFilmMedia;
  idPrefix: string;
}) {
  const playerRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const frameLoading = useMediaLoading(videoRef, projectMediaSource(film.src));
  const { buffering, cancelResume } = useFilmBuffer(videoRef);
  const loading = frameLoading || buffering;

  useEffect(() => {
    const syncFullscreen = () => {
      const isFullscreen = document.fullscreenElement === playerRef.current;
      setFullscreen(isFullscreen);
      if (!isFullscreen && fullscreenScrollRef.current !== null) {
        window.scrollTo({ top: fullscreenScrollRef.current, behavior: 'instant' });
        fullscreenScrollRef.current = null;
      }
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const setVideoVolume = (percent: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(100, Math.max(0, percent)) / 100;
    video.muted = false;
    setVolume(Math.round(video.volume * 100));
    setMuted(false);
  };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    cancelResume();
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      if (video.volume === 0) video.volume = .5;
      video.muted = false;
    } else video.muted = true;
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement === playerRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    } else if (playerRef.current?.requestFullscreen) {
      fullscreenScrollRef.current = window.scrollY;
      void playerRef.current.requestFullscreen().catch(() => {
        fullscreenScrollRef.current = null;
      });
    } else {
      const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      video?.webkitEnterFullscreen?.();
    }
  };
  const effectiveVolume = muted ? 0 : volume;
  const isSilent = muted || volume === 0;

  return (
    <div ref={playerRef} className="project-film-player">
      <div className="project-film-player__screen" aria-busy={loading}>
      <video
        ref={videoRef}
        className="project-film-dialog__video"
        src={projectMediaSource(film.src)}
        poster={projectMediaSource(film.poster)}
        playsInline
        preload="auto"
        aria-label={`${title} complete project film`}
        onClick={togglePlayback}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onEnded={() => setPaused(true)}
        onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={event => {
          const length = event.currentTarget.duration;
          setDuration(Number.isFinite(length) ? length : 0);
        }}
        onVolumeChange={event => {
          setVolume(Math.round(event.currentTarget.volume * 100));
          setMuted(event.currentTarget.muted);
        }}
        onError={onError}
      />
      {loading ? <MediaLoading label={`Loading ${title} film`} /> : null}
      </div>
      <div className="project-film-player__controls" role="group" aria-label="Video controls">
        <button className="project-film-player__button" type="button" aria-label={paused ? 'Play' : 'Pause'} onClick={togglePlayback}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {paused ? <path d="m8 5 11 7-11 7Z" /> : <path d="M6 5h4v14H6ZM14 5h4v14h-4Z" />}
          </svg>
        </button>
        <span className="project-film-player__time">{formatTime(time)} / {formatTime(duration)}</span>
        <input
          className="project-film-player__seek"
          type="range"
          min={0}
          max={duration || 1}
          step={.1}
          value={Math.min(time, duration || 1)}
          disabled={!duration}
          aria-label="Video progress"
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          onChange={event => {
            const nextTime = Number(event.currentTarget.value);
            if (videoRef.current) videoRef.current.currentTime = nextTime;
            setTime(nextTime);
          }}
        />
        <div
          className="project-film-player__volume"
          onPointerEnter={event => {
            if (event.pointerType === 'mouse') setVolumeOpen(true);
          }}
          onPointerLeave={event => {
            if (!event.currentTarget.contains(document.activeElement)) setVolumeOpen(false);
          }}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setVolumeOpen(false);
          }}
        >
          <button
            className="project-film-player__button"
            type="button"
            aria-label="Volume"
            aria-expanded={volumeOpen}
            aria-controls={volumeOpen ? `${idPrefix}-volume` : undefined}
            onClick={() => setVolumeOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 9h4l5-4v14l-5-4H3Z" />
              {isSilent ? <path className="project-film-player__stroke" d="m16 9 5 6m0-6-5 6" /> : <path className="project-film-player__stroke" d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />}
            </svg>
          </button>
          {volumeOpen && (
            <div className="project-film-player__volume-panel" id={`${idPrefix}-volume`}>
              <output className="project-film-player__volume-value" htmlFor={`${idPrefix}-volume-range`}>{effectiveVolume}%</output>
              <input
                id={`${idPrefix}-volume-range`}
                className="project-film-player__volume-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={effectiveVolume}
                aria-label="Volume level"
                aria-orientation="vertical"
                aria-valuetext={`${effectiveVolume}%`}
                style={{ '--volume-fill': `${effectiveVolume}%` } as CSSProperties}
                onChange={event => setVideoVolume(Number(event.currentTarget.value))}
                onKeyDown={event => {
                  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    setVideoVolume(effectiveVolume + (event.key === 'ArrowUp' ? 5 : -5));
                  }
                }}
              />
              <button className="project-film-player__mute" type="button" onClick={toggleMute} aria-label={isSilent ? 'Unmute' : 'Mute'}>
                {isSilent ? 'Unmute' : 'Mute'}
              </button>
            </div>
          )}
        </div>
        <button className="project-film-player__button" type="button" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path className="project-film-player__stroke" d={fullscreen ? 'M9 3v6H3m12-6v6h6M9 21v-6H3m12 6v-6h6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'} />
          </svg>
        </button>
      </div>
    </div>
  );
}
