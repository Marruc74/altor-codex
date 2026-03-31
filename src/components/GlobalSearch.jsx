import { useState, useEffect, useRef, useMemo } from "react";
import { pins } from "../data/locations";
import { entries } from "../data/codex/index.js";
import { videos } from "../data/videoData";

const PIN_LABELS = {
  capital: "Capital", city: "City", country: "Country", region: "Region",
  water: "Water", continent: "Continent", mountain: "Mountain", forest: "Forest",
  site: "Site", ruin: "Ruins", dungeon: "Dungeon", shrine: "Shrine",
};

const PIN_COLORS = {
  capital: "#c8a951", city: "#c0c0c0", continent: "#9a6abf", country: "#c87a3a",
  region: "#7a9a5a", water: "#4a7aaa", mountain: "#9a9a9a", forest: "#4a7a3a",
  site: "#a07840", ruin: "#8a6520", dungeon: "#8a2020", shrine: "#3a7a6a",
};

function buildGroups(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  let flatIdx = 0;
  const groups = [];

  const matchedPins = pins
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({
      type: "pin", key: p.id, label: p.name,
      sub: PIN_LABELS[p.type] ?? p.type,
      color: PIN_COLORS[p.type],
      data: p, flatIdx: flatIdx++,
    }));

  const matchedEntries = entries
    .filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((e) => ({
      type: "entry", key: e.id, label: e.title,
      sub: e.tags.slice(0, 3).join(" · "),
      data: e, flatIdx: flatIdx++,
    }));

  const matchedVideos = videos
    .filter((v) =>
      v.title.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((v) => ({
      type: "video", key: v.id, label: v.name || v.title,
      sub: v.group ?? v.section,
      data: v, flatIdx: flatIdx++,
    }));

  if (matchedPins.length)    groups.push({ category: "Locations",  items: matchedPins });
  if (matchedEntries.length) groups.push({ category: "Codex",      items: matchedEntries });
  if (matchedVideos.length)  groups.push({ category: "Chronicles", items: matchedVideos });

  return groups;
}

export default function GlobalSearch({ onPinSelect, onEntrySelect, onVideoSelect, onClose }) {
  const [query, setQuery]           = useState("");
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef  = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const groups     = useMemo(() => buildGroups(query), [query]);
  const flatItems  = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const totalCount = flatItems.length;

  // Reset focus on new query
  useEffect(() => { setFocusedIdx(0); }, [query]);

  // Scroll focused item into view
  useEffect(() => {
    const el = resultsRef.current?.querySelector(`[data-idx="${focusedIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIdx]);

  const handleSelect = (item) => {
    if (item.type === "pin")   onPinSelect(item.data.id);
    if (item.type === "entry") onEntrySelect(item.data.id);
    if (item.type === "video") onVideoSelect(item.data);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, totalCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatItems[focusedIdx]) {
      handleSelect(flatItems[focusedIdx]);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <div className="gs-backdrop" onClick={onClose} />
      <div className="gs" role="dialog" aria-label="Global search" aria-modal="true">

        <div className="gs__input-wrap">
          <span className="gs__icon">⌕</span>
          <input
            ref={inputRef}
            className="gs__input"
            type="search"
            placeholder="Search locations, codex, chronicles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          {hasQuery && (
            <button className="gs__clear" onClick={() => setQuery("")} aria-label="Clear">✕</button>
          )}
        </div>

        {hasQuery && groups.length > 0 && (
          <div className="gs__results" ref={resultsRef}>
            {groups.map((group) => (
              <div key={group.category} className="gs__group">
                <p className="gs__group-label">{group.category}</p>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    data-idx={item.flatIdx}
                    className={`gs__result${item.flatIdx === focusedIdx ? " gs__result--focused" : ""}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIdx(item.flatIdx)}
                  >
                    {item.type === "pin"
                      ? <span className="gs__dot" style={{ background: item.color }} />
                      : <span className="gs__sigil">{item.type === "entry" ? "◈" : "▶"}</span>
                    }
                    <span className="gs__result-label">{item.label}</span>
                    {item.sub && <span className="gs__result-sub">{item.sub}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {hasQuery && groups.length === 0 && (
          <p className="gs__empty">No results for "<em>{query}</em>"</p>
        )}

        {!hasQuery && (
          <div className="gs__hint">
            <span>Search across the entire codex</span>
            <span className="gs__hint-esc">esc</span>
          </div>
        )}
      </div>
    </>
  );
}
