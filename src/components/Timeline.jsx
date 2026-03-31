import { useState, useRef } from "react";
import { eras } from "../data/timeline";
import { videos } from "../data/videoData";

const videoById = Object.fromEntries(videos.map((v) => [v.id, v]));

export default function Timeline({ onVideoSelect }) {
  const [activeId, setActiveId] = useState(eras[0].id);
  const trackRef = useRef(null);

  const activeEra = eras.find((e) => e.id === activeId);
  const activeVideos = activeEra.videoIds.map((id) => videoById[id]).filter(Boolean);

  const handleEraClick = (era, btn) => {
    setActiveId(era.id);
    // Scroll the clicked node toward the centre of the track
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section id="history" className="timeline-section">
      <div className="section-header">
        <p className="section-eyebrow">Chronicles of Ereb</p>
        <h2 className="section-title">History</h2>
        <p className="section-subtitle">Select an era to explore its events and chronicles.</p>
      </div>

      <div className="timeline-track-outer" ref={trackRef}>
        <div className="timeline-track">
          <div className="timeline-line" />
          {eras.map((era) => (
            <button
              key={era.id}
              className={`timeline-era${activeId === era.id ? " timeline-era--active" : ""}`}
              onClick={(e) => handleEraClick(era, e.currentTarget)}
              aria-pressed={activeId === era.id}
            >
              <span className="timeline-era__label">{era.label}</span>
              <span className="timeline-era__node" />
              <span className="timeline-era__period">{era.period}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-panel">
        <p className="timeline-panel__desc">{activeEra.description}</p>

        {activeVideos.length > 0 && (
          <div className="timeline-panel__videos">
            {activeVideos.map((video) => (
              <button
                key={video.id}
                className="timeline-video-card"
                onClick={() => onVideoSelect?.(video)}
                aria-label={`Watch ${video.name}`}
              >
                <div className="timeline-video-card__thumb">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.name}
                  />
                  <div className="timeline-video-card__overlay">▶</div>
                </div>
                <span className="timeline-video-card__name">{video.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
