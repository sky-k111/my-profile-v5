import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import './project-film.css';
import ProjectFilmPlayer from './ProjectFilmPlayer';
import { projectMediaSource } from './project-media-source';

const LABEL = 'Watch the film';

export type ProjectFilmMedia = {
  src: string;
  poster: string;
  durationSeconds: number;
  aspectRatio: number;
};

export default function ProjectFilm({ projectId, title, film }: {
  projectId: string;
  title: string;
  film: ProjectFilmMedia;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropPressRef = useRef(false);
  const idPrefix = `${projectId}-film`;
  const minutes = Math.floor(film.durationSeconds / 60);
  const seconds = Math.floor(film.durationSeconds % 60);

  // Lock the page and enter the top layer before the opening frame is painted.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    const previousFocus = document.activeElement;

    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.setAttribute('data-project-film-open', '');
    window.dispatchEvent(new Event('projects-film-state'));
    dialog.showModal();

    return () => {
      video.pause();
      dialog.close();
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      root.style.scrollbarGutter = previousGutter;
      root.removeAttribute('data-project-film-open');
      window.dispatchEvent(new Event('projects-film-state'));
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="project-film-link"
        type="button"
        aria-label={`Watch the ${title} film, ${minutes} minutes ${seconds} seconds`}
        aria-haspopup="dialog"
        aria-controls={isOpen ? `${idPrefix}-dialog` : undefined}
        onClick={() => {
          setHasError(false);
          setIsOpen(true);
        }}
      >
        <span className="project-film-link__play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m9 6 9 6-9 6Z" /></svg>
        </span>
        <span className="project-film-link__copy">
          <span className="project-film-link__label" aria-hidden="true">
            {Array.from(LABEL).map((letter, index) => (
              <span
                className="project-film-link__letter"
                style={{ '--film-letter-index': index } as CSSProperties}
                key={index}
              >
                <span>{letter === ' ' ? '\u00a0' : letter}</span>
                <span>{letter === ' ' ? '\u00a0' : letter}</span>
              </span>
            ))}
          </span>
          <span className="project-film-link__duration" aria-hidden="true">{minutes}:{String(seconds).padStart(2, '0')}</span>
        </span>
      </button>

      {isOpen && createPortal(
        <dialog
          ref={dialogRef}
          id={`${idPrefix}-dialog`}
          className="project-film-dialog"
          aria-labelledby={`${idPrefix}-title`}
          onClose={() => {
            if (!dialogRef.current?.open) setIsOpen(false);
          }}
          onPointerDown={event => {
            backdropPressRef.current = event.target === event.currentTarget;
          }}
          onClick={event => {
            if (backdropPressRef.current && event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div className="project-film-dialog__panel" style={{ '--film-aspect-ratio': film.aspectRatio } as CSSProperties}>
            <header className="project-film-dialog__header">
              <h2 id={`${idPrefix}-title`}>{title} <span> / The film</span></h2>
              <button className="project-film-dialog__close" type="button" onClick={() => setIsOpen(false)}>
                Close
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </header>
            <ProjectFilmPlayer videoRef={videoRef} title={title} film={film} idPrefix={idPrefix} onError={() => setHasError(true)} />
            {hasError ? (
              <p className="project-film-dialog__error" role="alert">
                The film couldn’t load. <a href={projectMediaSource(film.src)} target="_blank" rel="noreferrer">Open the video directly</a>.
              </p>
            ) : null}
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}
