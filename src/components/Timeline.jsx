import { useState, useRef, useMemo } from "react";
import { eras } from "../data/timeline";
import { videos } from "../data/videoData";

const videoById = Object.fromEntries(videos.map((v) => [v.id, v]));

export default function Timeline({ onVideoSelect }) {
  const [activeId, setActiveId] = useState(eras[0].id);
  const [region, setRegion] = useState(null);
  const trackRef = useRef(null);

  const activeEra = eras.find((e) => e.id === activeId);
  const activeVideos = activeEra.videoIds.map((id) => videoById[id]).filter(Boolean);

  // All events flattened in chronological order (eras and events are authored
  // in order), tagged with the era they belong to - used by the region filter.
  const allEvents = useMemo(
    () => eras.flatMap((e) => e.events.map((ev) => ({ ...ev, eraLabel: e.label }))),
    []
  );
  const regions = useMemo(
    () => [...new Set(allEvents.map((e) => e.region).filter(Boolean))].sort(),
    [allEvents]
  );
  const regionEvents = region ? allEvents.filter((e) => e.region === region) : null;

  const handleEraClick = (era, btn) => {
    setActiveId(era.id);
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section id="history" className="timeline-section">
      <div className="section-header">
        <p className="section-eyebrow">Chronicles of Ereb</p>
        <h2 className="section-title">History</h2>
        <p className="section-subtitle">Select an era to explore its events, or filter by region to follow a single land through the ages.</p>
        <p className="timeline-cal-note">Years run fO (före Odo, before Odo) and eO (after Odo). The present age is 610 eO.</p>
      </div>

      <div className={`timeline-track-outer${region ? " timeline-track-outer--muted" : ""}`} ref={trackRef}>
        <div className="timeline-track">
          <div className="timeline-line" />
          {eras.map((era) => (
            <button
              key={era.id}
              className={`timeline-era${activeId === era.id && !region ? " timeline-era--active" : ""}`}
              onClick={(e) => { setRegion(null); handleEraClick(era, e.currentTarget); }}
              aria-pressed={activeId === era.id && !region}
            >
              <span className="timeline-era__label">{era.label}</span>
              <span className="timeline-era__node" />
              <span className="timeline-era__period">{era.period}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-regions" role="group" aria-label="Filter events by region">
        <button
          className={`timeline-region-chip${region === null ? " timeline-region-chip--active" : ""}`}
          onClick={() => setRegion(null)}
          aria-pressed={region === null}
        >
          All eras
        </button>
        {regions.map((r) => (
          <button
            key={r}
            className={`timeline-region-chip${region === r ? " timeline-region-chip--active" : ""}`}
            onClick={() => setRegion(r)}
            aria-pressed={region === r}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="timeline-panel">
        {region ? (
          <>
            <p className="timeline-panel__desc">
              <span className="timeline-panel__region-title">{region}</span> through the ages
            </p>
            <ol className="timeline-events">
              {regionEvents.map((ev, i) => (
                <li key={i} className="timeline-event">
                  <span className="timeline-event__meta">
                    <span className="timeline-event__year">{ev.year}</span>
                    <span className="timeline-event__era">{ev.eraLabel}</span>
                  </span>
                  <span className="timeline-event__text">{ev.text}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <p className="timeline-panel__desc">{activeEra.description}</p>

            {activeEra.events?.length > 0 && (
              <ol className="timeline-events">
                {activeEra.events.map((ev, i) => (
                  <li key={i} className="timeline-event">
                    <span className="timeline-event__meta">
                      <span className="timeline-event__year">{ev.year}</span>
                      {ev.region && (
                        <button
                          className="timeline-event__region"
                          onClick={() => setRegion(ev.region)}
                          aria-label={`Filter by ${ev.region}`}
                        >
                          {ev.region}
                        </button>
                      )}
                    </span>
                    <span className="timeline-event__text">{ev.text}</span>
                  </li>
                ))}
              </ol>
            )}

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
          </>
        )}
      </div>
    </section>
  );
}
