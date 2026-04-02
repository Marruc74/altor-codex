import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { pins } from "../data/locations";
import { entries } from "../data/codex/index.js";
import { videosForPin } from "../data/crossLinks";
import { videos } from "../data/videoData";

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
                <button key={i} className={`lightbox__dot${i === idx ? " lightbox__dot--active" : ""}`} onClick={() => setIdx(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

const videoById = Object.fromEntries(videos.map((v) => [v.id, v]));

const CONTINENTS = [
  { id: "akrogal",  name: "Akrogal"  },
  { id: "ereb",     name: "Ereb"     },
  { id: "samkarna", name: "Samkarna" },
  { id: "soluna",   name: "Soluna"   },
  { id: "other",    name: "Other"    },
];

const countries = pins
  .filter((p) => p.type === "country")
  .sort((a, b) => a.name.localeCompare(b.name));

function CountryDetail({ country, onPinSelect, onEntrySelect, onVideoSelect }) {
  const [locationData, setLocationData] = useState(null);
  const [markdown, setMarkdown] = useState(null);

  useEffect(() => {
    setLocationData(null);
    setMarkdown(null);
    import(`../data/locations/${country.id}.js`)
      .then((m) => {
        setLocationData(m.default);
        if (m.default.detail) {
          const detailPath = m.default.detail;
          import(`../data/codex/${detailPath}?raw`)
            .then((md) => setMarkdown(md.default))
            .catch(() => setMarkdown(""));
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
        <button
          className="country-detail__map-btn"
          onClick={() => onPinSelect(country.id)}
        >
          View on Map ↗
        </button>
      </div>

      <div className="country-detail__divider" />

      {!loaded && (
        <p className="country-detail__loading">Consulting the codex…</p>
      )}

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
              <button
                key={entry.id}
                className="codex-card"
                onClick={() => onEntrySelect(entry.id)}
              >
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

export default function CountriesSection({ selectedCountry, onCountrySelect, onPinSelect, onEntrySelect, onVideoSelect }) {
  const grouped = CONTINENTS.map((continent) => ({
    ...continent,
    countries: countries.filter((c) => c.continent === continent.id),
  }));

  const selectedPin = countries.find((c) => c.id === selectedCountry) ?? null;

  return (
    <section id="countries" className="countries-section">
      <div className="section-header">
        <p className="section-eyebrow">The Known World</p>
        <h2 className="section-title">Countries</h2>
        <p className="section-sub">Select a country to explore its history, lore, and chronicles.</p>
      </div>
      <div className="countries-layout">
        <aside className="countries-sidebar">
          {grouped.map((continent) => (
            <div key={continent.id} className="countries-sidebar__group">
              <p className="countries-sidebar__continent-label">{continent.name}</p>
              <ul className="countries-sidebar__list">
                {continent.countries.map((country) => (
                  <li key={country.id}>
                    <button
                      className={`countries-sidebar__country${selectedCountry === country.id ? " countries-sidebar__country--active" : ""}`}
                      onClick={() => onCountrySelect(country.id)}
                    >
                      {country.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div className="countries-main">
          {selectedPin ? (
            <CountryDetail
              key={selectedPin.id}
              country={selectedPin}
              onPinSelect={onPinSelect}
              onEntrySelect={onEntrySelect}
              onVideoSelect={onVideoSelect}
            />
          ) : (
            <div className="country-detail__prompt">
              <span className="country-detail__prompt-ornament">◉</span>
              <p>Select a country from the list to begin</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
