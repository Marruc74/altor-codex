import { useEffect, useRef } from "react";

export default function LocationPanel({ location, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (location) {
      panelRef.current?.focus();
    }
  }, [location]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!location) return null;

  const typeLabel = location.type === "capital"
    ? "Capital City"
    : location.type === "city"
    ? "City"
    : "Region";

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside
        className="location-panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={location.name}
      >
        <div className="location-panel__header">
          <div className="location-panel__ornament">
            {location.type === "region" ? "◈" : location.type === "capital" ? "⬡" : "◉"}
          </div>
          <div>
            <p className="location-panel__type">{typeLabel}</p>
            <h2 className="location-panel__name">{location.name}</h2>
            <p className="location-panel__tagline">"{location.tagline}"</p>
          </div>
          <button className="location-panel__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="location-panel__divider" />

        <div className="location-panel__body">
          <p className="location-panel__description">{location.description}</p>

          {location.youtubeId && (
            <div className="location-panel__video">
              <p className="location-panel__section-label">Chronicle</p>
              <div className="location-panel__embed">
                <iframe
                  src={`https://www.youtube.com/embed/${location.youtubeId}`}
                  title={`Chronicle: ${location.name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {!location.youtubeId && (
            <div className="location-panel__placeholder-video">
              <div className="placeholder-video__icon">▶</div>
              <p>Chronicle coming soon</p>
              <span>Add a YouTube ID to display a video here</span>
            </div>
          )}
        </div>

        <div className="location-panel__footer">
          <span className="location-panel__stamp">ALTOR CODEX — CLASSIFIED</span>
        </div>
      </aside>
    </>
  );
}
