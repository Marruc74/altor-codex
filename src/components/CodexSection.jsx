import { useState, useMemo } from "react";
import { entries } from "../data/codex/index.js";
import CodexCard from "./CodexCard";
import CodexPanel from "./CodexPanel";
import VideoModal from "./VideoModal";

// Derive sorted tag list with counts
function buildTagList(allEntries) {
  const counts = {};
  allEntries.forEach((e) => e.tags.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

const ALL_TAGS = buildTagList(entries);

export default function CodexSection() {
  const [query, setQuery]         = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [selected, setSelected]   = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesTag = !activeTag || e.tags.includes(activeTag);
      if (!q) return matchesTag;
      return matchesTag && (
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, activeTag]);

  const handleTagClick = (tag) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setQuery("");
  };

  const clearFilters = () => { setActiveTag(null); setQuery(""); };

  return (
    <section id="codex" className="codex-section">
      <div className="section-header">
        <p className="section-eyebrow">The Archive</p>
        <h2 className="section-title">Codex</h2>
        <p className="section-sub">
          Browse entries by tag, or search for any name, place, or object.
        </p>
      </div>

      <div className="codex-controls">
        <div className="codex-search-wrap">
          <span className="codex-search-icon">⌕</span>
          <input
            className="codex-search"
            type="search"
            placeholder="Search the codex…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveTag(null); }}
            aria-label="Search codex entries"
          />
          {query && (
            <button className="codex-search-clear" onClick={() => setQuery("")} aria-label="Clear search">✕</button>
          )}
        </div>

        <div className="codex-tags">
          {ALL_TAGS.map(({ tag }) => (
            <button
              key={tag}
              className={`codex-tag ${activeTag === tag ? "codex-tag--active" : ""}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {(activeTag || query) && (
        <div className="codex-filter-bar">
          {activeTag && (
            <span className="codex-filter-chip">
              {activeTag}
              <button onClick={() => setActiveTag(null)} aria-label="Remove tag filter">✕</button>
            </span>
          )}
          {query && (
            <span className="codex-filter-chip">
              "{query}"
              <button onClick={() => setQuery("")} aria-label="Clear search">✕</button>
            </span>
          )}
          <button className="codex-filter-clear" onClick={clearFilters}>Clear all</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="codex-empty">
          <p className="codex-empty__ornament">◈</p>
          <p className="codex-empty__text">No entries found.</p>
          <p className="codex-empty__sub">The codex may yet be incomplete.</p>
          <button className="codex-empty__reset" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="codex-grid">
          {filtered.map((entry) => (
            <CodexCard
              key={entry.id}
              entry={entry}
              onSelect={setSelected}
              onTagClick={handleTagClick}
            />
          ))}
        </div>
      )}

      <CodexPanel
        entry={selected}
        onClose={() => setSelected(null)}
        onTagClick={handleTagClick}
        onEntrySelect={setSelected}
        onVideoSelect={setActiveVideo}
      />

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}
