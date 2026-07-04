import { useState } from "react";
import VideoModal from "./VideoModal";
import Lightbox from "./Lightbox";
import { resolvePage } from "../data/compendiumPages";
import { adventures } from "../data/adventures";
import { entryImages } from "../data/entryImages.generated";
import { thumbSrc, onThumbError, IMAGE_MISSING } from "../lib/thumb";
import { LORE_GROUPS } from "../data/chronicles";

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

// General Chronicles art that belongs to no single road job: the trio together,
// mood pieces, and the like. Each opens full size in the lightbox.
const GALLERY = [
  {
    src: "/compendium/Chronicles/Gallery/three-adventurers.jpg",
    title: "Kaelene, Bram & Aelthira",
    caption: "The trio on the road together.",
  },
];


// Reading order: the prequel (Episode 0) first, then the seven road jobs.
const GROUP_ORDER = ["backstory", "skeleton", "misty", "unicorn", "borrowed", "shadow", "made-dragon", "day-of-wrath"];
const ORDERED_GROUPS = [...LORE_GROUPS].sort(
  (a, b) => GROUP_ORDER.indexOf(a.id) - GROUP_ORDER.indexOf(b.id)
);

// Chronicles cards borrow (never copy) images that already live in the
// Compendium: a card linking to an adventure shows that adventure's portrait
// of the same subject, and a card linking to a country shows the country's
// first page image. Paths point straight at the existing /compendium files.
const normName = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// adventure id -> Map(normalised card name -> { name, description, src, portrait,
// fit }). The Compendium shows character art as 2:3 portraits and places/items as
// 16:9, so we carry each source card's orientation through (figures default to
// portrait, matching the adventure view's NPC/Creature grids).
const ADVENTURE_CARDS = (() => {
  const out = {};
  for (const a of adventures) {
    const m = new Map();
    const add = (figure) => (c) => {
      if (c?.name && !m.has(normName(c.name)))
        m.set(normName(c.name), {
          name: c.name,
          description: c.description ?? "",
          src: c.image ?? null,
          portrait: c.portrait ?? figure,
          fit: c.fit,
        });
    };
    (a.characters || []).forEach(add(true));
    (a.creatures || []).forEach(add(true));
    (a.places || []).forEach(add(false));
    (a.items || []).forEach(add(false));
    for (const s of a.sections || []) {
      (s.npcs || []).forEach(add(true));
      (s.creatures || []).forEach(add(true));
      (s.places || []).forEach(add(false));
      (s.items || s.objects || []).forEach(add(false));
    }
    out[a.id] = m;
  }
  return out;
})();

// The Compendium card a Chronicles card draws from, so shared cards live in one
// place. A card names the adventure card it borrows from with `ref`, else we
// match on the card's own name (exact, then a shared prefix/suffix, so the bible's
// "Tuviol" finds "Princess Tuviol"). Returns the source card or null.
function matchAdventureCard(item) {
  const target = item.link ? resolvePage(item.link) : null;
  if (!target || target.kind !== "adventure") return null;
  const m = ADVENTURE_CARDS[target.id];
  if (!m) return null;
  const key = normName(item.ref ?? item.name);
  if (m.has(key)) return m.get(key);
  for (const [name, card] of m) {
    const [short, long] = key.length <= name.length ? [key, name] : [name, key];
    if (short.length >= 4 && (long.startsWith(short) || long.endsWith(short))) return card;
  }
  return null;
}

// The image for a Chronicles card as { src, portrait, fit }, or null: the card's
// own image (the cold-plot and backstory figures no Compendium page holds), the
// matched adventure card's art, or a linked country page's first image (landscape).
function loreCardImage(item, match) {
  if (item.image) return { src: item.image, portrait: item.portrait ?? true, fit: item.fit };
  if (match?.src) return { src: match.src, portrait: match.portrait, fit: match.fit };
  const target = item.link ? resolvePage(item.link) : null;
  if (target && target.kind !== "adventure") {
    const src = entryImages[target.id];
    if (src) return { src, portrait: false, fit: undefined };
  }
  return null;
}

// The card types rendered under each adventure group, in order.
const LORE_TYPES = [
  { key: "people", label: "People" },
  { key: "places", label: "Places" },
  { key: "locations", label: "Locations" },
  { key: "items", label: "Items" },
  { key: "seeds", label: "Threads to the Spine" },
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

function LoreImage({ src, alt }) {
  if (!src) return null;
  return (
    <div className="lore-card__media">
      <img src={thumbSrc(src)} alt={alt} loading="lazy" onError={onThumbError(src)} />
    </div>
  );
}

// One Chronicles lore card, built from the Compendium's card so borrowed images
// fit the same way (2:3 portraits, 16:9 places). The card never navigates on its
// own: clicking the image opens it full size, and only the "view more" link goes
// to the Compendium page it shares a subject with.
function LoreCard({ item, onOpenPage, groupTarget, onLightbox }) {
  const match = matchAdventureCard(item);
  const img = loreCardImage(item, match);
  // Shared cards take their text from the adventure (single source of truth); a
  // card's own description is the fallback, used for the cold-plot subjects and
  // renamed figures no adventure card holds.
  const description = match?.description || item.description || "";
  const target = item.link ? resolvePage(item.link) : null;
  const linkable = target && onOpenPage;
  const sameAsGroup = groupTarget && target && groupTarget.kind === target.kind && groupTarget.id === target.id;
  const cls =
    "codex-card chron-card" +
    (img?.portrait ? " codex-card--portrait" : "") +
    (img?.fit === "contain" ? " codex-card--fit" : "") +
    (img ? " codex-card--split" : "");

  return (
    <article className={cls}>
      {img ? (
        <button
          className="codex-card__image-btn"
          onClick={() => onLightbox({ src: img.src, alt: item.name, caption: item.name })}
          aria-label={`View image of ${item.name}`}
        >
          <div className="codex-card__image-wrap">
            <img className="codex-card__image" src={thumbSrc(img.src)} alt={item.name} loading="lazy" onError={onThumbError(img.src)} />
          </div>
        </button>
      ) : (
        <div className="codex-card__image-wrap">
          <img className="codex-card__image codex-card__image--missing" src={IMAGE_MISSING} alt="" aria-hidden="true" />
        </div>
      )}
      <div className="codex-card__body">
        <span className="codex-card__kicker">{item.label}</span>
        <p className="codex-card__title">{item.name}</p>
        <p className="codex-card__summary">{description}</p>
        {linkable && !sameAsGroup && (
          <button className="codex-card__entry-link codex-card__entry-link--btn" onClick={() => onOpenPage(target)}>
            {target.kind === "adventure" ? "Read the adventure" : "Open in compendium"} ↗
          </button>
        )}
      </div>
    </article>
  );
}

function LoreGrid({ items, onOpenPage, groupTarget, onLightbox }) {
  return (
    <div className="country-detail__entries-grid">
      {items.map((item) => (
        <LoreCard key={item.name} item={item} onOpenPage={onOpenPage} groupTarget={groupTarget} onLightbox={onLightbox} />
      ))}
    </div>
  );
}

// Sidebar order: Watch (the videos), the general art Gallery, then Episode 0 and
// the road jobs.
const NAV_ITEMS = [
  { id: "watch", numeral: null, title: "Watch" },
  { id: "gallery", numeral: null, title: "Gallery" },
  ...ORDERED_GROUPS.map((g) => ({ id: g.id, numeral: g.numeral, title: g.title })),
];

function ContentHeader({ eyebrow, title }) {
  return (
    <>
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">{eyebrow}</p>
          <h2 className="country-detail__name">{title}</h2>
        </div>
      </div>
      <div className="country-detail__divider" />
    </>
  );
}

function WatchContent({ onSelect }) {
  const blocks = [
    { label: "Chapters", items: CHAPTERS },
    { label: "Episodes", items: EPISODES },
    { label: "Characters", items: CHARACTERS },
  ];
  return (
    <>
      <ContentHeader eyebrow="The Chronicles" title="Watch" />
      {blocks.map(({ label, items }) => (
        <div key={label} className="country-detail__block">
          <p className="location-panel__section-label">{label}</p>
          <MediaGrid items={items} onSelect={onSelect} />
        </div>
      ))}
    </>
  );
}

function GalleryContent({ onLightbox }) {
  return (
    <>
      <ContentHeader eyebrow="The Chronicles" title="Gallery" />
      <p className="country-detail__section-desc">
        Art from across the trio's road, not tied to any one job.
      </p>
      <div className="chron-gallery">
        {GALLERY.map((img) => (
          <button
            key={img.src}
            className="chron-gallery__thumb"
            onClick={() => onLightbox({ src: img.src, alt: img.title, caption: img.caption || img.title })}
            aria-label={`View ${img.title}`}
          >
            <img src={thumbSrc(img.src)} alt={img.title} loading="lazy" onError={onThumbError(img.src)} />
            {img.title && <span className="chron-gallery__caption">{img.title}</span>}
          </button>
        ))}
      </div>
    </>
  );
}

function GroupContent({ group, onOpenPage, onLightbox }) {
  const groupTarget = group.link ? resolvePage(group.link) : null;
  const title = group.numeral != null ? `${group.numeral}. ${group.title}` : group.title;
  return (
    <>
      <ContentHeader eyebrow="The Chronicles" title={title} />
      {group.blurb && <p className="country-detail__section-desc">{group.blurb}</p>}
      {groupTarget && onOpenPage && (
        <button className="chron-read-cta" onClick={() => onOpenPage(groupTarget)}>
          Read the adventure ↗
        </button>
      )}
      {LORE_TYPES.map(({ key, label }) =>
        group[key]?.length ? (
          <div key={key} className="country-detail__block">
            <p className="location-panel__section-label">{label}</p>
            <LoreGrid items={group[key]} onOpenPage={onOpenPage} groupTarget={groupTarget} onLightbox={onLightbox} />
          </div>
        ) : null
      )}
    </>
  );
}

export default function MediaSection({ onOpenPage }) {
  const [active, setActive] = useState(null); // open video, if any
  const [lightbox, setLightbox] = useState(null); // open image, if any
  // The story reads in order from its prequel, so Episode 0 (the backstory and
  // prologue) is the landing chapter.
  const [selected, setSelected] = useState("backstory");
  const group = ORDERED_GROUPS.find((g) => g.id === selected);

  return (
    <section id="chronicles" className="media-section">
      <div className="section-header">
        <p className="section-eyebrow">THE CHRONICLES</p>
        <h2 className="section-title">The Story So Far</h2>
        <p className="section-subtitle">
          Five road jobs, the trio who walk them, and the cold thread that runs beneath.
        </p>
      </div>

      <div className="compendium-layout">
        <aside className="compendium-sidebar">
          <nav className="compendium-nav">
            <div className="compendium-nav__section">
              <div className="compendium-nav__section-hd">
                <div className="compendium-nav__hd-title chron-nav__hd">
                  <span className="compendium-nav__sigil">❖</span>
                  <span className="compendium-nav__title">The Chronicles</span>
                </div>
              </div>
              <ul className="compendium-nav__list">
                {NAV_ITEMS.map((it) => (
                  <li key={it.id}>
                    <button
                      className={`compendium-nav__item chron-nav__item${selected === it.id ? " compendium-nav__item--active" : ""}`}
                      onClick={() => setSelected(it.id)}
                    >
                      <span className="chron-nav__num">{it.numeral ?? ""}</span>
                      <span>{it.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        <div className="compendium-main">
          {selected === "watch" ? (
            <WatchContent onSelect={setActive} />
          ) : selected === "gallery" ? (
            <GalleryContent onLightbox={setLightbox} />
          ) : (
            group && <GroupContent group={group} onOpenPage={onOpenPage} onLightbox={setLightbox} />
          )}
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
      {lightbox && <Lightbox images={[lightbox]} onClose={() => setLightbox(null)} />}
    </section>
  );
}
