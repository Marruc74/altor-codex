import { CardImage } from "./compendiumCards";
import { refToTarget, toSlug } from "./compendiumHelpers";
import { entryImages } from "../data/entryImages.generated";

// The three blocks that sit under the contents tab strip: the reader's saved
// pages as a shelf of spines, their recent pages as a list, and the neighbours
// of whatever page is open.
//
// The spine shelf is the direct analogue of a physical library: a saved page is
// a book you put back on the shelf. It is fed by the same localStorage store
// that backs the Save button (lib/library.js), so it fills up as you use it
// rather than being decorative.

// A colour per section, so a shelf of spines is scannable at a glance and two
// saved creatures look related without needing to read the titles.
const SPINE = {
  characters: { hue: "#6b3a52", sigil: "◇" },
  conflicts:  { hue: "#7a2f26", sigil: "⚡" },
  countries:  { hue: "#3f5a3a", sigil: "⬡" },
  creatures:  { hue: "#2f5359", sigil: "⊕" },
  geography:  { hue: "#3f5a3a", sigil: "◈" },
  history:    { hue: "#5a4526", sigil: "⚔" },
  lore:       { hue: "#3a4468", sigil: "⌘" },
  magic:      { hue: "#4a3566", sigil: "✦" },
  peoples:    { hue: "#5c4326", sigil: "◉" },
  adventure:  { hue: "#6b4520", sigil: "❖" },
  country:    { hue: "#3f5a3a", sigil: "⬡" },
};
const DEFAULT_SPINE = { hue: "#3d4756", sigil: "✦" };

// A bookmark ref only carries {kind, id, name}; the section lives on the
// resolved entry. Countries and adventures have no section of their own, so
// they fall back to their kind.
function spineFor(target) {
  const key = target.entry?.section ?? target.kind;
  return SPINE[key] ?? DEFAULT_SPINE;
}

export function SavedShelf({ bookmarks, onOpen }) {
  const targets = bookmarks.map(refToTarget).filter(Boolean);

  if (targets.length === 0) {
    return (
      <p className="shelf__empty">
        Nothing saved yet. Press <span className="shelf__empty-key">☆ Save</span> on
        any page and it lands here.
      </p>
    );
  }

  return (
    <div className="shelf">
      {targets.map((t) => {
        const { hue, sigil } = spineFor(t);
        return (
          <button
            key={`${t.kind}-${t.id}`}
            className="spine"
            style={{ "--spine-hue": hue }}
            onClick={() => onOpen(t)}
            title={t.name}
          >
            <span className="spine__emblem" aria-hidden="true">{sigil}</span>
            <span className="spine__title">{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RecentList({ recents, onOpen }) {
  const targets = recents.map(refToTarget).filter(Boolean);

  if (targets.length === 0) {
    return <p className="shelf__empty">No pages read yet this visit.</p>;
  }

  return (
    <div className="recent-list">
      {targets.map((t) => (
        <button
          key={`${t.kind}-${t.id}`}
          className="recent-item"
          onClick={() => onOpen(t)}
        >
          <span className="recent-item__name">{t.name}</span>
          <span className="recent-item__kind">
            {t.entry?.section ?? (t.kind === "adventure" ? "adventure" : "land")}
          </span>
        </button>
      ))}
    </div>
  );
}

// Where you are in the current group, and the pages either side of it. The
// compendium has always been a tree you jump around in; this is the one thing
// it had no affordance for - reading straight through a run of pages.
export function NeighbourStrip({ neighbours, onOpen }) {
  if (!neighbours) return null;
  const { prev, current, next, index, total } = neighbours;

  const card = (v, role) => {
    if (!v) return <span className="neighbour neighbour--empty" aria-hidden="true" />;
    const img = entryImages[toSlug(v.name)] ?? null;
    return (
      <button
        className={`neighbour neighbour--${role}`}
        onClick={() => role !== "current" && onOpen(v)}
        disabled={role === "current"}
        title={v.name}
        aria-label={role === "current" ? `${v.name} (current page)` : `${role === "prev" ? "Previous" : "Next"}: ${v.name}`}
      >
        <span className="neighbour__frame">
          <CardImage src={img} alt="" />
        </span>
        <span className="neighbour__name">{v.name}</span>
      </button>
    );
  };

  return (
    <div className="neighbours">
      <p className="shelf__hd">
        Nearby
        <span className="neighbours__count">{index + 1} / {total}</span>
      </p>
      <div className="neighbours__row">
        {card(prev, "prev")}
        {card(current, "current")}
        {card(next, "next")}
      </div>
    </div>
  );
}
