import { useState } from "react";
import { thumbSrc, onThumbError } from "../lib/thumb";

export default function CodexCard({ entry, onSelect, onTagClick }) {
  // Portrait/tall images get a 2:3 image box so they show in full instead of
  // being cropped to 16:9 (detected from the image's natural dimensions).
  const [portrait, setPortrait] = useState(false);
  return (
    <article
      className={`codex-card${portrait ? " codex-card--portrait" : ""}`}
      onClick={() => onSelect(entry)}
    >
      <div className="codex-card__image-wrap">
        {entry.image ? (
          <img
            src={thumbSrc(entry.image)}
            alt={entry.title}
            className="codex-card__image"
            loading="lazy"
            onLoad={(e) => setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)}
            onError={onThumbError(entry.image)}
          />
        ) : (
          <div className="codex-card__placeholder">◈</div>
        )}
      </div>
      <div className="codex-card__body">
        <h3 className="codex-card__title">{entry.title}</h3>
        <p className="codex-card__summary">{entry.summary}</p>
        <div className="codex-card__tags" onClick={(e) => e.stopPropagation()}>
          {entry.tags.map((tag) => (
            <button
              key={tag}
              className="codex-tag"
              onClick={() => onTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
