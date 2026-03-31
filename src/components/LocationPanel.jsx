import { useEffect, useRef } from "react";
import { videosForPin } from "../data/crossLinks";
import { videos } from "../data/videoData";

const videoById = Object.fromEntries(videos.map((v) => [v.id, v]));

export default function LocationPanel({ location, onClose, onVideoSelect }) {
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

  const relatedVideos = (videosForPin[location.id] ?? [])
    .filter((v) => v.id !== location.youtubeId);

  const mainVideo = location.youtubeId
    ? (videoById[location.youtubeId] ?? { id: location.youtubeId, title: `Chronicle: ${location.name}` })
    : null;

  const TYPE_LABELS = {
    capital: "Capital City",
    city:    "City",
    country: "Country",
    region:  "Region",
    water:   "Body of Water",
    continent: "Continent",
    mountain:  "Mountain",
    forest:   "Forest",
    site:     "Site",
    ruin:    "Ruins",
    dungeon: "Dungeon",
    shrine:  "Shrine",
  };
  const typeLabel = TYPE_LABELS[location.type] ?? location.type;

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
          {location.loading ? (
            <p className="location-panel__loading">Consulting the codex…</p>
          ) : location.description ? (
            <p className="location-panel__description">{location.description}</p>
          ) : (
            <p className="location-panel__loading">No further information recorded.</p>
          )}

          {!location.loading && mainVideo && (
            <div className="location-panel__video">
              <p className="location-panel__section-label">Chronicle</p>
              <button
                className="location-panel__watch-btn"
                onClick={() => onVideoSelect?.(mainVideo)}
                aria-label={`Watch ${mainVideo.title}`}
              >
                <img
                  src={`https://img.youtube.com/vi/${mainVideo.id}/mqdefault.jpg`}
                  alt={mainVideo.title}
                />
                <div className="location-panel__watch-overlay">
                  <span className="location-panel__watch-play">▶</span>
                  <span className="location-panel__watch-label">Watch</span>
                </div>
              </button>
            </div>
          )}

          {!location.loading && !location.youtubeId && (
            <div className="location-panel__placeholder-video">
              <div className="placeholder-video__icon">▶</div>
              <p>Chronicle coming soon</p>
              <span>Add a YouTube ID to display a video here</span>
            </div>
          )}

          {!location.loading && relatedVideos.length > 0 && (
            <div className="location-panel__related-videos">
              <p className="location-panel__section-label">Related Compendium Entries</p>
              <div className="location-panel__video-strip">
                {relatedVideos.map((video) => (
                  <button
                    key={video.id}
                    className="location-panel__video-thumb"
                    onClick={() => onVideoSelect?.(video)}
                    title={video.name}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt={video.name}
                    />
                    <div className="location-panel__video-thumb-overlay">▶</div>
                    <span className="location-panel__video-thumb-label">{video.name}</span>
                  </button>
                ))}
              </div>
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
