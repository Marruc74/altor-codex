import { useState } from "react";
import VideoModal from "./VideoModal";

const CHAPTERS = [
  { id: "6LBJzNV1ELE", label: "Prologue",   title: "The Altor Codex — Prologue" },
  { id: "uwAW1TD2hi4", label: "Backstory",  title: "The Altor Codex — Backstory" },
  { id: "SkHa9w8liis", label: "Chapter 1",  title: "The Secret of Skeleton Village" },
  { id: "-6x3huqel8E", label: "Chapter 2A", title: "The Misty Island" },
  { id: "b5zJNvqF5n8", label: "Chapter 2B", title: "The Misty Island" },
];

const EPISODES = [
  { id: "HP1Jp6Jw6K4", label: "Episode", title: "White Silence" },
  { id: "zrQP8BwudKM", label: "Episode", title: "The Hollow Back" },
];

const CHARACTERS = [
  { id: "eoVRxFnDAHU", label: "Character", title: "Kaelene Fenholt" },
  { id: "8F5Mb3Ammuw", label: "Character", title: "Bram Kestrel" },
  { id: "i-ydrEYHeCk", label: "Character", title: "Aelthira Moonveil" },
];

function MediaGrid({ items, onSelect }) {
  return (
    <div className="media-grid">
      {items.map((item) => (
        <button key={item.id} className="media-card media-card--clickable" onClick={() => onSelect(item)}>
          <div className="media-card__thumbnail">
            <img
              src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
              alt={item.title}
              loading="lazy"
            />
            <div className="media-card__play-overlay">
              <span className="media-card__play-icon">▶</span>
            </div>
          </div>
          <div className="media-card__info">
            <span className="media-card__type">{item.label}</span>
            <h3 className="media-card__title">{item.title}</h3>
          </div>
        </button>
      ))}
    </div>
  );
}

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

      <div className="chronicles-sections">
        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Chapters</h3>
          <MediaGrid items={CHAPTERS} onSelect={setActive} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Episodes</h3>
          <MediaGrid items={EPISODES} onSelect={setActive} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Characters</h3>
          <MediaGrid items={CHARACTERS} onSelect={setActive} />
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
