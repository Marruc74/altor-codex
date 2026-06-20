import { useMemo, useState } from "react";
import { mentionIndex } from "../data/searchIndex.generated";

// An A-Z index of every named figure, place and item that appears on a
// country/region page (the mentionIndex - ~350 of them). These are otherwise
// only reachable through Ctrl+K search; this surfaces them as a browsable
// gazetteer. Each one opens the land it belongs to. onOpen receives the raw
// mention {name, pinId, page}; the parent turns pinId into a country page.
function letterOf(name) {
  const c = (name[0] || "#").toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

export default function Gazetteer({ onOpen }) {
  const [q, setQ] = useState("");

  const { groups, letters } = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? mentionIndex.filter(
          (m) => m.name.toLowerCase().includes(needle) || (m.page ?? "").toLowerCase().includes(needle)
        )
      : mentionIndex;
    const byLetter = {};
    for (const m of filtered) (byLetter[letterOf(m.name)] ??= []).push(m);
    const groups = Object.keys(byLetter)
      .sort()
      .map((L) => [L, byLetter[L].slice().sort((a, b) => a.name.localeCompare(b.name))]);
    return { groups, letters: new Set(groups.map((g) => g[0])) };
  }, [q]);

  const total = groups.reduce((n, g) => n + g[1].length, 0);
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

  return (
    <div className="gazetteer">
      <div className="gazetteer__bar">
        <input
          className="codex-search gazetteer__search"
          type="search"
          placeholder="Filter the index…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Filter the gazetteer"
        />
        <span className="gazetteer__count">{total} named</span>
      </div>

      <nav className="gazetteer__alphabet" aria-label="Jump to letter">
        {ALPHABET.map((L) =>
          letters.has(L) ? (
            <a key={L} href={`#gz-${L}`} className="gazetteer__letter-link">{L}</a>
          ) : (
            <span key={L} className="gazetteer__letter-link gazetteer__letter-link--off">{L}</span>
          )
        )}
      </nav>

      {total === 0 ? (
        <p className="country-detail__empty">No names match "{q}".</p>
      ) : (
        groups.map(([L, items]) => (
          <section key={L} className="gazetteer__group" id={`gz-${L}`}>
            <h3 className="gazetteer__letter">{L}</h3>
            <div className="gazetteer__items">
              {items.map((m, i) => (
                <button
                  key={`${m.name}-${m.pinId}-${i}`}
                  className="gazetteer__item"
                  onClick={() => onOpen(m)}
                >
                  <span className="gazetteer__name">{m.name}</span>
                  <span className="gazetteer__place">{m.page}</span>
                </button>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
