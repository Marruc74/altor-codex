import { useRef } from "react";
import { useModal } from "../lib/useModal";
import { pinForVideo } from "../data/crossLinks";

export default function VideoModal({ video, onClose, onPinSelect }) {
  const ref = useRef(null);
  const label = video?.title ?? video?.name ?? "";

  // Escape to close, Tab trapped inside, body scroll locked, focus restored.
  useModal(ref, onClose, !!video);

  if (!video) return null;

  const linkedPin = pinForVideo[video.id];

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside
        className="video-modal"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label={label}
      >
        <button className="video-modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="video-modal__embed">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={label}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="video-modal__info">
          {(video.label ?? video.group) && (
            <span className="video-modal__group">{video.label ?? video.group}</span>
          )}
          <h2 className="video-modal__title">{label}</h2>
          {linkedPin && onPinSelect && (
            <button
              className="video-modal__map-link"
              onClick={() => { onClose(); onPinSelect(linkedPin.id); }}
            >
              ◉ View on Map — {linkedPin.name}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
