import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { SECTIONS, videosBySection, allEntries } from "../data/videoData";
import { adventures, adventureGroups } from "../data/adventures";
import { orientClass, SECTION_LABEL, CONTINENTS, placeKind, hubFromUrl, PAGE_UNIVERSE, TOTAL_PAGES, geoChildrenByParent, childrenByParentSlug, toSlug, skipGroup, hashStr, pickEntryImage, videoById } from "./compendiumHelpers";
import { CardImage, Breadcrumbs, RefStrip } from "./compendiumCards";
import { HubView, CountryDetail, EntryDetail, AdventureDetail } from "./compendiumDetails";
import { entryImagesAll } from "../data/entryImagesAll.generated";
import { themes, slugsByTheme, themeLabel } from "../data/compendiumTags";
import { resolvePage, geoPlaces } from "../data/compendiumPages";
import { useRecents, useBookmarks, useSeenKeys } from "../lib/library.js";
import Gazetteer from "./Gazetteer";

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

  // Flat search across countries + entries + adventures. Entries cover both
  // video-backed and markdown-only Peoples/Creatures/Lore pages (via allEntries);
  // adventures live in their own list, so they are matched separately on title,
  // tagline, summary and the names of the cards they hold.
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

    const advText = (a) =>
      [
        a.title, a.tagline, a.summary,
        ...(a.characters ?? []).map((c) => c.name),
        ...(a.creatures ?? []).map((c) => c.name),
        ...(a.places ?? []).map((c) => c.name),
        ...(a.items ?? []).map((c) => c.name),
        ...(a.sections ?? []).flatMap((s) =>
          [...(s.npcs ?? []), ...(s.creatures ?? []), ...(s.places ?? []), ...(s.items ?? [])].map((c) => c.name)
        ),
      ].filter(Boolean).join(" ").toLowerCase();

    const matchAdventures = adventures
      .filter((a) => advText(a).includes(q))
      .map((a) => ({ kind: "adventure", id: a.id, label: a.title, sub: "Adventure" }));

    return [...matchCountries, ...matchEntries, ...matchAdventures];
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
      if (cands.length === 0) return { image: null, portrait: false, square: false, tall: false };
      const slug = cands[hashStr("sec:" + key, imgSalt) % cands.length];
      const choice = pickEntryImage(slug, imgSalt);
      return { image: choice?.src ?? null, portrait: !!choice?.portrait, square: !!choice?.square, tall: !!choice?.tall };
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
                    key={`${r.kind}-${r.id}`}
                    className={`compendium-results__item${
                      (r.kind === "country" && selectedCountry === r.id) ||
                      (r.kind === "adventure" && selectedAdventure === r.id)
                        ? " compendium-results__item--active"
                        : ""
                    }`}
                    onClick={() => {
                      if (r.kind === "country") { onAdventureSelect(null); onCountrySelect(r.id); setSelectedEntry(null); }
                      else if (r.kind === "adventure") { onAdventureSelect(r.id); onCountrySelect(null); setSelectedEntry(null); }
                      else { onAdventureSelect(null); setSelectedEntry(r.entry); onCountrySelect(null); }
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

