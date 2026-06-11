import { useState, useMemo, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { SECTIONS, videosBySection, videos as allVideos } from "../data/videoData";
import { pins } from "../data/locations";
import { entries } from "../data/codex/index.js";
import { adventures } from "../data/adventures";
import { videosForPin, relatedVideosByVideo } from "../data/crossLinks";

// ── Image utilities ───────────────────────────────────────────────────────
const IMAGE_RE = /!\[([^\]]*)\]\(([^")]+?)(?:\s+"([^"]*)")?\)/g;
function extractImages(md) {
  const imgs = []; let m; IMAGE_RE.lastIndex = 0;
  while ((m = IMAGE_RE.exec(md)) !== null) imgs.push({ alt: m[1], src: m[2], caption: m[3] || null });
  return imgs;
}
function stripImages(md) {
  return md.replace(IMAGE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}
function thumbSrc(src) {
  const slash = src.lastIndexOf("/");
  return src.slice(0, slash + 1) + "Thumbnails/" + src.slice(slash + 1);
}

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
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

  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox__close" onClick={onClose}>✕</button>
        <div className="lightbox__track">
          <button className="lightbox__arrow" onClick={prev} disabled={images.length === 1}>‹</button>
          <img src={img.src} alt={img.alt} className="lightbox__image" />
          <button className="lightbox__arrow" onClick={next} disabled={images.length === 1}>›</button>
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

// Curated non-country pins that should also appear as places in the Geography
// nav (nested under their continent), e.g. a notable region/forest with a video.
const EXTRA_GEO_PLACE_IDS = new Set(["mereld", "goiana"]);
const geoPlaces = pins
  .filter((p) => p.type === "country" || EXTRA_GEO_PLACE_IDS.has(p.id))
  .sort((a, b) => a.name.localeCompare(b.name));

const placeKind = (pin) =>
  pin.type === "country" ? "Country" : pin.type[0].toUpperCase() + pin.type.slice(1);

const SECTION_LABEL = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label]));

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
function entryMdPath(video) {
  const sec  = video.section[0].toUpperCase() + video.section.slice(1);
  const slug = toSlug(video.name);
  return skipGroup(video.group, video.section)
    ? `${sec}/${slug}.md`
    : `${sec}/${video.group}/${slug}.md`;
}

// ── CountryDetail ─────────────────────────────────────────────────────────
function CountryDetail({ country, onPinSelect, onEntrySelect, onVideoSelect }) {
  const [locationData, setLocationData] = useState(null);
  const [markdown, setMarkdown] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before async load (keyed by country.id)
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

  const countryEntries = entries.filter((e) => e.tags.includes(country.id));
  const pinVideos = videosForPin[country.id] ?? [];
  const mainVideo = locationData?.youtubeId
    ? (videoById[locationData.youtubeId] ?? { id: locationData.youtubeId, title: `Chronicle: ${country.name}` })
    : null;
  const relatedVideos = pinVideos.filter((v) => v.id !== locationData?.youtubeId);

  const loaded = locationData !== null && markdown !== null;
  const images = markdown ? extractImages(markdown) : [];
  const bodyText = markdown ? stripImages(markdown).replace(/^#[^\n]*\n/, "").trim() : "";

  return (
    <div className="country-detail">
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">{placeKind(country)}</p>
          <h2 className="country-detail__name">{country.name}</h2>
          {country.tagline && <p className="country-detail__tagline">"{country.tagline}"</p>}
        </div>
        <button className="country-detail__map-btn" onClick={() => onPinSelect(country.id)}>
          View on Map ↗
        </button>
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
            />
            <div className="location-panel__watch-overlay">
              <span className="location-panel__watch-play">▶</span>
              <span className="location-panel__watch-label">Watch</span>
            </div>
          </button>
        </div>
      )}

      {countryEntries.length > 0 && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Codex Entries</p>
          <div className="country-detail__entries-grid">
            {countryEntries.map((entry) => (
              <button key={entry.id} className="codex-card" onClick={() => onEntrySelect(entry.id)}>
                <div className="codex-card__image-wrap">
                  {entry.image ? (
                    <img className="codex-card__image" src={entry.image} alt={entry.title} />
                  ) : (
                    <span className="codex-card__placeholder">◈</span>
                  )}
                </div>
                <div className="codex-card__body">
                  <p className="codex-card__title">{entry.title}</p>
                  {entry.summary && <p className="codex-card__summary">{entry.summary}</p>}
                </div>
              </button>
            ))}
          </div>
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
                />
                <div className="location-panel__video-thumb-overlay">▶</div>
                <span className="location-panel__video-thumb-label">{video.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loaded && !mainVideo && countryEntries.length === 0 && relatedVideos.length === 0 && images.length === 0 && !bodyText && (
        <p className="country-detail__empty">Details coming soon.</p>
      )}
    </div>
  );
}

// ── EntryDetail ───────────────────────────────────────────────────────────
function EntryDetail({ video, onVideoSelect }) {
  const [markdown, setMarkdown] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before async load (keyed by video.id)
    setMarkdown(null);
    const mdKey = `../data/compendium/${entryMdPath(video)}`;
    const mdLoader = markdownModules[mdKey];
    if (mdLoader) {
      mdLoader().then((md) => setMarkdown(md)).catch(() => setMarkdown(""));
    } else {
      setMarkdown("");
    }
  }, [video]);

  const loaded = markdown !== null;
  const images = markdown ? extractImages(markdown) : [];
  const bodyText = markdown ? stripImages(markdown).replace(/^#[^\n]*\n/, "").trim() : "";
  const eyebrow = video.group && !skipGroup(video.group, video.section)
    ? `${SECTION_LABEL[video.section]} · ${video.group}`
    : SECTION_LABEL[video.section];
  const relatedVideos = (relatedVideosByVideo[video.id] ?? [])
    .map((id) => videoById[id])
    .filter(Boolean);

  return (
    <div className="country-detail">
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">{eyebrow}</p>
          <h2 className="country-detail__name">{video.name}</h2>
        </div>
      </div>

      <div className="country-detail__divider" />

      {!loaded && <p className="country-detail__loading">Consulting the codex…</p>}

      {loaded && images.length > 0 && <ImageGallery images={images} />}

      {loaded && bodyText && (
        <div className="country-detail__body">
          <ReactMarkdown>{bodyText}</ReactMarkdown>
        </div>
      )}

      {loaded && !bodyText && images.length === 0 && (
        <p className="country-detail__empty">
          {video.noVideo ? "Lore entry coming soon." : "Lore entry coming soon — watch the chronicle below."}
        </p>
      )}

      {loaded && !video.noVideo && (
        <div className="country-detail__block">
          <p className="location-panel__section-label">Chronicle</p>
          <button
            className="location-panel__watch-btn"
            onClick={() => onVideoSelect(video)}
            aria-label={`Watch ${video.name}`}
          >
            <img
              src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
              alt={video.name}
            />
            <div className="location-panel__watch-overlay">
              <span className="location-panel__watch-play">▶</span>
              <span className="location-panel__watch-label">Watch</span>
            </div>
          </button>
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
                />
                <div className="location-panel__video-thumb-overlay">▶</div>
                <span className="location-panel__video-thumb-label">{rv.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AdventureDetail ───────────────────────────────────────────────────────
function AdventureDetail({ adventure, onVideoSelect }) {
  // Body prose comes inline from the adventure's frontmatter .md (already parsed
  // in adventures.js) — no async load needed.
  const md = adventure.body ?? "";
  const images = extractImages(md);
  // Strip only a leading H1 (a redundant "# Title"); keep H2 headings like "## Plot".
  const bodyText = stripImages(md).replace(/^# [^\n]*\n/, "").trim();
  const characters = adventure.characters ?? [];
  const byName = (a, b) => (a.name ?? "").localeCompare(b.name ?? "");
  const npcs = characters.filter((c) => (c.type ?? "npc") !== "creature").sort(byName);
  const creatures = characters.filter((c) => c.type === "creature").sort(byName);
  const places = adventure.places ?? [];
  const items = adventure.items ?? [];
  const sections = adventure.sections ?? [];
  const relatedVideos = (adventure.videoIds ?? [])
    .map((id) => videoById[id] ?? { id, name: id })
    .filter(Boolean);

  const [lightbox, setLightbox] = useState(null); // {src, alt, caption}[] for image cards

  // Card grid reused for NPCs / Creatures / Places / Items. Each entry has an
  // optional image, description and videoId: a card with a videoId plays it; a
  // card with only an image opens it in the lightbox (e.g. view the map full-size).
  const cardGrid = (label, items, portrait = false) =>
    items.length > 0 && (
      <div className="country-detail__block">
        <p className="location-panel__section-label">{label}</p>
        <div className="country-detail__entries-grid">
          {items.map((it, i) => {
            const cls = `codex-card${(it.portrait ?? portrait) ? " codex-card--portrait" : ""}`;
            const inner = (
              <>
                <div className="codex-card__image-wrap">
                  {it.image ? (
                    <img className="codex-card__image" src={it.image} alt={it.name} />
                  ) : (
                    <span className="codex-card__placeholder">◈</span>
                  )}
                </div>
                <div className="codex-card__body">
                  <p className="codex-card__title">{it.name}</p>
                  {it.description && <p className="codex-card__summary">{it.description}</p>}
                </div>
              </>
            );
            if (it.videoId)
              return (
                <button
                  key={it.videoId}
                  className={cls}
                  onClick={() => onVideoSelect(videoById[it.videoId] ?? { id: it.videoId, title: it.name })}
                >
                  {inner}
                </button>
              );
            if (it.image)
              return (
                <button
                  key={it.name ?? i}
                  className={cls}
                  onClick={() => setLightbox([{ src: it.image, alt: it.name, caption: it.name }])}
                >
                  {inner}
                </button>
              );
            return <div key={it.name ?? i} className={cls}>{inner}</div>;
          })}
        </div>
      </div>
    );

  // A named section groups its own Places / NPCs / Creatures / Items beneath a
  // title heading. Empty sub-grids hide themselves (see cardGrid).
  const sectionBlock = (section, i) => (
    <div className="country-detail__section" key={section.title ?? i}>
      {section.title && (
        <h3 className="country-detail__section-title">{section.title}</h3>
      )}
      {section.description && (
        <p className="country-detail__section-desc">{section.description}</p>
      )}
      {cardGrid("Places", section.places ?? [])}
      {cardGrid("NPCs", section.npcs ?? [], true)}
      {cardGrid("Creatures", section.creatures ?? [], true)}
      {cardGrid("Items", section.items ?? [])}
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
          {cardGrid("NPCs", npcs, true)}
          {cardGrid("Creatures", creatures, true)}
          {cardGrid("Places", places)}
          {cardGrid("Items", items)}
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
                />
                <div className="location-panel__video-thumb-overlay">▶</div>
                <span className="location-panel__video-thumb-label">{rv.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
  onEntrySelect,
  onVideoSelect,
}) {
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openSections, setOpenSections] = useState(() => ({}));
  const [openGeoGroups, setOpenGeoGroups] = useState(() => ({}));
  const [openSubGroups, setOpenSubGroups] = useState(() => ({}));

  const toggleSection  = (id) => setOpenSections( (p) => ({ ...p, [id]: !p[id] }));
  const toggleGeoGroup = (id) => setOpenGeoGroups((p) => ({ ...p, [id]: !p[id] }));
  const toggleSubGroup = (id) => setOpenSubGroups((p) => ({ ...p, [id]: !p[id] }));

  // Flat search across countries + videos
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchCountries = geoPlaces
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({ kind: "country", id: c.id, label: c.name, sub: placeKind(c), pin: c }));

    const matchVideos = allVideos
      .filter(
        (v) =>
          v.section !== "countries" &&
          v.section !== "episodes" &&
          v.section !== "characters" &&
          (v.name.toLowerCase().includes(q) ||
          (v.group && v.group.toLowerCase().includes(q)) ||
          SECTION_LABEL[v.section]?.toLowerCase().includes(q))
      )
      .map((v) => ({
        kind: "video",
        id: v.id,
        label: v.name,
        sub: v.group ? `${SECTION_LABEL[v.section]} · ${v.group}` : SECTION_LABEL[v.section],
        video: v,
      }));

    return [...matchCountries, ...matchVideos];
  }, [query]);

  const geoGroups = useMemo(() => {
    const geoVideoGroups = videosBySection["geography"] || [];
    const geoByName = Object.fromEntries(geoVideoGroups.map((g) => [g.group ?? "", g.videos]));
    const continentNames = new Set(CONTINENTS.map((c) => c.name));
    const placeNames = new Set(geoPlaces.map((p) => p.name.toLowerCase()));
    const result = [];

    for (const continent of CONTINENTS) {
      const cs = geoPlaces.filter((c) => c.continent === continent.id);
      const geoVids = geoByName[continent.name] || [];
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
                      else { setSelectedEntry(r.video); onCountrySelect(null); }
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
                    <button
                      className="compendium-nav__section-hd"
                      onClick={() => toggleSection("adventures")}
                    >
                      <span className="compendium-nav__sigil">❖</span>
                      <span className="compendium-nav__title">Adventures</span>
                      <span className="compendium-nav__count">{adventures.length}</span>
                      <span className="compendium-nav__toggle">{advOpen ? "▲" : "▼"}</span>
                    </button>
                    {advOpen && (
                      <div className="compendium-nav__group">
                        <ul className="compendium-nav__list">
                          {adventures.map((a) => (
                            <li key={a.id}>
                              <button
                                className={`compendium-nav__item${selectedAdventure === a.id ? " compendium-nav__item--active" : ""}`}
                                onClick={() => { onAdventureSelect(a.id); onCountrySelect(null); setSelectedEntry(null); }}
                              >
                                {a.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                    <button
                      className="compendium-nav__section-hd"
                      onClick={() => toggleSection("geography")}
                    >
                      <span className="compendium-nav__sigil">{geoSec.sigil}</span>
                      <span className="compendium-nav__title">Geography</span>
                      <span className="compendium-nav__count">{geoTotal}</span>
                      <span className="compendium-nav__toggle">{geoOpen ? "▲" : "▼"}</span>
                    </button>

                    {geoOpen && geoGroups.map((group) => {
                      const groupCount = group.countries.length + group.videos.length;
                      const isOpen = openGeoGroups[group.id] ?? false;
                      return (
                        <div key={group.id} className="compendium-nav__group">
                          {group.name && (
                            <button
                              className="compendium-nav__group-hd"
                              onClick={() => toggleGeoGroup(group.id)}
                            >
                              <span>{group.name}</span>
                              <span className="compendium-nav__count">{groupCount}</span>
                              <span className="compendium-nav__toggle">{isOpen ? "▲" : "▼"}</span>
                            </button>
                          )}
                          {(group.name ? isOpen : true) && (
                            <ul className="compendium-nav__list">
                              {group.countries.map((c) => (
                                <li key={`c-${c.id}`}>
                                  <button
                                    className={`compendium-nav__item${selectedCountry === c.id ? " compendium-nav__item--active" : ""}`}
                                    onClick={() => { onAdventureSelect(null); onCountrySelect(c.id); setSelectedEntry(null); }}
                                  >
                                    {c.name}
                                  </button>
                                </li>
                              ))}
                              {group.videos.map((v) => (
                                <li key={`v-${v.id}`}>
                                  <button
                                    className={`compendium-nav__item compendium-nav__item--video${selectedEntry?.id === v.id ? " compendium-nav__item--active" : ""}`}
                                    onClick={() => { onAdventureSelect(null); setSelectedEntry(v); onCountrySelect(null); }}
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

              {/* Other video sections — skip geography/countries/episodes/characters */}
              {SECTIONS.filter((s) =>
                s.id !== "geography" &&
                s.id !== "countries" &&
                s.id !== "episodes" &&
                s.id !== "characters"
              ).map((section) => {
                const groups = videosBySection[section.id] || [];
                const total = groups.reduce((n, g) => n + g.videos.length, 0);
                if (!total) return null;
                const secOpen = openSections[section.id] ?? false;
                return (
                  <div key={section.id} className="compendium-nav__section">
                    <button
                      className="compendium-nav__section-hd"
                      onClick={() => toggleSection(section.id)}
                    >
                      <span className="compendium-nav__sigil">{section.sigil}</span>
                      <span className="compendium-nav__title">{section.label}</span>
                      <span className="compendium-nav__count">{total}</span>
                      <span className="compendium-nav__toggle">{secOpen ? "▲" : "▼"}</span>
                    </button>

                    {secOpen && groups.map((g, i) => {
                      const subKey = `${section.id}-${g.group ?? i}`;
                      const subOpen = openSubGroups[subKey] ?? false;
                      return (
                        <div key={g.group ?? `__g${i}`} className="compendium-nav__group">
                          {g.group ? (
                            <button
                              className="compendium-nav__group-hd"
                              onClick={() => toggleSubGroup(subKey)}
                            >
                              <span>{g.group}</span>
                              <span className="compendium-nav__count">{g.videos.length}</span>
                              <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                            </button>
                          ) : null}
                          {(g.group ? subOpen : true) && (
                            <ul className="compendium-nav__list">
                              {g.videos.map((v) => (
                                <li key={v.id}>
                                  <button
                                    className={`compendium-nav__item compendium-nav__item--video${selectedEntry?.id === v.id ? " compendium-nav__item--active" : ""}`}
                                    onClick={() => { onAdventureSelect(null); setSelectedEntry(v); onCountrySelect(null); }}
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
              })}
            </nav>
          )}
        </aside>

        {/* ── Right panel ── */}
        <div className="compendium-main">
          {selectedPin ? (
            <CountryDetail
              key={selectedPin.id}
              country={selectedPin}
              onPinSelect={onPinSelect}
              onEntrySelect={onEntrySelect}
              onVideoSelect={onVideoSelect}
            />
          ) : selectedAdventureObj ? (
            <AdventureDetail
              key={selectedAdventureObj.id}
              adventure={selectedAdventureObj}
              onVideoSelect={onVideoSelect}
            />
          ) : selectedEntry ? (
            <EntryDetail
              key={selectedEntry.id}
              video={selectedEntry}
              onVideoSelect={onVideoSelect}
            />
          ) : (
            <div className="country-detail__prompt">
              <span className="country-detail__prompt-ornament">◉</span>
              <p>Select an entry from the list to begin</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
