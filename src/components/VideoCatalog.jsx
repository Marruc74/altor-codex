import { useState } from "react";
import { SECTIONS, videosBySection } from "../data/videoData";
import VideoModal from "./VideoModal";

function VideoCard({ video, onSelect }) {
  return (
    <button className="media-card media-card--clickable" onClick={() => onSelect(video)}>
      <div className="media-card__thumbnail">
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.name}
          loading="lazy"
        />
        <div className="media-card__play-overlay">
          <span className="media-card__play-icon">▶</span>
        </div>
      </div>
      <div className="media-card__info">
        {video.group && <span className="media-card__type">{video.group}</span>}
        <h3 className="media-card__title">{video.name}</h3>
      </div>
    </button>
  );
}

function VideoGroup({ group, videos, onSelect }) {
  const [open, setOpen] = useState(true);

  if (!group) {
    return (
      <div className="video-group">
        <div className="media-grid">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} onSelect={onSelect} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="video-group">
      <button className="video-group__header" onClick={() => setOpen((o) => !o)}>
        <span className="video-group__label">{group}</span>
        <span className="video-group__count">{videos.length}</span>
        <span className="video-section__toggle">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="media-grid">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoSection({ section, onSelect }) {
  const [open, setOpen] = useState(false);
  const groups = videosBySection[section.id] || [];
  const total  = groups.reduce((n, g) => n + g.videos.length, 0);

  if (total === 0) return null;

  return (
    <div className="video-section" id={`catalog-${section.id}`}>
      <button className="video-section__header" onClick={() => setOpen((o) => !o)}>
        <span className="video-section__sigil">{section.sigil}</span>
        <h3 className="video-section__title">{section.label}</h3>
        <span className="video-section__count">{total}</span>
        <span className="video-section__toggle">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="video-section__groups">
          {groups.map((g, i) => (
            <VideoGroup
              key={g.group ?? `__none__${i}`}
              group={g.group}
              videos={g.videos}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VideoCatalog() {
  const [active, setActive] = useState(null);

  return (
    <section id="catalog" className="catalog-section">
      <div className="section-header">
        <p className="section-eyebrow">ALL ENTRIES</p>
        <h2 className="section-title">The Compendium</h2>
        <p className="section-subtitle">
          Every chronicle, record, and field report in the Codex archive.
        </p>
      </div>

      <div className="catalog-body">
        {SECTIONS.map((s) => (
          <VideoSection key={s.id} section={s} onSelect={setActive} />
        ))}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
