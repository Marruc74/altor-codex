import { useEffect, useRef } from "react";

export default function VideoModal({ video, onClose }) {
  const ref = useRef(null);
  const label = video?.title ?? video?.name ?? "";

  useEffect(() => {
    if (video) ref.current?.focus();
  }, [video]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!video) return null;

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
        </div>
      </aside>
    </>
  );
}
