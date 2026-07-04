import { useState, useEffect, useRef, useCallback } from "react";
import { useModal } from "../lib/useModal";

// A full-size image viewer shared by the Compendium and the Chronicles. Takes an
// array of { src, alt, caption } and a start index; a single-image caller passes
// a one-element array (arrows disabled, dots hidden). Click the backdrop or press
// Escape to close; arrow keys page through a set.
export default function Lightbox({ images, startIdx = 0, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const dialogRef = useRef(null);
  const img = images[idx];
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  // Escape to close, Tab trapped inside, body scroll locked, focus restored.
  useModal(dialogRef, onClose);

  // Arrow keys page through the set.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (!img) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className="lightbox__content"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={img.caption || img.alt || "Image viewer"}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lightbox__close" onClick={onClose} aria-label="Close image viewer">✕</button>
        <div className="lightbox__track">
          <button className="lightbox__arrow" onClick={prev} disabled={images.length === 1} aria-label="Previous image">‹</button>
          <img src={img.src} alt={img.alt} className="lightbox__image" />
          <button className="lightbox__arrow" onClick={next} disabled={images.length === 1} aria-label="Next image">›</button>
        </div>
        <div className="lightbox__footer">
          {img.caption && <p className="lightbox__caption">{img.caption}</p>}
          {images.length > 1 && (
            <div className="lightbox__dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`lightbox__dot${i === idx ? " lightbox__dot--active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === idx ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
