// The Compendium's browse + detail views: the hub grid and the country, entry
// and adventure pages. Extracted from Compendium.jsx.
import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import yaml from "js-yaml";
import { SECTIONS, videosBySection } from "../data/videoData";
import { adventureGroups } from "../data/adventures";
import { adventuresByPin, adventuresByEntryId, characterArtByEntryId } from "../data/adventureLinks";
import { videosForPin, relatedVideosByVideo } from "../data/crossLinks";
import Lightbox from "./Lightbox";
import { orientClass, sectionLabelFor, SECTION_LABEL, placeKind, toSlug, skipGroup, hashStr, pickEntryImage, entryMdPath, RELATED_BY_SLUG, videoById, childrenByParentSlug } from "./compendiumHelpers";
import { CardImage, ImageGallery, CardGrid, PageActions, SourceCredit } from "./compendiumCards";
import { entryImages } from "../data/entryImages.generated";
import { portraitSlugs } from "../data/entryImagePortrait.generated";
import { entryImagesAll } from "../data/entryImagesAll.generated";
import { entryBlurbs } from "../data/entryBlurbs.generated";
import { crossRefs } from "../data/crossRefs.generated";
import { themesBySlug, themeLabel } from "../data/compendiumTags";
import { sourcesBySlug } from "../data/sources";
import { resolvePage } from "../data/compendiumPages";
import { extractImages, stripImages } from "../lib/markdown.js";
import { recordView } from "../lib/library.js";

// ── Hub view (section / group browse) ───────────────────────────────────────
// A visual index of a section (its groups as cards) or a group (its pages as
// image cards). Drilled into from the nav headers and the landing's section
// grid; reuses entryImages for art and resolvePage to open each page. geoGroups
// (computed in the main component) is passed in since this is a sibling.
export function HubView({ hub, geoGroups, onOpenHub, onOpenPage }) {
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
      {flat.length > 0 && section === "characters" ? (() => {
        // The Chronicles trio are original to the video series, not published
        // Ereb Altor lore, so they get their own headed block set apart from the
        // canon figures instead of sitting unmarked in the same grid.
        const chronSlugs = new Set(["kaelene-fenholt", "bram-kestrel", "aelthira-moonveil"]);
        const chron = flat.filter((it) => chronSlugs.has(toSlug(it.name)));
        const canon = flat.filter((it) => !chronSlugs.has(toSlug(it.name)));
        return (
          <>
            {chron.length > 0 && (
              <div className="country-detail__block">
                <p className="location-panel__section-label">The Chronicles</p>
                <p className="hub-note">
                  Original characters from the Chronicles video series, not part of the official
                  Ereb Altor canon.
                </p>
                {renderPageCards(chron)}
              </div>
            )}
            {canon.length > 0 && (
              <div className="country-detail__block">
                <p className="location-panel__section-label">Ereb Altor · {canon.length} pages</p>
                {renderPageCards(canon)}
              </div>
            )}
          </>
        );
      })() : flat.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">{named.length ? "Other pages" : `${flat.length} pages`}</p>
          {renderPageCards(flat)}
        </div>
      )}
    </div>
  );
}

// ── Data setup ────────────────────────────────────────────────────────────

const locationModules = import.meta.glob("../data/locations/*.js");
const markdownModules = import.meta.glob("../data/compendium/**/*.md", { query: "?raw", import: "default" });


// ── CountryDetail ─────────────────────────────────────────────────────────
export function CountryDetail({ country, onPinSelect, onVideoSelect, onOpenPage }) {
  const [locationData, setLocationData] = useState(null);
  const [markdown, setMarkdown] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let cancelled = false; // a newer country replaced this one: drop late results
    setLocationData(null);
    setMarkdown(null);
    const locKey = `../data/locations/${country.id}.js`;
    const locLoader = locationModules[locKey];
    if (!locLoader) { setLocationData({}); setMarkdown(""); return undefined; }
    locLoader()
      .then((m) => {
        if (cancelled) return;
        setLocationData(m.default);
        if (m.default.detail) {
          const mdKey = `../data/compendium/${m.default.detail}`;
          const mdLoader = markdownModules[mdKey];
          if (mdLoader) {
            mdLoader().then((md) => { if (!cancelled) setMarkdown(md); }).catch(() => { if (!cancelled) setMarkdown(""); });
          } else {
            setMarkdown("");
          }
        } else {
          setMarkdown("");
        }
      })
      .catch(() => { if (!cancelled) { setLocationData({}); setMarkdown(""); } });
    return () => { cancelled = true; };
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
  const { figures, notablePlaces, notableCreatures, notableItems, images, bodyText } = useMemo(() => {
    const fm = markdown && markdown.startsWith("---")
      ? markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
      : null;
    let meta = {};
    if (fm) { try { meta = yaml.load(fm[1]) ?? {}; } catch { meta = {}; } }
    const body = fm ? fm[2] : (markdown ?? "");
    return {
      figures: meta.figures ?? [],
      notablePlaces: meta.places ?? [],
      notableCreatures: meta.creatures ?? [],
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
      {loaded && <CardGrid label="Notable Creatures" items={notableCreatures} portrait onOpenPage={onOpenPage} onLightbox={setLightbox} excludeCountryId={country.id} />}
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
export function EntryDetail({ entry, onVideoSelect, onBack, backLabel, onOpenPage, onThemeSelect, onPinSelect }) {
  const [markdown, setMarkdown] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  // Per-mount salt so each Sub-pages card's random image pick stays stable
  // across re-renders but re-rolls on a fresh visit (same as the hub cards).
  const [imgSalt] = useState(() => Math.floor(Math.random() * 0x7fffffff));

  useEffect(() => {
    let cancelled = false; // a newer entry replaced this one: drop late results
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before async load (keyed by entry.id)
    setMarkdown(null);
    const mdKey = `../data/compendium/${entryMdPath(entry)}`;
    const mdLoader = markdownModules[mdKey];
    if (mdLoader) {
      mdLoader().then((md) => { if (!cancelled) setMarkdown(md); }).catch(() => { if (!cancelled) setMarkdown(""); });
    } else {
      setMarkdown("");
    }
    return () => { cancelled = true; };
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
  // Named characters from adventures whose card links here (e.g. Thord and Toch
  // on the Ogre page): append their custom art to the page gallery. The thumb
  // shows only the name (a long caption widens the tile and squashes the image);
  // the lightbox shows name and adventure. A character appearing in several
  // adventures (e.g. Mogdath) gets one image, its lightbox caption naming every
  // adventure ("Mogdath - The Gates of Power/The Heart of Darkness").
  // Page-own images stay first.
  const galleryImages = useMemo(() => {
    const seen = new Set(images.map((im) => im.src));
    const byName = new Map();
    for (const a of characterArtByEntryId[entry.id] ?? []) {
      if (seen.has(a.src)) continue;
      const group = byName.get(a.name);
      if (group) group.adventures.add(a.adventure);
      else byName.set(a.name, { src: a.src, name: a.name, adventures: new Set([a.adventure]) });
    }
    const linked = [...byName.values()].map((g) => ({
      src: g.src,
      alt: g.name,
      caption: `${g.name} - ${[...g.adventures].join("/")}`,
      thumbCaption: g.name,
    }));
    for (const im of linked) seen.add(im.src);
    // A parent page (e.g. Bakemono, Nymph, Orc) also gathers every image of its
    // subpages into its own gallery, each captioned with the subpage's name, so
    // the parent shows the whole family at once. Page-own images stay first.
    const childImgs = [];
    for (const kid of childrenByParentSlug[toSlug(entry.name)] ?? []) {
      for (const im of entryImagesAll[toSlug(kid.name)] ?? []) {
        if (seen.has(im.src)) continue;
        seen.add(im.src);
        childImgs.push({ src: im.src, alt: kid.name, caption: kid.name, thumbCaption: kid.name });
      }
    }
    return [...images, ...linked, ...childImgs];
  }, [images, entry.id, entry.name]);
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
  const { featuredIn, myThemes, subPages, related, referencedBy, mapPins } = useMemo(() => {
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
    // Sub-pages: the pages that name this one as their `parent`. The sidebar
    // only nests two levels deep, so a grandchild page (e.g. Fortress, under
    // Dark Elf, under Elves) has no sidebar entry - listing children here keeps
    // every sub-page reachable by clicking down from its parent. Resolved first
    // so a child that is also cross-referenced doesn't double up under Related.
    const subPages = toPages((childrenByParentSlug[slug] ?? []).map((v) => v.slug ?? toSlug(v.name)));
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

    return { featuredIn, myThemes, subPages, related, referencedBy, mapPins };
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

      {loaded && galleryImages.length > 0 && <ImageGallery images={galleryImages} />}

      {loaded && bodyText && (
        <div className="country-detail__body">
          <ReactMarkdown>{bodyText}</ReactMarkdown>
        </div>
      )}

      {loaded && <CardGrid label="Notable Figures" items={figures} portrait onOpenPage={onOpenPage} onLightbox={setLightbox} />}
      {loaded && <CardGrid label="Notable Places" items={notablePlaces} onOpenPage={onOpenPage} onLightbox={setLightbox} />}
      {loaded && <CardGrid label="Notable Items" items={notableItems} onOpenPage={onOpenPage} onLightbox={setLightbox} />}

      {loaded && !bodyText && galleryImages.length === 0 && (
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

      {subPages.length > 0 && onOpenPage && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Sub-pages</p>
          <div className="country-detail__entries-grid">
            {subPages.map((t) => {
              const slug = toSlug(t.name);
              const choice = pickEntryImage(slug, imgSalt);
              const img = choice?.src ?? entryImages[slug] ?? null;
              const cls = `codex-card codex-card--link${choice ? orientClass(choice) : portraitSlugs.has(slug) ? " codex-card--portrait" : ""}`;
              return (
                <button key={`${t.kind}-${t.id}`} className={cls} onClick={() => onOpenPage(t)}>
                  <div className="codex-card__image-wrap">
                    <CardImage src={img} alt={t.name} />
                  </div>
                  <div className="codex-card__body">
                    <p className="codex-card__title">{t.name}</p>
                    <span className="codex-card__entry-link">View more ↗</span>
                  </div>
                </button>
              );
            })}
          </div>
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
export function AdventureDetail({ adventure, onVideoSelect, onOpenPage }) {
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

