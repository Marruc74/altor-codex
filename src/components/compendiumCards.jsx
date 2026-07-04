// Reusable Compendium presentational pieces: card image, image gallery, card
// grid, and the detail-header chrome (page actions, breadcrumbs, source credit,
// ref strips). Extracted from Compendium.jsx.
import { useState } from "react";
import { adventureGroups } from "../data/adventures";
import { thumbSrc, onThumbError, IMAGE_MISSING } from "../lib/thumb";
import Lightbox from "./Lightbox";
import { refToTarget, pageUrl, sectionLabelFor, CONTINENTS, toSlug, skipGroup, videoById } from "./compendiumHelpers";
import { CountryDetail, AdventureDetail } from "./compendiumDetails";
import { entryImages } from "../data/entryImages.generated";
import { resolvePage } from "../data/compendiumPages";
import { toggleBookmark, useIsBookmarked } from "../lib/library.js";

// ── Image utilities ───────────────────────────────────────────────────────
// A card image: shows the thumbnail, falls back to the full image if the
// thumbnail is missing. The full image is loaded by the lightbox / detail page.
export function CardImage({ src, alt }) {
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

// ── Image gallery ─────────────────────────────────────────────────────────
export function ImageGallery({ images }) {
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

export function CardGrid({ label, items, portrait = false, onOpenPage, onVideoSelect, onLightbox, excludeCountryId }) {
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

// Bookmark + copy-link actions shown in every detail header.
export function PageActions({ target }) {
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


// Breadcrumb trail for a detail view or a hub. The root "Compendium" crumb
// returns to the landing; section/group crumbs link to their hubs (so on a
// dragon page, "Creatures" and "Dragons" jump to those hubs); the leaf is the
// current page or hub. Each crumb is { label, go } where go is null for the
// current location.
export function Breadcrumbs({ entry, country, adventure, hub, onHome, onOpenPage, onOpenHub }) {
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
export function SourceCredit({ sources }) {
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
export function RefStrip({ label, refs, onOpen }) {
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

