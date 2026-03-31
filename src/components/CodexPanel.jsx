import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { entries } from "../data/codex/index.js";
import { videos } from "../data/videoData.js";

const IMAGE_RE = /!\[([^\]]*)\]\(([^")]+?)(?:\s+"([^"]*)")?\)/g;

function extractImages(markdown) {
  const images = [];
  let m;
  IMAGE_RE.lastIndex = 0;
  while ((m = IMAGE_RE.exec(markdown)) !== null) {
    images.push({ alt: m[1], src: m[2], caption: m[3] || null });
  }
  return images;
}

function stripImages(markdown) {
  return markdown.replace(IMAGE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}

function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  const img = images[idx];

  return (
    <figure className="codex-carousel">
      <div className="codex-carousel__track">
        <button
          className="codex-carousel__arrow"
          onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
          aria-label="Previous image"
          disabled={images.length === 1}
        >‹</button>
        <img src={img.src} alt={img.alt} className="codex-carousel__image" />
        <button
          className="codex-carousel__arrow"
          onClick={() => setIdx((i) => (i + 1) % images.length)}
          aria-label="Next image"
          disabled={images.length === 1}
        >›</button>
      </div>
      <div className="codex-carousel__footer">
        {img.caption && <figcaption className="codex-carousel__caption">{img.caption}</figcaption>}
        {images.length > 1 && (
          <div className="codex-carousel__dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`codex-carousel__dot${i === idx ? " codex-carousel__dot--active" : ""}`}
                onClick={() => setIdx(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}

export default function CodexPanel({ entry, onClose, onTagClick, onEntrySelect, onVideoSelect }) {
  const panelRef = useRef(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (entry) {
      panelRef.current?.focus();
      setContent(null);
      import(`../data/codex/${entry.detail ?? entry.id + ".md"}?raw`)
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

  const relatedVideos = (entry.relatedVideos ?? [])
    .map((id) => videos.find((v) => v.id === id))
    .filter(Boolean);

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
          ) : (() => {
            const imgs = extractImages(content);
            const body = stripImages(content);
            return (
              <>
                {imgs.length > 0 && <ImageCarousel images={imgs} />}
                <div className="codex-panel__markdown">
                  <ReactMarkdown
                    components={{
                      img: () => null,
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
                    {body}
                  </ReactMarkdown>
                </div>
              </>
            );
          })()}

          {content !== null && relatedVideos.length > 0 && (
            <div className="codex-panel__related">
              <p className="location-panel__section-label">Related Videos</p>
              <div className="codex-panel__video-list">
                {relatedVideos.map((v) => (
                  <button
                    key={v.id}
                    className="codex-panel__video-card"
                    onClick={() => onVideoSelect(v)}
                  >
                    <div className="codex-panel__video-thumb">
                      <img
                        src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                        alt={v.name}
                      />
                      <span className="codex-panel__video-play">▶</span>
                    </div>
                    <div className="codex-panel__video-info">
                      {v.group && <span className="codex-panel__video-group">{v.group}</span>}
                      <span className="codex-panel__video-name">{v.name}</span>
                    </div>
                  </button>
                ))}
              </div>
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
