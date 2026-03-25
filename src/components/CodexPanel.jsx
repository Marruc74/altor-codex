import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { entries } from "../data/codex/index.js";

function MarkdownImage({ src, alt, title }) {
  return (
    <figure className="codex-panel__figure">
      <img src={src} alt={alt} className="codex-panel__image" />
      {title && <figcaption className="codex-panel__caption">{title}</figcaption>}
    </figure>
  );
}

export default function CodexPanel({ entry, onClose, onTagClick, onEntrySelect }) {
  const panelRef = useRef(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (entry) {
      panelRef.current?.focus();
      setContent(null);
      import(`../data/codex/${entry.id}.md?raw`)
        .then((m) => setContent(m.default))
        .catch(() => setContent(""));
    }
  }, [entry]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!entry) return null;

  const relatedEntries = entry.related
    ?.map((id) => entries.find((e) => e.id === id))
    .filter(Boolean) ?? [];

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside
        className="codex-panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={entry.title}
      >
        <div className="codex-panel__header">
          <div className="codex-panel__ornament">◈</div>
          <div className="codex-panel__header-text">
            <div className="codex-panel__tags">
              {entry.tags.map((tag) => (
                <button
                  key={tag}
                  className="codex-tag"
                  onClick={() => { onTagClick(tag); onClose(); }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <h2 className="codex-panel__title">{entry.title}</h2>
          </div>
          <button className="location-panel__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="location-panel__divider" />

        <div className="codex-panel__body">
          {content === null ? (
            <p className="location-panel__loading">Consulting the codex…</p>
          ) : content === "" ? (
            <p className="location-panel__loading">No further information recorded.</p>
          ) : (
            <div className="codex-panel__markdown">
              <ReactMarkdown
                components={{
                  img: MarkdownImage,
                  h2: ({ children }) => <h2 className="codex-panel__h2">{children}</h2>,
                  h3: ({ children }) => <h3 className="codex-panel__h3">{children}</h3>,
                  p:  ({ children }) => <p  className="codex-panel__para">{children}</p>,
                  ul: ({ children }) => <ul className="codex-panel__list">{children}</ul>,
                  ol: ({ children }) => <ol className="codex-panel__list codex-panel__list--ol">{children}</ol>,
                  li: ({ children }) => <li className="codex-panel__li">{children}</li>,
                  strong: ({ children }) => <strong className="codex-panel__strong">{children}</strong>,
                  em:     ({ children }) => <em     className="codex-panel__em">{children}</em>,
                  hr: () => <hr className="codex-panel__hr" />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {content !== null && relatedEntries.length > 0 && (
            <div className="codex-panel__related">
              <p className="location-panel__section-label">Related</p>
              <div className="codex-panel__related-grid">
                {relatedEntries.map((rel) => (
                  <button
                    key={rel.id}
                    className="codex-panel__related-card"
                    onClick={() => onEntrySelect(rel)}
                  >
                    <span className="codex-panel__related-ornament">◈</span>
                    <span>{rel.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="location-panel__footer">
          <span className="location-panel__stamp">ALTOR CODEX</span>
        </div>
      </aside>
    </>
  );
}
