import { useState } from "react";
import VideoModal from "./VideoModal";

const episodes = [
  { id: "6LBJzNV1ELE", label: "Prologue",   title: "The Altor Codex — Prologue" },
  { id: "uwAW1TD2hi4", label: "Backstory",  title: "The Altor Codex — Backstory" },
  { id: "SkHa9w8liis", label: "Chapter 1",  title: "The Secret of Skeleton Village" },
  { id: "-6x3huqel8E", label: "Chapter 2A", title: "The Misty Island" },
  { id: "b5zJNvqF5n8", label: "Chapter 2B", title: "The Misty Island" },
];

export default function MediaSection() {
  const [active, setActive] = useState(null);

  return (
    <section id="chronicles" className="media-section">
      <div className="section-header">
        <p className="section-eyebrow">THE CHRONICLES</p>
        <h2 className="section-title">The Story So Far</h2>
        <p className="section-subtitle">
          The recorded history of the Codex, from its origins to the present.
        </p>
      </div>

      <div className="media-grid">
        {episodes.map((ep) => (
          <button key={ep.id} className="media-card media-card--clickable" onClick={() => setActive(ep)}>
            <div className="media-card__thumbnail">
              <img
                src={`https://img.youtube.com/vi/${ep.id}/hqdefault.jpg`}
                alt={ep.title}
                loading="lazy"
              />
              <div className="media-card__play-overlay">
                <span className="media-card__play-icon">▶</span>
              </div>
            </div>
            <div className="media-card__info">
              <span className="media-card__type">{ep.label}</span>
              <h3 className="media-card__title">{ep.title}</h3>
            </div>
          </button>
        ))}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
