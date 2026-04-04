import { useState, useMemo, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { SECTIONS, videosBySection, videos as allVideos } from "../data/videoData";
import { pins } from "../data/locations";
import { entries } from "../data/codex/index.js";
import { videosForPin } from "../data/crossLinks";

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
const markdownModules = import.meta.glob("../data/codex/**/*.md", { query: "?raw", import: "default" });

const CONTINENTS = [
  { id: "akrogal",      name: "Akrogal"         },
  { id: "ereb",         name: "Ereb"             },
  { id: "samkarna",     name: "Samkarna"         },
  { id: "soluna",       name: "Soluna"           },
  { id: "serpent-lake", name: "Serpent Lake"     },
  { id: "western-sea",  name: "The Western Sea"  },
];

const countries = pins
  .filter((p) => p.type === "country")
  .sort((a, b) => a.name.localeCompare(b.name));

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
    setLocationData(null);
    setMarkdown(null);
    const locKey = `../data/locations/${country.id}.js`;
    const locLoader = locationModules[locKey];
    if (!locLoader) { setLocationData({}); setMarkdown(""); return; }
    locLoader()
      .then((m) => {
        setLocationData(m.default);
        if (m.default.detail) {
          const mdKey = `../data/codex/${m.default.detail}`;
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
          <p className="country-detail__eyebrow">Country</p>
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
        <p className="country-detail__empty">No further information recorded.</p>
      )}
    </div>
  );
}

// ── EntryDetail ───────────────────────────────────────────────────────────
function EntryDetail({ video, onVideoSelect }) {
  const [markdown, setMarkdown] = useState(null);

  useEffect(() => {
    setMarkdown(null);
    const mdKey = `../data/codex/${entryMdPath(video)}`;
    const mdLoader = markdownModules[mdKey];
    if (mdLoader) {
      mdLoader().then((md) => setMarkdown(md)).catch(() => setMarkdown(""));
    } else {
      setMarkdown("");
    }
  }, [video.id]);

  const loaded = markdown !== null;
  const images = markdown ? extractImages(markdown) : [];
  const bodyText = markdown ? stripImages(markdown).replace(/^#[^\n]*\n/, "").trim() : "";
  const eyebrow = video.group && !skipGroup(video.group, video.section)
    ? `${SECTION_LABEL[video.section]} · ${video.group}`
    : SECTION_LABEL[video.section];

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

      {loaded && (
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
    </div>
  );
}

// ── Compendium ────────────────────────────────────────────────────────────
export default function Compendium({
  selectedCountry,
  onCountrySelect,
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

    const matchCountries = countries
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({ kind: "country", id: c.id, label: c.name, sub: "Country", pin: c }));

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
    const result = [];

    for (const continent of CONTINENTS) {
      const cs = countries.filter((c) => c.continent === continent.id);
      const geoVids = geoByName[continent.name] || [];
      if (cs.length || geoVids.length)
        result.push({ id: continent.id, name: continent.name, countries: cs, videos: geoVids });
    }
    for (const g of geoVideoGroups) {
      if (!g.group || continentNames.has(g.group)) continue;
      result.push({ id: `geo-${g.group}`, name: g.group, countries: [], videos: g.videos });
    }
    const ungrouped = geoByName[""];
    if (ungrouped?.length)
      result.push({ id: "geo-ungrouped", name: null, countries: [], videos: ungrouped });

    return result;
  }, []);

  const selectedPin = countries.find((c) => c.id === selectedCountry) ?? null;

  return (
    <section id="catalog" className="catalog-section">
      <div className="section-header">
        <p className="section-eyebrow">ALL ENTRIES</p>
        <h2 className="section-title">The Compendium</h2>
        <p className="section-subtitle">
          Every chronicle, record, and field report in the Codex archive.
        </p>
      </div>

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
                                    onClick={() => { onCountrySelect(c.id); setSelectedEntry(null); }}
                                  >
                                    {c.name}
                                  </button>
                                </li>
                              ))}
                              {group.videos.map((v) => (
                                <li key={`v-${v.id}`}>
                                  <button
                                    className={`compendium-nav__item compendium-nav__item--video${selectedEntry?.id === v.id ? " compendium-nav__item--active" : ""}`}
                                    onClick={() => { setSelectedEntry(v); onCountrySelect(null); }}
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
                                    onClick={() => { setSelectedEntry(v); onCountrySelect(null); }}
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
