import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import yaml from "js-yaml";
import { SECTIONS, videosBySection, videos as allVideos, allEntries } from "../data/videoData";
import { adventures, adventureGroups } from "../data/adventures";
import { adventuresByPin, adventuresByEntryId } from "../data/adventureLinks";
import { videosForPin, relatedVideosByVideo } from "../data/crossLinks";
import { thumbSrc, onThumbError, IMAGE_MISSING } from "../lib/thumb";
import { entryImages } from "../data/entryImages.generated";
import { portraitSlugs } from "../data/entryImagePortrait.generated";
import { entryImagesAll } from "../data/entryImagesAll.generated";
import { entryBlurbs } from "../data/entryBlurbs.generated";
import { crossRefs } from "../data/crossRefs.generated";
import { themes, themesBySlug, slugsByTheme, themeLabel } from "../data/compendiumTags";
import { sourcesBySlug } from "../data/sources";
import { resolvePage, geoPlaces } from "../data/compendiumPages";
import { extractImages, stripImages } from "../lib/markdown.js";
import { recordView, toggleBookmark, useIsBookmarked, useRecents, useBookmarks, useSeenKeys } from "../lib/library.js";
import Gazetteer from "./Gazetteer";
import ConnectionsGraph from "./ConnectionsGraph";

// ── Image utilities ───────────────────────────────────────────────────────
// A card image: shows the thumbnail, falls back to the full image if the
// thumbnail is missing. The full image is loaded by the lightbox / detail page.
function CardImage({ src, alt }) {
  // No image of its own: show the shared "image missing" placeholder so the card
  // keeps the same framed shape as the rest.
  if (!src)
    return (
      <img className="codex-card__image codex-card__image--missing" src={IMAGE_MISSING} alt="" aria-hidden="true" />
    );
  return (
    <img
      className="codex-card__image"
      src={thumbSrc(src)}
      alt={alt}
      loading="lazy"
      onError={onThumbError(src)}
    />
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const dialogRef = useRef(null);
  const img = images[idx];
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  // Move focus into the dialog on open, restore it to the trigger on close, so
  // keyboard users aren't stranded on the now-hidden card behind the overlay.
  useEffect(() => {
    const trigger = document.activeElement;
    dialogRef.current?.focus();
    return () => { if (trigger instanceof HTMLElement) trigger.focus(); };
  }, []);

  // Trap Tab within the dialog while it's open.
  const onTrapKey = (e) => {
    if (e.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className="lightbox__content"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={img.caption || img.alt || "Image viewer"}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onTrapKey}
      >
        <button className="lightbox__close" onClick={onClose} aria-label="Close image viewer">✕</button>
        <div className="lightbox__track">
          <button className="lightbox__arrow" onClick={prev} disabled={images.length === 1} aria-label="Previous image">‹</button>
          <img src={img.src} alt={img.alt} className="lightbox__image" />
          <button className="lightbox__arrow" onClick={next} disabled={images.length === 1} aria-label="Next image">›</button>
        </div>
        <div className="lightbox__footer">
          {img.caption && <p className="lightbox__caption">{img.caption}</p>}
          {images.length > 1 && (
            <div className="lightbox__dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`lightbox__dot${i === idx ? " lightbox__dot--active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === idx ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Image gallery ─────────────────────────────────────────────────────────
function ImageGallery({ images }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  return (
    <>
      <div className="image-gallery">
        {images.map((img, i) => (
          <button key={i} className="image-gallery__thumb" onClick={() => setLightboxIdx(i)}>
            <img src={thumbSrc(img.src)} alt={img.alt} />
            {img.caption && <span className="image-gallery__caption">{img.caption}</span>}
          </button>
        ))}
      </div>
      {lightboxIdx !== null && (
        <Lightbox images={images} startIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  );
}

// ── Card grid ───────────────────────────────────────────────────────────────
// Shared renderer for notable figures/places/items (CountryDetail) and an
// adventure's NPCs / Creatures / Places / Items (AdventureDetail). A card whose
// name (or explicit `entry`) resolves to another page becomes a link; if it also
// has an image, the image opens the lightbox and "View more" navigates. A card
// with a `videoId` (and onVideoSelect) plays the video. A card with no image of
// its own borrows the image of the page it links to. `excludeCountryId` stops a
// card linking back to the very country page it sits on. Renders nothing when empty.
// Card frame modifier for a picked image's orientation ({ portrait, square }).
// Portrait art gets a tall frame, square art a square frame; anything else uses
// the default widescreen frame. Portrait and square never both apply.
function orientClass(o) {
  if (o?.portrait) return " codex-card--portrait";
  if (o?.square) return " codex-card--square";
  return "";
}

function CardGrid({ label, items, portrait = false, onOpenPage, onVideoSelect, onLightbox, excludeCountryId }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="country-detail__block">
      <p className="location-panel__section-label">{label}</p>
      <div className="country-detail__entries-grid">
        {items.map((it, i) => {
          const cls = `codex-card${it.square ? " codex-card--square" : (it.portrait ?? portrait) ? " codex-card--portrait" : ""}${it.fit === "contain" ? " codex-card--fit" : ""}`;
          let target = resolvePage(it.entry ?? it.name);
          if (excludeCountryId && target && target.kind === "country" && target.id === excludeCountryId) target = null;
          const linkable = target && onOpenPage;
          const borrowed = target ? entryImages[toSlug(target.name)] : null;
          const cardImage = it.image ?? borrowed ?? null;
          // Suffix with the index: a grid can list two cards that resolve to the
          // same entry slug (e.g. two "Ogre" cards), so the slug alone collides.
          const key = `${it.entry ?? it.name ?? it.videoId ?? "card"}-${i}`;
          const imageWrap = (
            <div className="codex-card__image-wrap">
              <CardImage src={cardImage} alt={it.name} />
            </div>
          );
          const openLightbox = () => onLightbox([{ src: cardImage, alt: it.name, caption: it.name }]);

          // Both an image and a "View more" link: keep them independently
          // clickable - the image opens the lightbox, the link opens the entry.
          if (linkable && cardImage)
            return (
              <div key={key} className={`${cls} codex-card--split`}>
                <button className="codex-card__image-btn" onClick={openLightbox} aria-label={`View image of ${it.name}`}>
                  {imageWrap}
                </button>
                <div className="codex-card__body">
                  <p className="codex-card__title">{it.name}</p>
                  {it.description && <p className="codex-card__summary">{it.description}</p>}
                  <button className="codex-card__entry-link codex-card__entry-link--btn" onClick={() => onOpenPage(target)}>
                    View more ↗
                  </button>
                </div>
              </div>
            );

          const inner = (
            <>
              {imageWrap}
              <div className="codex-card__body">
                <p className="codex-card__title">{it.name}</p>
                {it.description && <p className="codex-card__summary">{it.description}</p>}
                {linkable && <span className="codex-card__entry-link">View more ↗</span>}
              </div>
            </>
          );
          if (linkable)
            return (
              <button key={key} className={`${cls} codex-card--link`} onClick={() => onOpenPage(target)}>
                {inner}
              </button>
            );
          if (it.videoId && onVideoSelect)
            return (
              <button key={key} className={cls} onClick={() => onVideoSelect(videoById[it.videoId] ?? { id: it.videoId, title: it.name })}>
                {inner}
              </button>
            );
          if (cardImage)
            return (
              <button key={key} className={cls} onClick={openLightbox}>
                {inner}
              </button>
            );
          return <div key={key} className={cls}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

// ── Library / sharing helpers ───────────────────────────────────────────────
// A stored library ref → an openable page target. Entry refs need their video/
// entry object rehydrated; country/adventure refs open by id alone.
function refToTarget(ref) {
  if (!ref) return null;
  if (ref.kind === "entry") {
    const entry = videoById[ref.id] ?? allEntries.find((v) => v.id === ref.id) ?? null;
    return entry ? { kind: "entry", id: ref.id, entry, name: ref.name ?? entry.name } : null;
  }
  return { kind: ref.kind, id: ref.id, name: ref.name };
}

// A shareable deep-link URL for a page target (mirrors App.jsx's param scheme).
function pageUrl(target) {
  const url = new URL(window.location.origin + window.location.pathname);
  if (target.kind === "country") url.searchParams.set("country", target.id);
  else if (target.kind === "adventure") url.searchParams.set("adventure", target.id);
  else if (target.kind === "entry") url.searchParams.set("ce", target.id);
  url.hash = "catalog";
  return url.href;
}

// Bookmark + copy-link actions shown in every detail header.
function PageActions({ target }) {
  const ref = { kind: target.kind, id: target.id, name: target.name };
  const bookmarked = useIsBookmarked(ref);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl(target));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked - no-op */ }
  };
  return (
    <div className="page-actions">
      <button
        className={`page-action${bookmarked ? " page-action--on" : ""}`}
        onClick={() => toggleBookmark(ref)}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
      >
        {bookmarked ? "★ Saved" : "☆ Save"}
      </button>
      <button className="page-action" onClick={copy} aria-label="Copy link to this page">
        {copied ? "✓ Copied" : "🔗 Link"}
      </button>
    </div>
  );
}

const sectionLabelFor = (id) =>
  SECTION_LABEL[id] ?? (id === "adventures" ? "Adventures" : id === "geography" ? "Geography" : id);

// Breadcrumb trail for a detail view or a hub. The root "Compendium" crumb
// returns to the landing; section/group crumbs link to their hubs (so on a
// dragon page, "Creatures" and "Dragons" jump to those hubs); the leaf is the
// current page or hub. Each crumb is { label, go } where go is null for the
// current location.
function Breadcrumbs({ entry, country, adventure, hub, onHome, onOpenPage, onOpenHub }) {
  const crumbs = [];
  const sectionCrumb = (secId) => ({ label: sectionLabelFor(secId), go: () => onOpenHub(secId) });
  // A group crumb that names an actual page (e.g. "Beyural") links to that page;
  // otherwise it opens the group hub.
  const groupCrumb = (secId, group) => {
    const page = resolvePage(group);
    return { label: group, go: page ? () => onOpenPage(page) : () => onOpenHub(secId, group) };
  };

  if (hub) {
    if (hub.group == null) {
      crumbs.push({ label: sectionLabelFor(hub.section), go: null });
    } else {
      crumbs.push(sectionCrumb(hub.section));
      crumbs.push({ label: hub.group, go: null });
    }
  } else if (entry) {
    crumbs.push(sectionCrumb(entry.section));
    if (entry.group && !skipGroup(entry.group, entry.section)) crumbs.push(groupCrumb(entry.section, entry.group));
    crumbs.push({ label: entry.name, go: null });
  } else if (country) {
    crumbs.push(sectionCrumb("geography"));
    const cont = CONTINENTS.find((c) => c.id === country.continent);
    if (cont) crumbs.push({ label: cont.name, go: () => onOpenHub("geography", cont.name) });
    crumbs.push({ label: country.name, go: null });
  } else if (adventure) {
    crumbs.push(sectionCrumb("adventures"));
    const grp = adventureGroups.groups.find((g) => g.adventures.some((a) => a.id === adventure.id));
    if (grp) crumbs.push({ label: grp.name, go: () => onOpenHub("adventures", grp.name) });
    else if (adventureGroups.standalone.some((a) => a.id === adventure.id)) crumbs.push({ label: "Standalone", go: () => onOpenHub("adventures", "Standalone") });
    crumbs.push({ label: adventure.title, go: null });
  } else {
    return null;
  }

  const lastI = crumbs.length - 1;
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <button className="breadcrumbs__crumb breadcrumbs__crumb--link" onClick={onHome}>Compendium</button>
      {crumbs.map((c, i) => {
        const current = i === lastI;
        return (
          <span key={i} className="breadcrumbs__seg">
            <span className="breadcrumbs__sep" aria-hidden="true">›</span>
            {c.go && !current ? (
              <button className="breadcrumbs__crumb breadcrumbs__crumb--link" onClick={c.go}>{c.label}</button>
            ) : (
              <span
                className={`breadcrumbs__crumb${current ? " breadcrumbs__crumb--current" : ""}`}
                aria-current={current ? "page" : undefined}
              >
                {c.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// A "Sources" credit line: the book(s) / Sinkadus issue(s) a page draws on.
function SourceCredit({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <p className="source-credit">
      <span className="source-credit__label">{sources.length > 1 ? "Sources" : "Source"}</span>
      {sources.map((s, i) => (
        <span key={i} className="source-credit__item">{s}</span>
      ))}
    </p>
  );
}

const REF_KIND_WORD = { country: "Land", adventure: "Adventure", entry: "Lore" };

// A row of cards for a list of library refs (recently-viewed / bookmarks).
function RefStrip({ label, refs, onOpen }) {
  const targets = refs.map(refToTarget).filter(Boolean);
  if (targets.length === 0) return null;
  return (
    <div className="country-detail__block">
      <p className="location-panel__section-label">{label}</p>
      <div className="country-detail__entries-grid">
        {targets.map((t) => (
          <button key={`${t.kind}-${t.id}`} className="codex-card codex-card--link" onClick={() => onOpen(t)}>
            <div className="codex-card__body">
              <p className="codex-card__title">{t.name}</p>
              <span className="codex-card__entry-link">{REF_KIND_WORD[t.kind] ?? "Lore"} ↗</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Hub view (section / group browse) ───────────────────────────────────────
// A visual index of a section (its groups as cards) or a group (its pages as
// image cards). Drilled into from the nav headers and the landing's section
// grid; reuses entryImages for art and resolvePage to open each page. geoGroups
// (computed in the main component) is passed in since this is a sibling.
function HubView({ hub, geoGroups, onOpenHub, onOpenPage }) {
  const { section, group } = hub;
  const sigil = section === "adventures" ? "❖" : (SECTIONS.find((s) => s.id === section)?.sigil ?? "◈");
  const label = sectionLabelFor(section);
  // One random salt per hub-visit: keeps each card's pick stable while you
  // browse, but re-rolls the art when you open a different hub or reload.
  // HubView is keyed on the hub (see parent), so a new hub remounts it and the
  // lazy initializer re-runs - giving fresh art each visit without flicker.
  const [imgSalt] = useState(() => Math.floor(Math.random() * 0x7fffffff));

  // Normalize the section into named groups + a flat bucket of ungrouped pages.
  const named = [];
  const flat = [];
  if (section === "adventures") {
    for (const g of adventureGroups.groups) named.push({ name: g.name, items: g.adventures.map((a) => ({ name: a.title })) });
    if (adventureGroups.standalone.length) named.push({ name: "Standalone", items: adventureGroups.standalone.map((a) => ({ name: a.title })) });
  } else if (section === "geography") {
    for (const g of geoGroups) {
      const items = [...g.countries.map((c) => ({ name: c.name })), ...g.videos.map((v) => ({ name: v.name }))];
      if (g.name) named.push({ name: g.name, items });
      else flat.push(...items);
    }
  } else {
    for (const g of videosBySection[section] ?? []) {
      const items = g.videos.map((v) => ({ name: v.name }));
      if (g.group && !skipGroup(g.group, section)) named.push({ name: g.group, items });
      else flat.push(...items);
    }
  }

  // A random representative image for a group card: pick a random page in the
  // group that has art, then a random image from it. Returns { src, portrait }.
  const repChoice = (groupName, items) => {
    const cands = items.map((it) => toSlug(it.name)).filter((s) => entryImagesAll[s]?.length);
    if (cands.length === 0) return null;
    const slug = cands[hashStr("grp:" + groupName, imgSalt) % cands.length];
    return pickEntryImage(slug, imgSalt);
  };

  // Whole-card-clickable page cards (bestiary-style browse). A plain render
  // helper (not a component) so it isn't re-created on every render.
  const renderPageCards = (items) =>
    items.length === 0 ? null : (
      <div className="country-detail__entries-grid">
        {items.map((it, i) => {
          const target = resolvePage(it.entry ?? it.name);
          const slug = target ? toSlug(target.name) : toSlug(it.name);
          const choice = pickEntryImage(slug, imgSalt);
          const img = choice?.src ?? entryImages[slug] ?? null;
          const blurb = entryBlurbs[slug] || null;
          const cls = `codex-card codex-card--link hub-card${choice ? orientClass(choice) : portraitSlugs.has(slug) ? " codex-card--portrait" : ""}`;
          return (
            <button
              key={`${target ? `${target.kind}-${target.id}` : it.name}-${i}`}
              className={cls}
              onClick={() => target && onOpenPage(target)}
              disabled={!target}
            >
              <div className="codex-card__image-wrap">
                <CardImage src={img} alt={it.name} />
              </div>
              <div className="codex-card__body">
                <p className="codex-card__title">{it.name}</p>
                {blurb && <p className="codex-card__summary">{blurb}</p>}
              </div>
            </button>
          );
        })}
      </div>
    );

  // Group hub: one group's pages.
  if (group) {
    const g = named.find((x) => x.name === group);
    const items = g ? g.items : flat;
    return (
      <div className="country-detail">
        <div className="country-detail__header">
          <div className="country-detail__header-text">
            <p className="country-detail__eyebrow">{label}</p>
            <h2 className="country-detail__name">{group}</h2>
          </div>
        </div>
        <div className="country-detail__divider" />
        <div className="country-detail__block">
          <p className="location-panel__section-label">{items.length} {items.length === 1 ? "page" : "pages"}</p>
          {renderPageCards(items)}
        </div>
      </div>
    );
  }

  // Section hub: group cards, then any ungrouped pages.
  const total = named.reduce((n, g) => n + g.items.length, 0) + flat.length;
  return (
    <div className="country-detail">
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">The Compendium</p>
          <h2 className="country-detail__name">{label}</h2>
        </div>
      </div>
      <div className="country-detail__divider" />
      {named.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">{named.length} groups · {total} pages</p>
          <div className="country-detail__entries-grid">
            {named.map((g) => {
              const choice = repChoice(g.name, g.items);
              const img = choice?.src ?? null;
              const cls = `codex-card codex-card--link hub-card${orientClass(choice)}`;
              return (
                <button key={g.name} className={cls} onClick={() => onOpenHub(section, g.name)}>
                  <div className="codex-card__image-wrap">
                    {img ? <CardImage src={img} alt={g.name} /> : <span className="codex-card__placeholder">{sigil}</span>}
                  </div>
                  <div className="codex-card__body">
                    <p className="codex-card__title">{g.name}</p>
                    <span className="codex-card__entry-link">{g.items.length} {g.items.length === 1 ? "page" : "pages"} ↗</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {flat.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">{named.length ? "Other pages" : `${flat.length} pages`}</p>
          {renderPageCards(flat)}
        </div>
      )}
    </div>
  );
}

// ── Data setup ────────────────────────────────────────────────────────────
const videoById = Object.fromEntries(allVideos.map((v) => [v.id, v]));

const locationModules = import.meta.glob("../data/locations/*.js");
const markdownModules = import.meta.glob("../data/compendium/**/*.md", { query: "?raw", import: "default" });

const CONTINENTS = [
  { id: "akrogal",      name: "Akrogal"         },
  { id: "ereb",         name: "Ereb"             },
  { id: "samkarna",     name: "Samkarna"         },
  { id: "soluna",       name: "Soluna"           },
  { id: "serpent-lake", name: "Serpent Lake"     },
  { id: "western-sea",  name: "The Western Sea"  },
];

const placeKind = (pin) => {
  const t = pin.type || "place";
  return t === "country" ? "Country" : t[0].toUpperCase() + t.slice(1);
};

const SECTION_LABEL = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label]));

// Sections that can back a browse hub, for validating a ?hub= URL param on load.
const HUB_SECTIONS = new Set(["adventures", "geography", ...SECTIONS.map((s) => s.id)]);

// Read a valid { section, group } hub from the current URL, or null. An open
// entry (?ce=) takes the main panel, so a hub is ignored while one is set.
function hubFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("ce")) return null;
  const section = params.get("hub");
  if (!section || !HUB_SECTIONS.has(section)) return null;
  return { section, group: params.get("hubg") || null };
}

// The full set of navigable Compendium pages (section entries + lands +
// adventures), as "kind-id" keys - the denominator for reading-progress.
const PAGE_UNIVERSE = (() => {
  const ks = new Set();
  for (const v of allEntries) if (v.section !== "countries" && v.section !== "episodes") ks.add(`entry-${v.id}`);
  for (const p of geoPlaces) ks.add(`country-${p.id}`);
  for (const a of adventures) ks.add(`adventure-${a.id}`);
  return ks;
})();
const TOTAL_PAGES = PAGE_UNIVERSE.size;

// Geography sub-places (parent set) that nest under their parent country in the
// nav: parent country id → [child geo entries].
const geoChildrenByParent = (() => {
  const m = {};
  for (const g of videosBySection["geography"] || [])
    for (const v of g.videos) if (v.parent) (m[v.parent] ??= []).push(v);
  return m;
})();

// Section entries (Peoples/Creatures/…) that nest under a parent page of the
// same section (e.g. cave-orcs under orc): parent slug → [child entries]. The
// nav renders these indented beneath the parent and drops them from the flat list.
const childrenByParentSlug = (() => {
  const m = {};
  for (const [sec, groups] of Object.entries(videosBySection)) {
    if (sec === "geography") continue; // geography handled separately above
    for (const g of groups) for (const v of g.videos) if (v.parent) {
      (m[v.parent] ??= []).push(v);
    }
  }
  for (const arr of Object.values(m)) arr.sort((a, b) => a.name.localeCompare(b.name));
  return m;
})();

// ── Path helpers ──────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function skipGroup(group, section) {
  if (!group) return true;
  const g = group.toLowerCase(), s = section.toLowerCase();
  return g === s || g + "s" === s || g === s + "s";
}

// Seeded random image pick for browse cards. A page often has several images;
// instead of always borrowing the first, choose one by hashing the slug with a
// per-visit salt. Same salt + slug → same pick, so cards stay put across
// re-renders (no flicker); a fresh salt on the next visit re-rolls the art.
function hashStr(str, salt) {
  let h = salt >>> 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
// Returns { src, portrait } for a random image on the page, or null. `key`
// (defaults to slug) diversifies the roll when a card represents a group.
function pickEntryImage(slug, salt, key = slug) {
  const all = entryImagesAll[slug];
  if (!all || all.length === 0) return null;
  return all[hashStr(key, salt) % all.length];
}
function entryMdPath(entry) {
  const sec  = entry.section[0].toUpperCase() + entry.section.slice(1);
  const slug = toSlug(entry.name);
  return skipGroup(entry.group, entry.section)
    ? `${sec}/${slug}.md`
    : `${sec}/${entry.group}/${slug}.md`;
}


// Curated "Related" links for entries not captured structurally — chiefly the
// three live conflicts, which tie to their belligerent lands and the adventures
// that dramatize them. Keyed by the entry's name-slug; values are slugs the
// resolver turns into country / adventure / entry pages.
const RELATED_BY_SLUG = {
  "felicien-pirate-war": ["felicien", "erebos", "berendien", "caddo", "hynsolge"],
  "ransard-prepares": ["ransard", "trakorien"],
  "nidland-purification": ["nidland", "cereval", "the-hell-fort", "melindors-return", "the-final-battle", "haktahchas-arrival"],
  // The Burned Earth Clan and its member tribes link to one another.
  "burned-earth-clan": ["lunorgh-kah", "rulgh-borgnag", "urgh-grobb", "grogol-gribb", "gylk-lobbnack", "ylkor-kha-oggra", "grokashak-oggra", "kallakadak-yldrokk", "dekkadorel-gnubbt"],
  "lunorgh-kah": ["burned-earth-clan"],
  "rulgh-borgnag": ["burned-earth-clan"],
  "urgh-grobb": ["burned-earth-clan"],
  "grogol-gribb": ["burned-earth-clan"],
  "gylk-lobbnack": ["burned-earth-clan"],
  "ylkor-kha-oggra": ["burned-earth-clan"],
  "grokashak-oggra": ["burned-earth-clan"],
  "kallakadak-yldrokk": ["burned-earth-clan"],
  "dekkadorel-gnubbt": ["burned-earth-clan"],
  // The schools of magic and the magical phenomena from the Mage's Handbook.
  "animism": ["elemental", "mentalism"],
  "elemental": ["animism", "mentalism"],
  "mentalism": ["animism", "elemental", "necromancy"],
  "necromancy": ["mentalism", "dark-magic", "familiars", "tamanrasset", "kenvadsin-laogeraftjan", "revenant"],
  "dark-magic": ["necromancy"],
  // The necromancers drawn from the Necromancy archive feature: the goblin
  // book-thief and the mild interpreter who hides his claws.
  "tamanrasset": ["necromancy", "kenvadsin-laogeraftjan", "goblin"],
  "kenvadsin-laogeraftjan": ["necromancy", "erebos", "tamanrasset", "familiars"],
  // The Brotherhood of the Red Fish and its worked example, the thief whose
  // botched job opens The Stolen Elephant.
  "the-brotherhood-of-the-red-fish": ["naurudun", "hynsolge", "demonology"],
  "naurudun": ["the-brotherhood-of-the-red-fish", "hynsolge"],
  // The land of Jih-pun and the creatures and peoples of its bestiary.
  "tatsu": ["jih-pun", "orochi", "kumo", "mi", "mukade"],
  "kappa": ["jih-pun", "orochi"],
  "rokurokubi": ["jih-pun", "shutendoji"],
  "shutendoji": ["jih-pun", "rokurokubi", "uba"],
  "kumo": ["jih-pun", "tatsu", "mi", "shikome"],
  "uba": ["jih-pun", "shutendoji"],
  "orochi": ["jih-pun", "tatsu", "kappa"],
  "gaki": ["jih-pun", "shura"],
  "mi": ["jih-pun", "tatsu", "mukade", "kumo"],
  "mukade": ["jih-pun", "tatsu", "mi"],
  "nymph": ["jih-pun"],
  "shishi": ["jih-pun"],
  "shura": ["jih-pun", "gaki"],
  "tako": ["jih-pun", "giant-octopus"],
  "hengeyokai": ["jih-pun", "kojin"],
  "kojin": ["jih-pun", "shark-man", "hengeyokai"],
  "shikome": ["jih-pun", "orc", "kumo"],
  // The two human peoples of Jih-pun: the islanders and the natives they displaced.
  "jih-mono": ["jih-pun", "ainu"],
  "ainu": ["jih-pun", "jih-mono"],
  // The oni of Jih-pun and the oni-prince who schemes from the Fire-Peak.
  "oni": ["jih-pun", "ozuno", "shutendoji"],
  "ozuno": ["oni", "jih-pun"],
  // From Sinkadus 19: the deep-dwelling water elves and the dwarves' building art.
  "water-elf": ["sea-elf", "grey-elf", "shark-man"],
  "dwarven-architecture": ["dwarf", "craft-guilds"],
  // From Sinkadus 18: the dwarves' brewing, and the seven roads to immortality.
  "drinks-of-ereb": ["dwarf", "trade", "craft-guilds"],
  "the-exalted": ["the-dragon-masters", "the-gods", "the-world-of-altor"],
  // From Sinkadus 16: the persona and craft of magicians, and the seers' arts.
  "the-ways-of-magicians": ["the-aspects-of-magic", "familiars", "magical-symbols"],
  "divination": ["the-shaul-deck", "constellations", "the-ways-of-magicians"],
  // From Sinkadus 15: the elven nature, the cat-folk, and the goblins (vättar).
  "elves": ["wood-elf", "high-elf", "the-gods", "animism"],
  "catpeople": ["elves"],
  "goblin": ["dwarf", "cave-elf", "tamanrasset", "dwarven-architecture"],
  // From Sinkadus 13: the self-willed undead a necromancer makes of himself,
  // and the herb-lore of Jih-pun.
  "revenant": ["necromancy", "vampire", "death-knight", "zombie"],
  "herbs-of-jih-pun": ["jih-pun", "drinks-of-ereb"],
  // From Sinkadus 11: the mercenary captain shaped by the Sulphur Winter.
  "sebastian-marol": ["zorakin", "marjura", "sulphur-winter"],
  "the-black-water": ["ley-lines-and-magic-dead-lands", "the-bane-storm"],
  "the-bane-storm": ["necromancy", "dark-magic", "the-black-water"],
  "the-city-of-angels": ["death-angel", "the-world-of-altor"],
  "ley-lines-and-magic-dead-lands": ["dark-magic", "the-black-water"],
  // The Multiverse, Demonicum and its Guardians, and the art of demonology
  // (from the Kaos Väktare supplement).
  "the-multiverse": ["demonicum", "the-grey-halls", "inferno", "dimension-travel", "the-gods", "the-world-of-altor"],
  "the-grey-halls": ["the-multiverse", "demonicum", "dimension-travel", "demonology"],
  "demonicum": ["the-multiverse", "the-grey-halls", "inferno", "nehcrom", "bemoth", "caliban", "demonology"],
  "inferno": ["demonicum", "the-multiverse", "dimension-travel", "demonology"],
  "dimension-travel": ["inferno", "the-multiverse", "demonicum", "the-grey-halls", "demonology"],
  "nehcrom": ["demonicum", "bemoth", "caliban", "azoth", "demonic-artifacts"],
  "bemoth": ["demonicum", "nehcrom", "caliban", "animism", "karnack", "nerocq"],
  "caliban": ["demonicum", "nehcrom", "bemoth", "khurun", "darubah", "feot"],
  "demonology": ["demonicum", "the-grey-halls", "necromancy", "dark-magic", "demon-prince", "demonic-artifacts"],
  // Named demons of Demonicum and the demonic artifacts (Kaos Väktare).
  "azoth": ["nehcrom", "demonicum"],
  "karnack": ["bemoth", "demonicum", "nerocq"],
  "nerocq": ["bemoth", "demonicum", "karnack"],
  "darubah": ["caliban", "demonicum", "khurun"],
  "feot": ["caliban", "demonicum", "khurun"],
  "khurun": ["caliban", "demonicum", "darubah"],
  "fire-demon": ["demonicum", "ice-demon"],
  "ice-demon": ["demonicum", "fire-demon"],
  "knowledge-demon": ["demonicum"],
  // The four forerunners of the apocalyptic Riders (Sinkadus 32).
  "stilakor": ["evolakasa", "aryxamast", "kalembri"],
  "evolakasa": ["stilakor", "aryxamast", "kalembri"],
  "aryxamast": ["stilakor", "evolakasa", "kalembri"],
  "kalembri": ["stilakor", "evolakasa", "aryxamast"],
  "demonic-artifacts": ["demonology", "demonicum", "nehcrom", "bemoth", "soul-bound-weapons"],
  // The Warrior's Handbook: soul-bound weapons and the weapon-academies.
  "soul-bound-weapons": ["notable-magic-items", "demonic-artifacts", "demonology", "demon-prince"],
  "notable-magic-items": ["soul-bound-weapons", "demonic-artifacts"],
  "weapon-academies": ["cereval", "jorduashur", "ice-demon", "jih-pun"],
  // Thieves & Assassins: the underworld guilds and crime.
  "kharynos": ["felicien", "nidland", "the-underworld-guilds"],
  "the-blood-spattered-feather": ["the-underworld-guilds", "black-duck", "rhobdorana"],
  "the-underworld-guilds": ["kharynos", "the-blood-spattered-feather", "rhobdorana", "crime-and-punishment"],
  "crime-and-punishment": ["the-underworld-guilds"],
  "rhobdorana": ["the-underworld-guilds", "the-blood-spattered-feather"],
  // Hjältarnas Handbok: the nature of heroism (ties to the gods' game).
  "heroes": ["the-gods", "demonicum", "dark-magic"],
  // Krilloan campaign book: the ruling order, the demon-cults, their goddess.
  "ordo-magica": ["krilloan", "tannatopol", "demonology"],
  "the-oktagon": ["imaria", "the-heavenly-bodies", "montures", "krilloan", "demonology"],
  "imaria": ["the-oktagon", "montures", "krilloan"],
  // Eledain, the god of light and stars, and his one knightly order the
  // Brotherhood of the Eternally Shining Star (the Knights of Eledain), who
  // appear both in the Path of Honor and at the Skeleton Village.
  "eledain": ["the-brotherhood-of-the-eternally-shining-star", "the-gods"],
  "the-brotherhood-of-the-eternally-shining-star": ["eledain", "the-gods"],
  // The Magic rulebook: the further schools, the aspect framework, divination.
  "the-aspects-of-magic": ["animism", "elemental", "mentalism", "the-multiverse", "the-ways-of-magicians"],
  "dragon-magic": ["mentalism", "illusionism", "symbolism", "the-dragon-masters"],
  "illusionism": ["mentalism", "dragon-magic", "symbolism"],
  "symbolism": ["mentalism", "dragon-magic", "illusionism"],
  "staff-magic": ["the-aspects-of-magic", "notable-magic-items"],
  "harmonism": ["voice-magic", "the-aspects-of-magic"],
  "voice-magic": ["harmonism", "the-aspects-of-magic"],
  "spiritism": ["demonology", "necromancy", "the-aspects-of-magic"],
  "alchemy": ["notable-magic-items", "the-aspects-of-magic"],
  "magic-nodes-and-storms": ["the-bane-storm", "ley-lines-and-magic-dead-lands", "dark-magic"],
  "the-shaul-deck": ["ordo-magica", "the-heavenly-bodies"],
  "familiars": ["witchcraft", "spiritism", "animism", "the-ways-of-magicians"],
  // Worldbuilding lore cross-links.
  "coins-and-measures": ["trade"],
  "trade": ["coins-and-measures", "craft-guilds"],
  "craft-guilds": ["trade", "weapon-academies", "coins-and-measures"],
  // The dragon-masters: their title, their chronicle, and the karkion who began it.
  "the-dragon-masters": ["cereval", "karkion", "dragon-magic", "the-exalted"],
  // The Cauldron of Bitterness, and the dragon-haunted swordsman Arn.
  "khab-hemi": ["the-crown-jewels", "meh-zadrias-pillar", "the-black-water"],
  "arn-dunkelbrink": ["marjura", "trakorien", "the-oracles-four-eyes"],
  // Trolls and their goddess; Nohstril's catacombs and the society that dug them.
  "troll": ["slergolis", "cave-troll", "forest-troll", "ogre"],
  "slergolis": ["troll"],
  "ordo-nova": ["nohstril", "the-catacombs-of-nohstril", "erebos"],
  "the-catacombs-of-nohstril": ["nohstril", "ordo-nova", "erebos"],
  // The Jorpagnan empire, its fall, and the lands that founded it.
  "jorpagna-empire": ["the-fall-of-jorpagna", "grafferburg", "hynsolge", "jorpagna", "karkion"],
  "karkion": ["jorpagna-empire", "the-dragon-masters"],
  "the-fall-of-jorpagna": ["jorpagna-empire", "jorpagna"],
  "grafferburg": ["jorpagna-empire", "the-fall-of-jorpagna"],
  // Marjura, the sulphur isle, and the heretic city cast onto it from Yndar.
  "krau-ki": ["marjura", "trakorien"],
  // Eshwan Theard's hammer, and House Festglade of Nohstril and its demons.
  "the-hammer-of-eshwan-theard": ["soul-bound-weapons", "notable-magic-items"],
  "house-festglade": ["nohstril", "erebos", "the-catacombs-of-nohstril", "ordo-nova", "echram-schroedel"],
  "echram-schroedel": ["nohstril", "house-festglade"],
  "witchcraft": ["animism", "necromancy", "familiars", "the-aspects-of-magic"],
};

// ── CountryDetail ─────────────────────────────────────────────────────────
function CountryDetail({ country, onPinSelect, onVideoSelect, onOpenPage }) {
  const [locationData, setLocationData] = useState(null);
  const [markdown, setMarkdown] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLocationData(null);
    setMarkdown(null);
    const locKey = `../data/locations/${country.id}.js`;
    const locLoader = locationModules[locKey];
    if (!locLoader) { setLocationData({}); setMarkdown(""); return; }
    locLoader()
      .then((m) => {
        setLocationData(m.default);
        if (m.default.detail) {
          const mdKey = `../data/compendium/${m.default.detail}`;
          const mdLoader = markdownModules[mdKey];
          if (mdLoader) {
            mdLoader().then((md) => setMarkdown(md)).catch(() => setMarkdown(""));
          } else {
            setMarkdown("");
          }
        } else {
          setMarkdown("");
        }
      })
      .catch(() => { setLocationData({}); setMarkdown(""); });
  }, [country.id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- record on id change only
  useEffect(() => { recordView({ kind: "country", id: country.id, name: country.name }); }, [country.id]);

  // Compendium pages whose prose names this place (from the generated cross-ref
  // index), shown as "tied to this land". Entries only (not other lands/adventures).
  const tiedPages = useMemo(() => [
    ...new Set([...(crossRefs.backlinks[toSlug(country.name)] ?? []), ...(crossRefs.backlinks[country.id] ?? [])]),
  ]
    .map(resolvePage)
    .filter((p) => p && p.kind === "entry")
    .filter((p, i, a) => a.findIndex((q) => q.id === p.id) === i)
    .slice(0, 18),
  [country.id, country.name]);
  const pinVideos = videosForPin[country.id] ?? [];
  const mainVideo = locationData?.youtubeId
    ? (videoById[locationData.youtubeId] ?? { id: locationData.youtubeId, title: `Chronicle: ${country.name}` })
    : null;
  const relatedVideos = pinVideos.filter((v) => v.id !== locationData?.youtubeId);

  const loaded = locationData !== null && markdown !== null;
  // The page md may carry a YAML frontmatter block of notable figures/places/items.
  // Parse it (and split the prose body off) only when the markdown changes - not on
  // every render (e.g. opening the lightbox), which would re-run yaml.load each time.
  const { figures, notablePlaces, notableItems, images, bodyText } = useMemo(() => {
    const fm = markdown && markdown.startsWith("---")
      ? markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
      : null;
    let meta = {};
    if (fm) { try { meta = yaml.load(fm[1]) ?? {}; } catch { meta = {}; } }
    const body = fm ? fm[2] : (markdown ?? "");
    return {
      figures: meta.figures ?? [],
      notablePlaces: meta.places ?? [],
      notableItems: meta.items ?? [],
      images: body ? extractImages(body) : [],
      bodyText: body ? stripImages(body).replace(/^#[^\n]*\n/, "").trim() : "",
    };
  }, [markdown]);

  return (
    <div className="country-detail">
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">{placeKind(country)}</p>
          <h2 className="country-detail__name">{country.name}</h2>
          {country.tagline && <p className="country-detail__tagline">"{country.tagline}"</p>}
        </div>
        <div className="country-detail__header-actions">
          <button className="country-detail__map-btn" onClick={() => onPinSelect(country.id)}>
            View on Map ↗
          </button>
          <PageActions target={{ kind: "country", id: country.id, name: country.name }} />
        </div>
      </div>

      <div className="country-detail__divider" />

      {!loaded && <p className="country-detail__loading">Consulting the codex…</p>}

      {loaded && images.length > 0 && <ImageGallery images={images} />}

      {loaded && locationData.description && (
        <p className="country-detail__description">{locationData.description}</p>
      )}

      {loaded && bodyText && (
        <div className="country-detail__body">
          <ReactMarkdown>{bodyText}</ReactMarkdown>
        </div>
      )}

      {loaded && <CardGrid label="Notable Figures" items={figures} portrait onOpenPage={onOpenPage} onLightbox={setLightbox} excludeCountryId={country.id} />}
      {loaded && <CardGrid label="Notable Places" items={notablePlaces} onOpenPage={onOpenPage} onLightbox={setLightbox} excludeCountryId={country.id} />}
      {loaded && <CardGrid label="Notable Items" items={notableItems} onOpenPage={onOpenPage} onLightbox={setLightbox} excludeCountryId={country.id} />}

      {(adventuresByPin[country.id] ?? []).length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Adventures set here</p>
          <div className="country-detail__entries-grid">
            {adventuresByPin[country.id].map((a) => (
              <button
                key={a.id}
                className="codex-card codex-card--link"
                onClick={() => onOpenPage({ kind: "adventure", id: a.id })}
              >
                <div className="codex-card__body">
                  <p className="codex-card__title">{a.title}</p>
                  {a.tagline && <p className="codex-card__summary">{a.tagline}</p>}
                  <span className="codex-card__entry-link">View more ↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tiedPages.length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">People, creatures &amp; lore of this land</p>
          <div className="country-detail__entries-grid">
            {tiedPages.map((t) => (
              <button
                key={`${t.kind}-${t.id}`}
                className="codex-card codex-card--link"
                onClick={() => onOpenPage(t)}
              >
                <div className="codex-card__body">
                  <p className="codex-card__title">{t.name}</p>
                  <span className="codex-card__entry-link">Lore ↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loaded && mainVideo && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Chronicle</p>
          <button
            className="location-panel__watch-btn"
            onClick={() => onVideoSelect(mainVideo)}
            aria-label={`Watch ${mainVideo.title}`}
          >
            <img
              src={`https://img.youtube.com/vi/${mainVideo.id}/mqdefault.jpg`}
              alt={mainVideo.title}
              loading="lazy"
            />
            <div className="location-panel__watch-overlay">
              <span className="location-panel__watch-play">▶</span>
              <span className="location-panel__watch-label">Watch</span>
            </div>
          </button>
        </div>
      )}

      {loaded && relatedVideos.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Related Videos</p>
          <div className="location-panel__video-strip">
            {relatedVideos.map((video) => (
              <button
                key={video.id}
                className="location-panel__video-thumb"
                onClick={() => onVideoSelect(video)}
                title={video.name}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.name}
                  loading="lazy"
                />
                <div className="location-panel__video-thumb-overlay">▶</div>
                <span className="location-panel__video-thumb-label">{video.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loaded && !mainVideo && relatedVideos.length === 0 && images.length === 0 && !bodyText && (
        <p className="country-detail__empty">Details coming soon.</p>
      )}

      {loaded && <SourceCredit sources={sourcesBySlug[toSlug(country.name)] ?? sourcesBySlug[country.id]} />}

      {lightbox && (
        <Lightbox images={lightbox} startIdx={0} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// ── EntryDetail ───────────────────────────────────────────────────────────
function EntryDetail({ entry, onVideoSelect, onBack, backLabel, onOpenPage, onThemeSelect, onPinSelect }) {
  const [markdown, setMarkdown] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before async load (keyed by entry.id)
    setMarkdown(null);
    const mdKey = `../data/compendium/${entryMdPath(entry)}`;
    const mdLoader = markdownModules[mdKey];
    if (mdLoader) {
      mdLoader().then((md) => setMarkdown(md)).catch(() => setMarkdown(""));
    } else {
      setMarkdown("");
    }
  }, [entry]);

  useEffect(() => { recordView({ kind: "entry", id: entry.id, name: entry.name }); }, [entry.id, entry.name]);

  const loaded = markdown !== null;
  // Some entry pages (e.g. the flying-island Caranor) carry a YAML frontmatter
  // block of notable figures/places/items, like country pages do. Parse and
  // strip it so the raw YAML never renders, and surface the cards below.
  const { images, bodyText, figures, notablePlaces, notableItems } = useMemo(() => {
    const fm = markdown && markdown.startsWith("---")
      ? markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
      : null;
    let meta = {};
    if (fm) { try { meta = yaml.load(fm[1]) ?? {}; } catch { meta = {}; } }
    const body = fm ? fm[2] : (markdown ?? "");
    return {
      images: body ? extractImages(body) : [],
      bodyText: body ? stripImages(body).replace(/^#[^\n]*\n/, "").trim() : "",
      figures: meta.figures ?? [],
      notablePlaces: meta.places ?? [],
      notableItems: meta.items ?? [],
    };
  }, [markdown]);
  const eyebrow = entry.group && !skipGroup(entry.group, entry.section)
    ? `${SECTION_LABEL[entry.section]} · ${entry.group}`
    : SECTION_LABEL[entry.section];
  const relatedVideos = useMemo(() => (relatedVideosByVideo[entry.id] ?? [])
    .map((id) => videoById[id])
    .filter(Boolean), [entry.id]);
  // Cross-references. featuredIn = adventures that feature this entry. The rest is
  // derived from the curated RELATED_BY_SLUG map plus the generated cross-ref index
  // (crossRefs): pages this one mentions, and pages that mention it. Memoized on the
  // entry so unrelated re-renders don't rebuild the whole related-pages graph.
  const { featuredIn, myThemes, related, referencedBy, mapPins, graphNodes } = useMemo(() => {
    const slug = toSlug(entry.name);
    const featuredIn = adventuresByEntryId[entry.id] ?? [];
    const myThemes = themesBySlug[slug] ?? [];
    const seen = new Set([`entry-${entry.id}`, ...featuredIn.map((a) => `adventure-${a.id}`)]);
    const toPages = (slugs) => {
      const out = [];
      for (const s of slugs) {
        const p = resolvePage(s);
        if (!p) continue;
        const k = `${p.kind}-${p.id}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(p);
      }
      return out;
    };
    // Related (discovery): curated first, then the pages this one points to.
    const related = [
      ...toPages(RELATED_BY_SLUG[slug] ?? []),
      ...toPages(crossRefs.mentions[slug] ?? []),
    ].slice(0, 8);
    // Referenced by (reverse index): pages that mention this one, minus any above.
    const referencedBy = toPages(crossRefs.backlinks[slug] ?? []).slice(0, 12);
    // On the map: this page, or places it mentions, that are navigable map pins.
    const mapPins = [slug, ...(crossRefs.mentions[slug] ?? [])]
      .map(resolvePage)
      .filter((p) => p && p.kind === "country")
      .filter((p, i, a) => a.findIndex((q) => q.id === p.id) === i)
      .slice(0, 4);

    // Web-of-connections graph: merge every neighbour kind, dedupe, cap.
    const graphSeen = new Set();
    const graphNodes = [];
    const addNode = (target, label, relation) => {
      const k = `${target.kind}-${target.id}`;
      if (graphSeen.has(k)) return;
      graphSeen.add(k);
      graphNodes.push({ target, label, relation });
    };
    for (const t of related) addNode(t, t.name, t.kind === "adventure" ? "adventure" : t.kind === "country" ? "map" : "related");
    for (const a of featuredIn) addNode({ kind: "adventure", id: a.id, name: a.title }, a.title, "adventure");
    for (const t of referencedBy) addNode(t, t.name, "ref");
    for (const p of mapPins) addNode({ kind: "country", id: p.id, name: p.name }, p.name, "map");

    return { featuredIn, myThemes, related, referencedBy, mapPins, graphNodes: graphNodes.slice(0, 16) };
  }, [entry.id, entry.name]);

  return (
    <div className="country-detail">
      {onBack && (
        <button className="country-detail__back" onClick={onBack}>
          ← Back to {backLabel}
        </button>
      )}
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">{eyebrow}</p>
          <h2 className="country-detail__name">{entry.name}</h2>
        </div>
        <div className="country-detail__header-actions">
          <PageActions target={{ kind: "entry", id: entry.id, name: entry.name }} />
        </div>
      </div>

      <div className="country-detail__divider" />

      {(myThemes.length > 0 || mapPins.length > 0) && (
        <div className="country-detail__meta">
          {myThemes.map((id) => (
            <button key={id} className="codex-tag" onClick={() => onThemeSelect?.(id)}>
              {themeLabel[id]}
            </button>
          ))}
          {mapPins.map((p) => (
            <button
              key={p.id}
              className="codex-tag codex-tag--map"
              onClick={() => onPinSelect?.(p.id)}
            >
              ◈ {p.name} on the map
            </button>
          ))}
        </div>
      )}

      {!loaded && <p className="country-detail__loading">Consulting the codex…</p>}

      {loaded && images.length > 0 && <ImageGallery images={images} />}

      {loaded && bodyText && (
        <div className="country-detail__body">
          <ReactMarkdown>{bodyText}</ReactMarkdown>
        </div>
      )}

      {loaded && <CardGrid label="Notable Figures" items={figures} portrait onOpenPage={onOpenPage} onLightbox={setLightbox} />}
      {loaded && <CardGrid label="Notable Places" items={notablePlaces} onOpenPage={onOpenPage} onLightbox={setLightbox} />}
      {loaded && <CardGrid label="Notable Items" items={notableItems} onOpenPage={onOpenPage} onLightbox={setLightbox} />}

      {loaded && !bodyText && images.length === 0 && (
        <p className="country-detail__empty">
          {entry.noVideo ? "Lore entry coming soon." : "Lore entry coming soon — watch the chronicle below."}
        </p>
      )}

      {loaded && !entry.noVideo && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Chronicle</p>
          <button
            className="location-panel__watch-btn"
            onClick={() => onVideoSelect(entry)}
            aria-label={`Watch ${entry.name}`}
          >
            <img
              src={`https://img.youtube.com/vi/${entry.id}/mqdefault.jpg`}
              alt={entry.name}
              loading="lazy"
            />
            <div className="location-panel__watch-overlay">
              <span className="location-panel__watch-play">▶</span>
              <span className="location-panel__watch-label">Watch</span>
            </div>
          </button>
        </div>
      )}

      {graphNodes.length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Web of connections</p>
          <ConnectionsGraph center={entry.name} nodes={graphNodes} onOpen={onOpenPage} />
        </div>
      )}

      {related.length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Related</p>
          <div className="country-detail__entries-grid">
            {related.map((t) => (
              <button
                key={`${t.kind}-${t.id}`}
                className="codex-card codex-card--link"
                onClick={() => onOpenPage(t)}
              >
                <div className="codex-card__body">
                  <p className="codex-card__title">{t.name}</p>
                  <span className="codex-card__entry-link">
                    {t.kind === "adventure" ? "Adventure" : t.kind === "country" ? "Land" : "Lore"} ↗
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {featuredIn.length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Featured in adventures</p>
          <div className="country-detail__entries-grid">
            {featuredIn.map((a) => (
              <button
                key={a.id}
                className="codex-card codex-card--link"
                onClick={() => onOpenPage({ kind: "adventure", id: a.id })}
              >
                <div className="codex-card__body">
                  <p className="codex-card__title">{a.title}</p>
                  {a.tagline && <p className="codex-card__summary">{a.tagline}</p>}
                  <span className="codex-card__entry-link">View more ↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {referencedBy.length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Referenced by</p>
          <div className="country-detail__entries-grid">
            {referencedBy.map((t) => (
              <button
                key={`${t.kind}-${t.id}`}
                className="codex-card codex-card--link"
                onClick={() => onOpenPage(t)}
              >
                <div className="codex-card__body">
                  <p className="codex-card__title">{t.name}</p>
                  <span className="codex-card__entry-link">
                    {t.kind === "adventure" ? "Adventure" : t.kind === "country" ? "Land" : "Lore"} ↗
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {relatedVideos.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Related Videos</p>
          <div className="location-panel__video-strip">
            {relatedVideos.map((rv) => (
              <button
                key={rv.id}
                className="location-panel__video-thumb"
                onClick={() => onVideoSelect(rv)}
                title={rv.name}
              >
                <img
                  src={`https://img.youtube.com/vi/${rv.id}/mqdefault.jpg`}
                  alt={rv.name}
                  loading="lazy"
                />
                <div className="location-panel__video-thumb-overlay">▶</div>
                <span className="location-panel__video-thumb-label">{rv.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loaded && <SourceCredit sources={sourcesBySlug[toSlug(entry.name)]} />}

      {lightbox && (
        <Lightbox images={lightbox} startIdx={0} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// ── AdventureDetail ───────────────────────────────────────────────────────
function AdventureDetail({ adventure, onVideoSelect, onOpenPage }) {
  // Body prose comes inline from the adventure's frontmatter .md (already parsed
  // in adventures.js) — no async load needed.
  const md = adventure.body ?? "";
  const images = extractImages(md);
  // Strip only a leading H1 (a redundant "# Title"); keep H2 headings like "## Plot".
  const bodyText = stripImages(md).replace(/^# [^\n]*\n/, "").trim();
  const characters = adventure.characters ?? [];
  const byName = (a, b) => (a.name ?? "").localeCompare(b.name ?? "");
  const npcs = characters.filter((c) => (c.type ?? "npc") !== "creature").sort(byName);
  // Creatures come from a dedicated top-level `creatures:` list and/or from
  // `characters` entries tagged `type: creature`; merge both so either style renders.
  const creatures = [
    ...characters.filter((c) => c.type === "creature"),
    ...(adventure.creatures ?? []),
  ].sort(byName);
  const places = adventure.places ?? [];
  const items = adventure.items ?? [];
  const sections = adventure.sections ?? [];
  const relatedVideos = (adventure.videoIds ?? [])
    .map((id) => videoById[id] ?? { id, name: id })
    .filter(Boolean);

  const [lightbox, setLightbox] = useState(null); // {src, alt, caption}[] for image cards

  useEffect(() => { recordView({ kind: "adventure", id: adventure.id, name: adventure.title }); }, [adventure.id, adventure.title]);

  // A named section groups its own Places / NPCs / Creatures / Items beneath a
  // title heading. Empty sub-grids hide themselves (CardGrid renders nothing).
  const grid = (label, items, portrait = false) => (
    <CardGrid
      label={label}
      items={items}
      portrait={portrait}
      onOpenPage={onOpenPage}
      onVideoSelect={onVideoSelect}
      onLightbox={setLightbox}
    />
  );
  const sectionBlock = (section, i) => (
    <div className="country-detail__section" key={section.title ?? i}>
      {section.title && (
        <h3 className="country-detail__section-title">{section.title}</h3>
      )}
      {section.description && (
        <p className="country-detail__section-desc">{section.description}</p>
      )}
      {grid("Places", section.places ?? [])}
      {grid("NPCs", section.npcs ?? [], true)}
      {grid("Creatures", section.creatures ?? [], true)}
      {grid("Items", section.items ?? [])}
    </div>
  );

  return (
    <div className="country-detail">
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">Adventure</p>
          <h2 className="country-detail__name">{adventure.title}</h2>
          {adventure.tagline && <p className="country-detail__tagline">"{adventure.tagline}"</p>}
        </div>
        <div className="country-detail__header-actions">
          <PageActions target={{ kind: "adventure", id: adventure.id, name: adventure.title }} />
        </div>
      </div>

      <div className="country-detail__divider" />

      {images.length > 0 && <ImageGallery images={images} />}

      {adventure.summary && (
        <p className="country-detail__description">{adventure.summary}</p>
      )}

      {bodyText && (
        <div className="country-detail__body">
          <ReactMarkdown>{bodyText}</ReactMarkdown>
        </div>
      )}

      {sections.length > 0 ? (
        sections.map(sectionBlock)
      ) : (
        <>
          {grid("NPCs", npcs, true)}
          {grid("Creatures", creatures, true)}
          {grid("Places", places)}
          {grid("Items", items)}
        </>
      )}

      {relatedVideos.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Related Videos</p>
          <div className="location-panel__video-strip">
            {relatedVideos.map((rv) => (
              <button
                key={rv.id}
                className="location-panel__video-thumb"
                onClick={() => onVideoSelect(rv)}
                title={rv.name}
              >
                <img
                  src={`https://img.youtube.com/vi/${rv.id}/mqdefault.jpg`}
                  alt={rv.name}
                  loading="lazy"
                />
                <div className="location-panel__video-thumb-overlay">▶</div>
                <span className="location-panel__video-thumb-label">{rv.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <SourceCredit sources={sourcesBySlug[toSlug(adventure.title)] ?? sourcesBySlug[adventure.id]} />

      {lightbox && (
        <Lightbox images={lightbox} startIdx={0} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// ── Compendium ────────────────────────────────────────────────────────────
export default function Compendium({
  selectedCountry,
  onCountrySelect,
  selectedAdventure,
  onAdventureSelect,
  onPinSelect,
  onVideoSelect,
}) {
  const [query, setQuery] = useState("");
  // One random salt per Compendium mount, so the landing's section cards show a
  // random representative image (not always the first) and re-roll on reload.
  const [imgSalt] = useState(() => Math.floor(Math.random() * 0x7fffffff));
  // Active "browse by theme" facets (cross-cutting tags from compendiumTags).
  // Multiple can be active at once - the landing shows pages in ALL of them.
  const [themeFilter, setThemeFilter] = useState([]);
  // Landing view: the theme browser, or the A-Z gazetteer of named figures/places.
  const [homeView, setHomeView] = useState("themes");
  // Active browse "hub": { section, group } shows a card-grid index of a section
  // (its groups) or a group (its pages) in the main panel. null = no hub.
  // Reflected in the URL as ?hub=<section>(&hubg=<group>) so a click survives F5.
  const [hub, setHub] = useState(hubFromUrl);
  // The reader's library (recently-viewed + bookmarks), persisted to localStorage.
  const recents = useRecents();
  const bookmarks = useBookmarks();
  // Reading progress: which pages have been opened, totalled per section.
  const seenKeys = useSeenKeys();
  const { seenBySection, advSeen, geoSeen, explored } = useMemo(() => {
    const seenBySection = {};
    for (const s of SECTIONS) {
      if (s.id === "geography" || s.id === "countries" || s.id === "episodes") continue;
      let n = 0;
      for (const g of videosBySection[s.id] || []) for (const v of g.videos) if (seenKeys.has(`entry-${v.id}`)) n++;
      seenBySection[s.id] = n;
    }
    const advSeen = adventures.filter((a) => seenKeys.has(`adventure-${a.id}`)).length;
    let geoSeen = 0;
    for (const p of geoPlaces) if (seenKeys.has(`country-${p.id}`)) geoSeen++;
    for (const g of videosBySection["geography"] || []) for (const v of g.videos) if (seenKeys.has(`entry-${v.id}`)) geoSeen++;
    let explored = 0;
    for (const k of seenKeys) if (PAGE_UNIVERSE.has(k)) explored++;
    return { seenBySection, advSeen, geoSeen, explored };
  }, [seenKeys]);
  const badge = (seen, total) => (seen > 0 ? `${seen}/${total}` : String(total));
  // The open entry page (a Peoples/Creatures/Lore page, either video-backed or
  // markdown-only). Reflected in the URL as ?ce=<id> so the browser back/forward
  // buttons and refresh all work.
  const [selectedEntry, setSelectedEntry] = useState(() => {
    const id = new URLSearchParams(window.location.search).get("ce");
    return id ? (videoById[id] ?? allEntries.find((v) => v.id === id) ?? null) : null;
  });
  // Page scroll to restore when leaving an entry back to the adventure it opened from.
  const savedAdvScroll = useRef(0);

  // Keep the ?ce= param in step with the open entry. This is replaceState (no new
  // history entry); openEntry below is what pushes the back-able entry.
  useEffect(() => {
    const url = new URL(window.location);
    if (selectedEntry) url.searchParams.set("ce", selectedEntry.id);
    else url.searchParams.delete("ce");
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [selectedEntry]);

  // Keep the ?hub= (and ?hubg=) param in step with the open browse hub, so the
  // section/group a reader clicks into is restored on refresh.
  useEffect(() => {
    const url = new URL(window.location);
    if (hub) {
      url.searchParams.set("hub", hub.section);
      if (hub.group) url.searchParams.set("hubg", hub.group);
      else url.searchParams.delete("hubg");
    } else {
      url.searchParams.delete("hub");
      url.searchParams.delete("hubg");
    }
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [hub]);

  // Browser back/forward: drive the entry view from the ?ce= param.
  useEffect(() => {
    const onPop = () => {
      const id = new URLSearchParams(window.location.search).get("ce");
      if (id) {
        setHub(null);
        setSelectedEntry(videoById[id] ?? allEntries.find((v) => v.id === id) ?? null);
      } else {
        setSelectedEntry((prev) => {
          if (prev) {
            const y = savedAdvScroll.current;
            requestAnimationFrame(() => window.scrollTo(0, y));
            setTimeout(() => window.scrollTo(0, y), 250);
          }
          return null;
        });
        setHub(hubFromUrl());
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Open an entry from an adventure card: remember the scroll, push a real history
  // entry (so the browser Back button returns here), and jump to the entry's top.
  const openEntry = useCallback((entry) => {
    savedAdvScroll.current = window.scrollY;
    const url = new URL(window.location);
    url.searchParams.set("ce", entry.id);
    window.history.pushState(null, "", url);
    setHub(null);
    setSelectedEntry(entry);
    window.scrollTo(0, 0);
  }, []);

  // Navigate to any page resolved by the cross-reference resolver: a section
  // entry (Peoples/Creatures/Lore/…), a country page, or an adventure.
  const openPage = useCallback((target) => {
    if (!target) return;
    if (target.kind === "entry") { openEntry(target.entry); return; }
    setHub(null);
    setSelectedEntry(null);
    if (target.kind === "country") {
      onAdventureSelect(null);
      onCountrySelect(target.id);
    } else if (target.kind === "adventure") {
      onCountrySelect(null);
      onAdventureSelect(target.id);
    }
    window.scrollTo(0, 0);
  }, [openEntry, onAdventureSelect, onCountrySelect]);

  // Return to the Compendium landing from a breadcrumb (clear every selection).
  const goHome = useCallback(() => {
    setHub(null);
    setSelectedEntry(null);
    onCountrySelect(null);
    onAdventureSelect(null);
    window.scrollTo(0, 0);
  }, [onCountrySelect, onAdventureSelect]);
  // Expand the nav section that holds the current selection on first render, so
  // a deep-link (e.g. ?adventure=kandra) reveals and highlights it in the menu.
  const [openSections, setOpenSections] = useState(() => ({
    ...(selectedAdventure ? { adventures: true } : {}),
    ...(selectedCountry ? { geography: true } : {}),
    ...(hub ? { [hub.section]: true } : {}),
  }));
  const selectedContinent = geoPlaces.find((c) => c.id === selectedCountry)?.continent;
  const [openGeoGroups, setOpenGeoGroups] = useState(() =>
    selectedContinent ? { [selectedContinent]: true } : {}
  );
  const [openSubGroups, setOpenSubGroups] = useState(() => ({}));

  const toggleSection  = (id) => setOpenSections( (p) => ({ ...p, [id]: !p[id] }));
  const toggleGeoGroup = (id) => setOpenGeoGroups((p) => ({ ...p, [id]: !p[id] }));
  const toggleSubGroup = (id) => setOpenSubGroups((p) => ({ ...p, [id]: !p[id] }));

  // Open a browse hub: a section's groups, or a group's pages. Clears any open
  // page and expands the section inline so the tree and the hub stay in step.
  const openHub = useCallback((section, group = null) => {
    setSelectedEntry(null);
    onCountrySelect(null);
    onAdventureSelect(null);
    // Push a real history entry so browser Back returns to the previous view.
    // (The hub sync effect below is a guarded replaceState and won't double-push.)
    const url = new URL(window.location);
    url.searchParams.delete("ce");
    url.searchParams.delete("country");
    url.searchParams.delete("adventure");
    url.searchParams.set("hub", section);
    if (group) url.searchParams.set("hubg", group);
    else url.searchParams.delete("hubg");
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
    setHub({ section, group });
    if (group == null) setOpenSections((p) => ({ ...p, [section]: true }));
    window.scrollTo(0, 0);
  }, [onCountrySelect, onAdventureSelect]);

  // When a page is opened from the right panel (a hub card, a related link, a
  // breadcrumb, the map, or browser back/forward), reveal it in the left tree:
  // expand the section + group that holds it, then scroll its highlighted item
  // into view. Deferred in a timeout so the expansion isn't a synchronous
  // setState in the effect, and so the expanded list has rendered before the
  // scroll (see memory: deep-link timing is intentional).
  useEffect(() => {
    if (!selectedEntry && !selectedCountry && !selectedAdventure) return;
    const t = setTimeout(() => {
      if (selectedEntry) {
        const sec = selectedEntry.section;
        if (sec === "geography") {
          setOpenSections((p) => ({ ...p, geography: true }));
          const cont = CONTINENTS.find((c) => c.name === selectedEntry.group);
          if (cont) setOpenGeoGroups((p) => ({ ...p, [cont.id]: true }));
        } else {
          setOpenSections((p) => ({ ...p, [sec]: true }));
          if (selectedEntry.group && !skipGroup(selectedEntry.group, sec))
            setOpenSubGroups((p) => ({ ...p, [`${sec}-${selectedEntry.group}`]: true }));
        }
      } else if (selectedCountry) {
        setOpenSections((p) => ({ ...p, geography: true }));
        const cont = geoPlaces.find((c) => c.id === selectedCountry)?.continent;
        if (cont) setOpenGeoGroups((p) => ({ ...p, [cont]: true }));
      } else if (selectedAdventure) {
        setOpenSections((p) => ({ ...p, adventures: true }));
        const grp = adventureGroups.groups.find((g) => g.adventures.some((a) => a.id === selectedAdventure));
        const subKey = grp ? `adv-${grp.name}`
          : adventureGroups.standalone.some((a) => a.id === selectedAdventure) ? "adv-standalone" : null;
        if (subKey) setOpenSubGroups((p) => ({ ...p, [subKey]: true }));
      }
      // Scroll after another tick so the freshly-expanded list is in the DOM.
      setTimeout(() => {
        document.querySelector(".compendium-nav__item--active")?.scrollIntoView({ block: "nearest" });
      }, 50);
    }, 0);
    return () => clearTimeout(t);
  }, [selectedEntry, selectedCountry, selectedAdventure]);

  // Flat search across countries + entries (entries cover both video-backed and
  // markdown-only Peoples/Creatures/Lore pages, via allEntries).
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchCountries = geoPlaces
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({ kind: "country", id: c.id, label: c.name, sub: placeKind(c), pin: c }));

    const matchEntries = allEntries
      .filter(
        (v) =>
          v.section !== "countries" &&
          v.section !== "episodes" &&
          (v.name.toLowerCase().includes(q) ||
          (v.group && v.group.toLowerCase().includes(q)) ||
          SECTION_LABEL[v.section]?.toLowerCase().includes(q))
      )
      .map((v) => ({
        kind: "entry",
        id: v.id,
        label: v.name,
        sub: v.group ? `${SECTION_LABEL[v.section]} · ${v.group}` : SECTION_LABEL[v.section],
        entry: v,
      }));

    return [...matchCountries, ...matchEntries];
  }, [query]);

  // Activate a single theme (from an entry page's theme chip): clear the search
  // and any open page, switch the landing to the theme browser, and show it.
  const selectTheme = useCallback((id) => {
    setQuery("");
    setHub(null);
    setSelectedEntry(null);
    onCountrySelect(null);
    onAdventureSelect(null);
    setHomeView("themes");
    setThemeFilter([id]);
    window.scrollTo(0, 0);
  }, [onCountrySelect, onAdventureSelect]);

  // Toggle a theme in/out of the active set (landing chips). Combining themes
  // narrows to pages that carry all of them.
  const toggleTheme = useCallback((id) => {
    setThemeFilter((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }, []);

  // Pages that belong to ALL active themes (intersection), as result cards.
  const themeResults = useMemo(() => {
    if (!themeFilter.length) return null;
    const sets = themeFilter.map((id) => slugsByTheme[id]).filter(Boolean);
    if (!sets.length) return [];
    const [first, ...rest] = sets;
    const slugs = [...first].filter((s) => rest.every((set) => set.has(s)));
    const seen = new Set();
    const items = [];
    for (const s of slugs) {
      const p = resolvePage(s);
      if (!p) continue;
      const k = `${p.kind}-${p.id}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const sub = p.kind === "country" ? "Land"
        : p.kind === "adventure" ? "Adventure"
        : p.entry ? (p.entry.group ? `${SECTION_LABEL[p.entry.section]} · ${p.entry.group}` : SECTION_LABEL[p.entry.section])
        : "Lore";
      items.push({ target: p, label: p.name, sub });
    }
    return items.sort((a, b) => a.label.localeCompare(b.label));
  }, [themeFilter]);

  const geoGroups = useMemo(() => {
    const geoVideoGroups = videosBySection["geography"] || [];
    const geoByName = Object.fromEntries(geoVideoGroups.map((g) => [g.group ?? "", g.videos]));
    const continentNames = new Set(CONTINENTS.map((c) => c.name));
    const placeNames = new Set(geoPlaces.map((p) => p.name.toLowerCase()));
    const result = [];

    for (const continent of CONTINENTS) {
      const cs = geoPlaces.filter((c) => c.continent === continent.id);
      // Sub-places that nest under a country (parent set) are rendered beneath it,
      // not in the flat list. A geography video whose name matches a place pin in
      // this continent is already represented by that pin (e.g. Niferland, whose
      // chronicle video is attached to the country page), so drop the duplicate.
      const csNames = new Set(cs.map((c) => c.name.toLowerCase()));
      const geoVids = (geoByName[continent.name] || []).filter(
        (v) => !v.parent && !csNames.has(v.name.toLowerCase())
      );
      if (cs.length || geoVids.length)
        result.push({ id: continent.id, name: continent.name, countries: cs, videos: geoVids });
    }
    for (const g of geoVideoGroups) {
      if (!g.group || continentNames.has(g.group)) continue;
      result.push({ id: `geo-${g.group}`, name: g.group, countries: [], videos: g.videos });
    }
    // A geography video whose name matches a place pin is already represented by
    // that place above (e.g. Goiana) — drop it from the loose "ungrouped" bucket.
    const ungrouped = (geoByName[""] || []).filter((v) => !placeNames.has(v.name.toLowerCase()));
    if (ungrouped.length)
      result.push({ id: "geo-ungrouped", name: null, countries: [], videos: ungrouped });

    return result;
  }, []);

  // Top-level sections for the landing's "Browse by section" front door: id,
  // label, total page count, seen count, and a representative image (first page
  // in the section that has art) or null (falls back to the section sigil).
  const sectionCards = useMemo(() => {
    // A random member with art → { image, portrait } so the card frames it
    // right. Pick a random page in the section, then a random image from it;
    // `key` keeps the roll stable per section across re-renders (see imgSalt).
    const rep = (names, key) => {
      const cands = names.map(toSlug).filter((s) => entryImagesAll[s]?.length);
      if (cands.length === 0) return { image: null, portrait: false, square: false };
      const slug = cands[hashStr("sec:" + key, imgSalt) % cands.length];
      const choice = pickEntryImage(slug, imgSalt);
      return { image: choice?.src ?? null, portrait: !!choice?.portrait, square: !!choice?.square };
    };
    const cards = [];
    cards.push({
      id: "adventures", label: "Adventures", sigil: "❖",
      total: adventures.length, seen: advSeen,
      ...rep(adventures.map((a) => a.title), "adventures"),
    });
    const geoTotal = geoGroups.reduce((n, g) => n + g.countries.length + g.videos.length, 0);
    cards.push({
      id: "geography", label: "Geography", sigil: SECTIONS.find((s) => s.id === "geography")?.sigil ?? "◈",
      total: geoTotal, seen: geoSeen,
      ...rep(geoGroups.flatMap((g) => [...g.countries.map((c) => c.name), ...g.videos.map((v) => v.name)]), "geography"),
    });
    for (const s of SECTIONS) {
      if (["geography", "countries", "episodes"].includes(s.id)) continue;
      const groups = videosBySection[s.id] || [];
      const total = groups.reduce((n, g) => n + g.videos.length, 0);
      if (!total) continue;
      cards.push({
        id: s.id, label: s.label, sigil: s.sigil,
        total, seen: seenBySection[s.id] ?? 0,
        ...rep(groups.flatMap((g) => g.videos.map((v) => v.name)), s.id),
      });
    }
    return cards;
  }, [geoGroups, advSeen, geoSeen, seenBySection, imgSalt]);

  const selectedPin = geoPlaces.find((c) => c.id === selectedCountry) ?? null;
  const selectedAdventureObj = adventures.find((a) => a.id === selectedAdventure) ?? null;

  return (
    <section id="catalog" className="catalog-section">
      <div className="compendium-layout">
        {/* ── Left sidebar ── */}
        <aside className="compendium-sidebar">
          <div className="compendium-search-wrap">
            <span className="codex-search-icon">⌕</span>
            <input
              className="codex-search"
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search compendium"
            />
            {query && (
              <button
                className="codex-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear"
              >✕</button>
            )}
          </div>

          {searchResults ? (
            /* ── Search results ── */
            <div className="compendium-results">
              {searchResults.length === 0 ? (
                <p className="compendium-results__empty">No results for "{query}"</p>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={r.id}
                    className={`compendium-results__item${
                      r.kind === "country" && selectedCountry === r.id
                        ? " compendium-results__item--active"
                        : ""
                    }`}
                    onClick={() => {
                      onAdventureSelect(null);
                      if (r.kind === "country") { onCountrySelect(r.id); setSelectedEntry(null); }
                      else { setSelectedEntry(r.entry); onCountrySelect(null); }
                      window.scrollTo(0, 0);
                    }}
                  >
                    <span className="compendium-results__label">{r.label}</span>
                    <span className="compendium-results__sub">{r.sub}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ── Full navigation tree ── */
            <nav className="compendium-nav">
              {/* Adventures — campaign pages, not video-driven */}
              {adventures.length > 0 && (() => {
                const advOpen = openSections["adventures"] ?? false;
                return (
                  <div className="compendium-nav__section">
                    <div className="compendium-nav__section-hd">
                      <button className="compendium-nav__hd-title" onClick={() => openHub("adventures")}>
                        <span className="compendium-nav__sigil">❖</span>
                        <span className="compendium-nav__title">Adventures</span>
                        <span className="compendium-nav__count">{badge(advSeen, adventures.length)}</span>
                      </button>
                      <button className="compendium-nav__toggle-btn" onClick={() => toggleSection("adventures")} aria-label={advOpen ? "Collapse" : "Expand"}>
                        <span className="compendium-nav__toggle">{advOpen ? "▲" : "▼"}</span>
                      </button>
                    </div>
                    {advOpen && (() => {
                      const advItem = (a, label) => (
                        <li key={a.id}>
                          <button
                            className={`compendium-nav__item${selectedAdventure === a.id ? " compendium-nav__item--active" : ""}`}
                            onClick={() => { onAdventureSelect(a.id); onCountrySelect(null); setSelectedEntry(null); window.scrollTo(0, 0); }}
                          >
                            {label}
                          </button>
                        </li>
                      );
                      return (
                        <>
                          {adventureGroups.groups.map((g) => {
                            const subKey = `adv-${g.name}`;
                            const subOpen = openSubGroups[subKey] ?? false;
                            return (
                              <div key={g.name} className="compendium-nav__group">
                                <div className="compendium-nav__group-hd">
                                  <button className="compendium-nav__hd-title" onClick={() => openHub("adventures", g.name)}>
                                    <span>{g.name}</span>
                                    <span className="compendium-nav__count">{g.adventures.length}</span>
                                  </button>
                                  <button className="compendium-nav__toggle-btn" onClick={() => toggleSubGroup(subKey)} aria-label={subOpen ? "Collapse" : "Expand"}>
                                    <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                                  </button>
                                </div>
                                {subOpen && (
                                  <ul className="compendium-nav__list">
                                    {g.adventures.map((a) =>
                                      advItem(a, a.seriesPart != null ? `${a.seriesPart}. ${a.title}` : a.title)
                                    )}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                          {adventureGroups.standalone.length > 0 && (() => {
                            const subKey = "adv-standalone";
                            const subOpen = openSubGroups[subKey] ?? false;
                            return (
                              <div className="compendium-nav__group">
                                <div className="compendium-nav__group-hd">
                                  <button className="compendium-nav__hd-title" onClick={() => openHub("adventures", "Standalone")}>
                                    <span>Standalone</span>
                                    <span className="compendium-nav__count">{adventureGroups.standalone.length}</span>
                                  </button>
                                  <button className="compendium-nav__toggle-btn" onClick={() => toggleSubGroup(subKey)} aria-label={subOpen ? "Collapse" : "Expand"}>
                                    <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                                  </button>
                                </div>
                                {subOpen && (
                                  <ul className="compendium-nav__list">
                                    {adventureGroups.standalone.map((a) => advItem(a, a.title))}
                                  </ul>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>
                );
              })()}

              {/* Geography — countries + geography videos merged by region */}
              {(() => {
                const geoSec = SECTIONS.find((s) => s.id === "geography");
                const geoTotal = geoGroups.reduce((n, g) => n + g.countries.length + g.videos.length, 0);
                const geoOpen = openSections["geography"] ?? false;
                return (
                  <div className="compendium-nav__section">
                    <div className="compendium-nav__section-hd">
                      <button className="compendium-nav__hd-title" onClick={() => openHub("geography")}>
                        <span className="compendium-nav__sigil">{geoSec.sigil}</span>
                        <span className="compendium-nav__title">Geography</span>
                        <span className="compendium-nav__count">{badge(geoSeen, geoTotal)}</span>
                      </button>
                      <button className="compendium-nav__toggle-btn" onClick={() => toggleSection("geography")} aria-label={geoOpen ? "Collapse" : "Expand"}>
                        <span className="compendium-nav__toggle">{geoOpen ? "▲" : "▼"}</span>
                      </button>
                    </div>

                    {geoOpen && geoGroups.map((group) => {
                      const groupCount = group.countries.length + group.videos.length;
                      const isOpen = openGeoGroups[group.id] ?? false;
                      return (
                        <div key={group.id} className="compendium-nav__group">
                          {group.name && (
                            <div className="compendium-nav__group-hd">
                              <button className="compendium-nav__hd-title" onClick={() => openHub("geography", group.name)}>
                                <span>{group.name}</span>
                                <span className="compendium-nav__count">{groupCount}</span>
                              </button>
                              <button className="compendium-nav__toggle-btn" onClick={() => toggleGeoGroup(group.id)} aria-label={isOpen ? "Collapse" : "Expand"}>
                                <span className="compendium-nav__toggle">{isOpen ? "▲" : "▼"}</span>
                              </button>
                            </div>
                          )}
                          {(group.name ? isOpen : true) && (
                            <ul className="compendium-nav__list">
                              {group.countries.map((c) => (
                                <li key={`c-${c.id}`}>
                                  <button
                                    className={`compendium-nav__item${selectedCountry === c.id ? " compendium-nav__item--active" : ""}`}
                                    onClick={() => { onAdventureSelect(null); onCountrySelect(c.id); setSelectedEntry(null); window.scrollTo(0, 0); }}
                                  >
                                    {c.name}
                                  </button>
                                  {geoChildrenByParent[c.id] && (
                                    <ul className="compendium-nav__sublist">
                                      {geoChildrenByParent[c.id].map((v) => (
                                        <li key={`v-${v.id}`}>
                                          <button
                                            className={`compendium-nav__item compendium-nav__item--entry compendium-nav__item--child${selectedEntry?.id === v.id ? " compendium-nav__item--active" : ""}`}
                                            onClick={() => { onAdventureSelect(null); setSelectedEntry(v); onCountrySelect(null); window.scrollTo(0, 0); }}
                                          >
                                            {v.name}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                              {group.videos.map((v) => (
                                <li key={`v-${v.id}`}>
                                  <button
                                    className={`compendium-nav__item compendium-nav__item--entry${selectedEntry?.id === v.id ? " compendium-nav__item--active" : ""}`}
                                    onClick={() => { onAdventureSelect(null); setSelectedEntry(v); onCountrySelect(null); window.scrollTo(0, 0); }}
                                  >
                                    {v.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Other entry sections — skip geography/countries/episodes (those
                  have their own treatment above or play as videos). */}
              {SECTIONS.filter((s) =>
                s.id !== "geography" &&
                s.id !== "countries" &&
                s.id !== "episodes"
              ).map((section) => {
                const groups = videosBySection[section.id] || [];
                const total = groups.reduce((n, g) => n + g.videos.length, 0);
                if (!total) return null;
                const secOpen = openSections[section.id] ?? false;
                return (
                  <div key={section.id} className="compendium-nav__section">
                    <div className="compendium-nav__section-hd">
                      <button className="compendium-nav__hd-title" onClick={() => openHub(section.id)}>
                        <span className="compendium-nav__sigil">{section.sigil}</span>
                        <span className="compendium-nav__title">{section.label}</span>
                        <span className="compendium-nav__count">{badge(seenBySection[section.id] ?? 0, total)}</span>
                      </button>
                      <button className="compendium-nav__toggle-btn" onClick={() => toggleSection(section.id)} aria-label={secOpen ? "Collapse" : "Expand"}>
                        <span className="compendium-nav__toggle">{secOpen ? "▲" : "▼"}</span>
                      </button>
                    </div>

                    {secOpen && groups.map((g, i) => {
                      // A group whose name just repeats the section (e.g. the
                      // "Magic" group under the Magic section) is redundant —
                      // render its entries flat, with no sub-header.
                      const flat = !g.group || skipGroup(g.group, section.id);
                      const subKey = `${section.id}-${g.group ?? i}`;
                      const subOpen = openSubGroups[subKey] ?? false;
                      return (
                        <div key={g.group ?? `__g${i}`} className="compendium-nav__group">
                          {!flat ? (
                            <div className="compendium-nav__group-hd">
                              <button className="compendium-nav__hd-title" onClick={() => openHub(section.id, g.group)}>
                                <span>{g.group}</span>
                                <span className="compendium-nav__count">{g.videos.length}</span>
                              </button>
                              <button className="compendium-nav__toggle-btn" onClick={() => toggleSubGroup(subKey)} aria-label={subOpen ? "Collapse" : "Expand"}>
                                <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                              </button>
                            </div>
                          ) : null}
                          {(flat ? true : subOpen) && (
                            <ul className="compendium-nav__list">
                              {/* Children (parent set) render nested under their parent, not flat. */}
                              {g.videos.filter((v) => !v.parent).map((v) => {
                                const kids = childrenByParentSlug[toSlug(v.name)];
                                return (
                                  <li key={v.id}>
                                    <button
                                      className={`compendium-nav__item compendium-nav__item--entry${selectedEntry?.id === v.id ? " compendium-nav__item--active" : ""}`}
                                      onClick={() => { onAdventureSelect(null); setSelectedEntry(v); onCountrySelect(null); window.scrollTo(0, 0); }}
                                    >
                                      {v.name}
                                    </button>
                                    {kids && (
                                      <ul className="compendium-nav__sublist">
                                        {kids.map((c) => (
                                          <li key={c.id}>
                                            <button
                                              className={`compendium-nav__item compendium-nav__item--entry compendium-nav__item--child${selectedEntry?.id === c.id ? " compendium-nav__item--active" : ""}`}
                                              onClick={() => { onAdventureSelect(null); setSelectedEntry(c); onCountrySelect(null); window.scrollTo(0, 0); }}
                                            >
                                              {c.name}
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </nav>
          )}
        </aside>

        {/* ── Right panel ── */}
        <div className="compendium-main">
          {(selectedEntry || selectedPin || selectedAdventureObj || hub) && (
            <Breadcrumbs
              entry={selectedEntry}
              country={selectedPin}
              adventure={selectedAdventureObj}
              hub={!selectedEntry && !selectedPin && !selectedAdventureObj ? hub : null}
              onHome={goHome}
              onOpenPage={openPage}
              onOpenHub={openHub}
            />
          )}
          {selectedEntry ? (
            <EntryDetail
              key={selectedEntry.id}
              entry={selectedEntry}
              onVideoSelect={onVideoSelect}
              onOpenPage={openPage}
              onThemeSelect={selectTheme}
              onPinSelect={onPinSelect}
              onBack={selectedAdventure ? () => window.history.back() : null}
              backLabel={selectedAdventure ? (adventures.find((a) => a.id === selectedAdventure)?.title ?? "adventure") : ""}
            />
          ) : selectedPin ? (
            <CountryDetail
              key={selectedPin.id}
              country={selectedPin}
              onPinSelect={onPinSelect}
              onVideoSelect={onVideoSelect}
              onOpenPage={openPage}
            />
          ) : selectedAdventureObj ? (
            <AdventureDetail
              key={selectedAdventureObj.id}
              adventure={selectedAdventureObj}
              onVideoSelect={onVideoSelect}
              onOpenPage={openPage}
            />
          ) : hub ? (
            <HubView
              key={`${hub.section}-${hub.group ?? ""}`}
              hub={hub}
              geoGroups={geoGroups}
              onOpenHub={openHub}
              onOpenPage={openPage}
            />
          ) : (
            <div className="country-detail">
              <div className="country-detail__header">
                <div className="country-detail__header-text">
                  <p className="country-detail__eyebrow">The Compendium</p>
                  <h2 className="country-detail__name">Explore</h2>
                </div>
              </div>
              <div className="country-detail__divider" />

              <div className="home-progress">
                <div className="home-progress__track">
                  <div
                    className="home-progress__fill"
                    style={{ width: `${TOTAL_PAGES ? Math.round((explored / TOTAL_PAGES) * 100) : 0}%` }}
                  />
                </div>
                <span className="home-progress__label">Explored {explored} of {TOTAL_PAGES} pages</span>
              </div>

              {recents.length > 0 && <RefStrip label="Continue exploring" refs={recents} onOpen={openPage} />}
              {bookmarks.length > 0 && <RefStrip label="Saved" refs={bookmarks} onOpen={openPage} />}

              <div className="country-detail__block">
                <p className="location-panel__section-label">Browse by section</p>
                <div className="country-detail__entries-grid">
                  {sectionCards.map((s) => (
                    <button key={s.id} className={`codex-card codex-card--link hub-card${orientClass(s)}`} onClick={() => openHub(s.id)}>
                      <div className="codex-card__image-wrap">
                        {s.image ? <CardImage src={s.image} alt={s.label} /> : <span className="codex-card__placeholder">{s.sigil}</span>}
                      </div>
                      <div className="codex-card__body">
                        <p className="codex-card__title">{s.label}</p>
                        <span className="codex-card__entry-link">{badge(s.seen, s.total)} pages ↗</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="home-tabs">
                <button
                  className={`home-tab${homeView === "themes" ? " home-tab--active" : ""}`}
                  onClick={() => setHomeView("themes")}
                >
                  Browse by theme
                </button>
                <button
                  className={`home-tab${homeView === "gazetteer" ? " home-tab--active" : ""}`}
                  onClick={() => setHomeView("gazetteer")}
                >
                  A–Z index
                </button>
              </div>

              {homeView === "gazetteer" ? (
                <Gazetteer onOpen={(m) => openPage({ kind: "country", id: m.pinId, name: m.page })} />
              ) : (
                <>
                  <div className="country-detail__meta">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        className={`codex-tag${themeFilter.includes(t.id) ? " codex-tag--active" : ""}`}
                        onClick={() => toggleTheme(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                    {themeFilter.length > 0 && (
                      <button className="codex-tag codex-tag--clear" onClick={() => setThemeFilter([])}>
                        Clear ✕
                      </button>
                    )}
                  </div>
                  {themeResults ? (
                    themeResults.length > 0 ? (
                      <div className="country-detail__block">
                        <p className="location-panel__section-label">
                          {themeFilter.map((id) => themeLabel[id]).join(" + ")} — {themeResults.length} {themeResults.length === 1 ? "page" : "pages"}{themeFilter.length > 1 ? " in all" : ""}
                        </p>
                        <div className="country-detail__entries-grid">
                          {themeResults.map((r) => (
                            <button
                              key={`${r.target.kind}-${r.target.id}`}
                              className="codex-card codex-card--link"
                              onClick={() => openPage(r.target)}
                            >
                              <div className="codex-card__body">
                                <p className="codex-card__title">{r.label}</p>
                                <span className="codex-card__entry-link">{r.sub} ↗</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="country-detail__empty">No pages share all {themeFilter.length} selected themes. Try removing one.</p>
                    )
                  ) : (
                    <p className="country-detail__empty">Pick one or more themes to combine, or search and choose an entry from the list.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
