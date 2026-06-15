import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import yaml from "js-yaml";
import { SECTIONS, videosBySection, videos as allVideos, allEntries } from "../data/videoData";
import { pins } from "../data/locations";
import { entries } from "../data/codex/index.js";
import { adventures, adventureGroups } from "../data/adventures";
import { videosForPin, relatedVideosByVideo } from "../data/crossLinks";
import { thumbSrc, onThumbError } from "../lib/thumb";
import { entryImages } from "../data/entryImages.generated";

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

// A card image: shows the thumbnail, falls back to the full image if the
// thumbnail is missing. The full image is loaded by the lightbox / detail page.
function CardImage({ src, alt }) {
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
const EXTRA_GEO_PLACE_IDS = new Set(["mereld", "goiana", "krilloan", "tannatopol"]);
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
function entryMdPath(entry) {
  const sec  = entry.section[0].toUpperCase() + entry.section.slice(1);
  const slug = toSlug(entry.name);
  return skipGroup(entry.group, entry.section)
    ? `${sec}/${slug}.md`
    : `${sec}/${entry.group}/${slug}.md`;
}

// Unified page resolver: a slug (a card's explicit `entry`, or a card/place
// name) → a navigable page. Priority country pin > adventure > section entry,
// so a name that is also a country resolves to its country page first. This is
// what lets a notable card or an adventure's place card deep-link to whatever
// page in the compendium shares its name (a creature, a country, an adventure…).
const ENTRY_SECTIONS = new Set([
  "peoples", "creatures", "lore", "magic", "history", "conflicts", "characters",
]);
const PAGE_BY_SLUG = (() => {
  const map = {};
  const add = (slug, val) => { if (slug && !(slug in map)) map[slug] = val; };
  for (const p of geoPlaces) add(toSlug(p.name), { kind: "country", id: p.id, name: p.name });
  for (const a of adventures) add(toSlug(a.title), { kind: "adventure", id: a.id, name: a.title });
  for (const v of allEntries)
    if (ENTRY_SECTIONS.has(v.section)) add(toSlug(v.name), { kind: "entry", id: v.id, name: v.name, entry: v });
  return map;
})();
const resolvePage = (s) => (s ? PAGE_BY_SLUG[toSlug(String(s))] ?? null : null);

// ── Cross-reference indexes ────────────────────────────────────────────────
// Every card (place / npc / creature / item) an adventure declares.
function adventureCards(a) {
  const out = [];
  const push = (arr) => { for (const it of arr ?? []) out.push(it); };
  push(a.places); push(a.items); push(a.characters);
  for (const s of a.sections ?? []) { push(s.places); push(s.npcs); push(s.creatures); push(s.items); }
  return out;
}
// adventuresByPin: country/region id → adventures set there (a place card naming
// it, or a mention in the title/tagline/summary). adventuresByEntryId:
// section-entry id → adventures featuring it (the reverse of the card links).
const adventuresByPin = {};
const adventuresByEntryId = {};
const countryPins = geoPlaces.filter((p) => p.type === "country");
for (const a of adventures) {
  const pinIds = new Set();
  const entryIds = new Set();
  for (const c of adventureCards(a)) {
    const t = resolvePage(c.entry ?? c.name);
    if (t?.kind === "country") pinIds.add(t.id);
    else if (t?.kind === "entry") entryIds.add(t.id);
  }
  const hay = `${a.title ?? ""} ${a.tagline ?? ""} ${a.summary ?? ""}`.toLowerCase();
  for (const p of countryPins) if (hay.includes(p.name.toLowerCase())) pinIds.add(p.id);
  for (const id of pinIds) (adventuresByPin[id] ??= []).push(a);
  for (const id of entryIds) (adventuresByEntryId[id] ??= []).push(a);
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
  "necromancy": ["mentalism", "dark-magic"],
  "dark-magic": ["necromancy"],
  "the-black-water": ["ley-lines-and-magic-dead-lands", "the-bane-storm"],
  "the-bane-storm": ["necromancy", "dark-magic", "the-black-water"],
  "the-city-of-angels": ["death-angel", "the-world-of-altor"],
  "ley-lines-and-magic-dead-lands": ["dark-magic", "the-black-water"],
  // The Multiverse, Demonicum and its Guardians, and the art of demonology
  // (from the Kaos Väktare supplement).
  "the-multiverse": ["demonicum", "the-grey-halls", "the-gods", "the-world-of-altor"],
  "the-grey-halls": ["the-multiverse", "demonicum", "demonology"],
  "demonicum": ["the-multiverse", "the-grey-halls", "nehcrom", "bemoth", "caliban", "demonology"],
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
  "the-aspects-of-magic": ["animism", "elemental", "mentalism", "the-multiverse"],
  "dragon-magic": ["mentalism", "illusionism", "symbolism"],
  "illusionism": ["mentalism", "dragon-magic", "symbolism"],
  "symbolism": ["mentalism", "dragon-magic", "illusionism"],
  "staff-magic": ["the-aspects-of-magic", "notable-magic-items"],
  "harmonism": ["voice-magic", "the-aspects-of-magic"],
  "voice-magic": ["harmonism", "the-aspects-of-magic"],
  "spiritism": ["demonology", "necromancy", "the-aspects-of-magic"],
  "alchemy": ["notable-magic-items", "the-aspects-of-magic"],
  "magic-nodes-and-storms": ["the-bane-storm", "ley-lines-and-magic-dead-lands", "dark-magic"],
  "the-shaul-deck": ["ordo-magica", "the-heavenly-bodies"],
  "familiars": ["witchcraft", "spiritism", "animism"],
  "witchcraft": ["animism", "necromancy", "familiars", "the-aspects-of-magic"],
};

// ── CountryDetail ─────────────────────────────────────────────────────────
function CountryDetail({ country, onPinSelect, onEntrySelect, onVideoSelect, onOpenPage }) {
  const [locationData, setLocationData] = useState(null);
  const [markdown, setMarkdown] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  // Notable figures/places/items render as cards. A card whose name (or explicit
  // `entry`) matches another page in the compendium becomes a link to it; if it
  // also has an image, the image opens the lightbox and a "View more" link
  // navigates. Cards with no matching page keep their plain/lightbox behaviour.
  const notableGrid = (label, list, portrait = false) =>
    list.length > 0 && (
      <div className="country-detail__block">
        <p className="location-panel__section-label">{label}</p>
        <div className="country-detail__entries-grid">
          {list.map((it, i) => {
            const cls = `codex-card${(it.portrait ?? portrait) ? " codex-card--portrait" : ""}${it.fit === "contain" ? " codex-card--fit" : ""}`;
            const t = resolvePage(it.entry ?? it.name);
            // Don't link a card back to the very page it sits on.
            const target = t && !(t.kind === "country" && t.id === country.id) ? t : null;
            const linkable = target && onOpenPage;
            // A card with no image of its own borrows the image of the page its
            // "View more" link points to (e.g. a card linking to Orc shows the orc).
            const borrowed = target ? entryImages[toSlug(target.name)] : null;
            const cardImage = it.image ?? borrowed ?? null;
            const imageWrap = cardImage && (
              <div className="codex-card__image-wrap">
                <CardImage src={cardImage} alt={it.name} />
              </div>
            );
            const openLightbox = () => setLightbox([{ src: cardImage, alt: it.name, caption: it.name }]);

            if (linkable && cardImage)
              return (
                <div key={it.name ?? i} className={`${cls} codex-card--split`}>
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
                <button key={it.name ?? i} className={`${cls} codex-card--link`} onClick={() => onOpenPage(target)}>
                  {inner}
                </button>
              );
            if (cardImage)
              return (
                <button key={it.name ?? i} className={cls} onClick={openLightbox}>
                  {inner}
                </button>
              );
            return <div key={it.name ?? i} className={cls}>{inner}</div>;
          })}
        </div>
      </div>
    );

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
  // The page md may carry a YAML frontmatter block of notable figures/places/items.
  const fm = markdown && markdown.startsWith("---")
    ? markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    : null;
  let meta = {};
  if (fm) { try { meta = yaml.load(fm[1]) ?? {}; } catch { meta = {}; } }
  const body = fm ? fm[2] : (markdown ?? "");
  const figures = meta.figures ?? [];
  const notablePlaces = meta.places ?? [];
  const notableItems = meta.items ?? [];
  const images = body ? extractImages(body) : [];
  const bodyText = body ? stripImages(body).replace(/^#[^\n]*\n/, "").trim() : "";

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

      {loaded && notableGrid("Notable Figures", figures, true)}
      {loaded && notableGrid("Notable Places", notablePlaces)}
      {loaded && notableGrid("Notable Items", notableItems)}

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
                    <CardImage src={entry.image} alt={entry.title} />
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

      {lightbox && (
        <Lightbox images={lightbox} startIdx={0} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// ── EntryDetail ───────────────────────────────────────────────────────────
function EntryDetail({ entry, onVideoSelect, onBack, backLabel, onOpenPage }) {
  const [markdown, setMarkdown] = useState(null);

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

  const loaded = markdown !== null;
  const images = markdown ? extractImages(markdown) : [];
  const bodyText = markdown ? stripImages(markdown).replace(/^#[^\n]*\n/, "").trim() : "";
  const eyebrow = entry.group && !skipGroup(entry.group, entry.section)
    ? `${SECTION_LABEL[entry.section]} · ${entry.group}`
    : SECTION_LABEL[entry.section];
  const relatedVideos = (relatedVideosByVideo[entry.id] ?? [])
    .map((id) => videoById[id])
    .filter(Boolean);
  // Cross-references: adventures that feature this entry, plus any curated
  // related pages (used for the conflicts → lands + adventures links).
  const featuredIn = adventuresByEntryId[entry.id] ?? [];
  const related = (RELATED_BY_SLUG[toSlug(entry.name)] ?? [])
    .map(resolvePage)
    .filter(Boolean);

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
            />
            <div className="location-panel__watch-overlay">
              <span className="location-panel__watch-play">▶</span>
              <span className="location-panel__watch-label">Watch</span>
            </div>
          </button>
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

  // Card grid reused for NPCs / Creatures / Places / Items. Each entry has an
  // optional image, description and videoId: a card with a videoId plays it; a
  // card with only an image opens it in the lightbox (e.g. view the map full-size).
  const cardGrid = (label, items, portrait = false) =>
    items.length > 0 && (
      <div className="country-detail__block">
        <p className="location-panel__section-label">{label}</p>
        <div className="country-detail__entries-grid">
          {items.map((it, i) => {
            const cls = `codex-card${(it.portrait ?? portrait) ? " codex-card--portrait" : ""}${it.fit === "contain" ? " codex-card--fit" : ""}`;
            // A card may carry an explicit `entry: <slug>`, or simply share its
            // name with another page (a creature, a country, an adventure…). Either
            // way it deep-links there.
            const target = resolvePage(it.entry ?? it.name);
            const linkable = target && onOpenPage;
            // A card with no image of its own borrows the image of the page its
            // "View more" link points to (e.g. a card linking to Orc shows the orc).
            const borrowed = target ? entryImages[toSlug(target.name)] : null;
            const cardImage = it.image ?? borrowed ?? null;
            const imageWrap = cardImage && (
              <div className="codex-card__image-wrap">
                <CardImage src={cardImage} alt={it.name} />
              </div>
            );
            const openLightbox = () => setLightbox([{ src: cardImage, alt: it.name, caption: it.name }]);

            // Both an image and a "View more" link: keep them independently
            // clickable - the image opens the lightbox, the link opens the entry.
            if (linkable && cardImage)
              return (
                <div key={it.name ?? i} className={`${cls} codex-card--split`}>
                  <button
                    className="codex-card__image-btn"
                    onClick={openLightbox}
                    aria-label={`View image of ${it.name}`}
                  >
                    {imageWrap}
                  </button>
                  <div className="codex-card__body">
                    <p className="codex-card__title">{it.name}</p>
                    {it.description && <p className="codex-card__summary">{it.description}</p>}
                    <button
                      className="codex-card__entry-link codex-card__entry-link--btn"
                      onClick={() => onOpenPage(target)}
                    >
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
                  {linkable && (
                    <span className="codex-card__entry-link">View more ↗</span>
                  )}
                </div>
              </>
            );
            if (linkable)
              return (
                <button
                  key={it.name ?? i}
                  className={`${cls} codex-card--link`}
                  onClick={() => onOpenPage(target)}
                >
                  {inner}
                </button>
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
            if (cardImage)
              return (
                <button
                  key={it.name ?? i}
                  className={cls}
                  onClick={openLightbox}
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

  // Browser back/forward: drive the entry view from the ?ce= param.
  useEffect(() => {
    const onPop = () => {
      const id = new URLSearchParams(window.location.search).get("ce");
      if (id) {
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
    setSelectedEntry(entry);
    window.scrollTo(0, 0);
  }, []);

  // Navigate to any page resolved by the cross-reference resolver: a section
  // entry (Peoples/Creatures/Lore/…), a country page, or an adventure.
  const openPage = useCallback((target) => {
    if (!target) return;
    if (target.kind === "entry") { openEntry(target.entry); return; }
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
  // Expand the nav section that holds the current selection on first render, so
  // a deep-link (e.g. ?adventure=kandra) reveals and highlights it in the menu.
  const [openSections, setOpenSections] = useState(() => ({
    ...(selectedAdventure ? { adventures: true } : {}),
    ...(selectedCountry ? { geography: true } : {}),
  }));
  const selectedContinent = geoPlaces.find((c) => c.id === selectedCountry)?.continent;
  const [openGeoGroups, setOpenGeoGroups] = useState(() =>
    selectedContinent ? { [selectedContinent]: true } : {}
  );
  const [openSubGroups, setOpenSubGroups] = useState(() => ({}));

  const toggleSection  = (id) => setOpenSections( (p) => ({ ...p, [id]: !p[id] }));
  const toggleGeoGroup = (id) => setOpenGeoGroups((p) => ({ ...p, [id]: !p[id] }));
  const toggleSubGroup = (id) => setOpenSubGroups((p) => ({ ...p, [id]: !p[id] }));

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
          v.section !== "characters" &&
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
                    <button
                      className="compendium-nav__section-hd"
                      onClick={() => toggleSection("adventures")}
                    >
                      <span className="compendium-nav__sigil">❖</span>
                      <span className="compendium-nav__title">Adventures</span>
                      <span className="compendium-nav__count">{adventures.length}</span>
                      <span className="compendium-nav__toggle">{advOpen ? "▲" : "▼"}</span>
                    </button>
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
                                <button
                                  className="compendium-nav__group-hd"
                                  onClick={() => toggleSubGroup(subKey)}
                                >
                                  <span>{g.name}</span>
                                  <span className="compendium-nav__count">{g.adventures.length}</span>
                                  <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                                </button>
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
                                <button
                                  className="compendium-nav__group-hd"
                                  onClick={() => toggleSubGroup(subKey)}
                                >
                                  <span>Standalone</span>
                                  <span className="compendium-nav__count">{adventureGroups.standalone.length}</span>
                                  <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                                </button>
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
                                    onClick={() => { onAdventureSelect(null); onCountrySelect(c.id); setSelectedEntry(null); window.scrollTo(0, 0); }}
                                  >
                                    {c.name}
                                  </button>
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

              {/* Other entry sections — skip geography/countries/episodes/characters */}
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
                      // A group whose name just repeats the section (e.g. the
                      // "Magic" group under the Magic section) is redundant —
                      // render its entries flat, with no sub-header.
                      const flat = !g.group || skipGroup(g.group, section.id);
                      const subKey = `${section.id}-${g.group ?? i}`;
                      const subOpen = openSubGroups[subKey] ?? false;
                      return (
                        <div key={g.group ?? `__g${i}`} className="compendium-nav__group">
                          {!flat ? (
                            <button
                              className="compendium-nav__group-hd"
                              onClick={() => toggleSubGroup(subKey)}
                            >
                              <span>{g.group}</span>
                              <span className="compendium-nav__count">{g.videos.length}</span>
                              <span className="compendium-nav__toggle">{subOpen ? "▲" : "▼"}</span>
                            </button>
                          ) : null}
                          {(flat ? true : subOpen) && (
                            <ul className="compendium-nav__list">
                              {g.videos.map((v) => (
                                <li key={v.id}>
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
              })}
            </nav>
          )}
        </aside>

        {/* ── Right panel ── */}
        <div className="compendium-main">
          {selectedEntry ? (
            <EntryDetail
              key={selectedEntry.id}
              entry={selectedEntry}
              onVideoSelect={onVideoSelect}
              onOpenPage={openPage}
              onBack={selectedAdventure ? () => window.history.back() : null}
              backLabel={selectedAdventure ? (adventures.find((a) => a.id === selectedAdventure)?.title ?? "adventure") : ""}
            />
          ) : selectedPin ? (
            <CountryDetail
              key={selectedPin.id}
              country={selectedPin}
              onPinSelect={onPinSelect}
              onEntrySelect={onEntrySelect}
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
