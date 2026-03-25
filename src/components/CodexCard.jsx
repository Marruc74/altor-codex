export default function CodexCard({ entry, onSelect, onTagClick }) {
  return (
    <article className="codex-card" onClick={() => onSelect(entry)}>
      <div className="codex-card__image-wrap">
        {entry.image ? (
          <img src={entry.image} alt={entry.title} className="codex-card__image" />
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
