import { useEffect, useMemo, useState } from "react";
import { SECTIONS, videosBySection, videos as allVideos } from "../data/videoData";

function VideoCard({ video, onSelect, typeLabel }) {
  const label = typeLabel !== undefined ? typeLabel : video.group;
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
        {label && <span className="media-card__type">{label}</span>}
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

function VideoSection({ section, isOpen, onToggle, onSelect }) {
  const groups = videosBySection[section.id] || [];
  const total  = groups.reduce((n, g) => n + g.videos.length, 0);

  if (total === 0) return null;

  return (
    <div className="video-section" id={`catalog-${section.id}`}>
      <button className="video-section__header" onClick={onToggle}>
        <span className="video-section__sigil">{section.sigil}</span>
        <h3 className="video-section__title">{section.label}</h3>
        <span className="video-section__count">{total}</span>
        <span className="video-section__toggle">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
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

const SECTION_LABEL = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label]));

function CatalogNav({ visibleSections, openSections, onExpand }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const observers = visibleSections.map((s) => {
      const el = document.getElementById(`catalog-${s.id}`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(s.id); },
        { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [visibleSections]);

  const handleClick = (s) => {
    if (!openSections[s.id]) onExpand(s.id);
    setTimeout(() => {
      document.getElementById(`catalog-${s.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <nav className="catalog-nav" aria-label="Jump to section">
      {visibleSections.map((s) => (
        <button
          key={s.id}
          className={`catalog-nav__item${activeId === s.id ? " catalog-nav__item--active" : ""}`}
          onClick={() => handleClick(s)}
          title={s.label}
        >
          <span className="catalog-nav__sigil">{s.sigil}</span>
          <span className="catalog-nav__label">{s.label}</span>
        </button>
      ))}
    </nav>
  );
}

const VISIBLE_SECTIONS = SECTIONS.filter(
  (s) => (videosBySection[s.id] || []).reduce((n, g) => n + g.videos.length, 0) > 0
);

export default function VideoCatalog({ onVideoSelect }) {
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(VISIBLE_SECTIONS.map((s) => [s.id, false]))
  );

  const allExpanded = VISIBLE_SECTIONS.every((s) => openSections[s.id]);

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const next = !allExpanded;
    setOpenSections(Object.fromEntries(VISIBLE_SECTIONS.map((s) => [s.id, next])));
  };

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allVideos.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.group && v.group.toLowerCase().includes(q)) ||
        SECTION_LABEL[v.section]?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section id="catalog" className="catalog-section">
      <div className="section-header">
        <p className="section-eyebrow">ALL ENTRIES</p>
        <h2 className="section-title">The Compendium</h2>
        <p className="section-subtitle">
          Every chronicle, record, and field report in the Codex archive.
        </p>
      </div>

      <div className="catalog-sticky">
        <div className="catalog-search-wrap">
          <div className="codex-search-wrap">
            <span className="codex-search-icon">⌕</span>
            <input
              className="codex-search"
              type="search"
              placeholder="Search the compendium…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search compendium"
            />
            {query && (
              <button className="codex-search-clear" onClick={() => setQuery("")} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>
        {!searchResults && (
          <CatalogNav
            visibleSections={VISIBLE_SECTIONS}
            openSections={openSections}
            onExpand={(id) => setOpenSections((prev) => ({ ...prev, [id]: true }))}
          />
        )}
      </div>

      {searchResults ? (
        <div className="catalog-body">
          {searchResults.length === 0 ? (
            <p className="catalog-no-results">No entries match "{query}".</p>
          ) : (
            <div className="media-grid">
              {searchResults.map((v) => {
                const section = SECTION_LABEL[v.section];
                const label = v.group ? `${section} · ${v.group}` : section;
                return <VideoCard key={v.id} video={v} onSelect={onVideoSelect} typeLabel={label} />;
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="catalog-body">
          <div className="catalog-toolbar">
            <button className="catalog-toggle-all" onClick={toggleAll}>
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
          {SECTIONS.map((s) => (
            <VideoSection
              key={s.id}
              section={s}
              isOpen={openSections[s.id] ?? false}
              onToggle={() => toggleSection(s.id)}
              onSelect={onVideoSelect}
            />
          ))}
        </div>
      )}

    </section>
  );
}
