import './media-loading.css';

export default function MediaLoading({ label }: { label: string }) {
  return (
    <div className="media-loading" role="status" aria-label={label}>
      <span className="media-loading__text" aria-hidden="true">Loading<span className="media-loading__dots">...</span></span>
    </div>
  );
}
