import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import InteractiveMap from "./components/InteractiveMap";
import LocationPanel from "./components/LocationPanel";
import Timeline from "./components/Timeline";
import CodexSection from "./components/CodexSection";
import Compendium from "./components/Compendium";
import MediaSection from "./components/MediaSection";
import VideoModal from "./components/VideoModal";
import GlobalSearch from "./components/GlobalSearch";
import EmberCanvas from "./components/EmberCanvas";
import { entries } from "./data/codex/index.js";
import { pins } from "./data/locations";
import "./App.css";

// ── URL helpers ──────────────────────────────────────────────
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
function setParam(key, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  history.replaceState(null, "", url);
}

function getInitialPage() {
  // URL params take priority — navigate to the relevant section
  if (getParam("pin"))     return "map";
  if (getParam("entry"))   return "codex";
  if (getParam("country")) return "catalog";
  // Otherwise read hash
  const hash = window.location.hash.replace("#", "");
  const valid = ["about", "history", "map", "codex", "chronicles", "catalog"];
  return valid.includes(hash) ? hash : null;
}

const MOTES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 3.9) % 90}%`,
  top:  `${20 + (i * 2.7) % 65}%`,
  size: `${1.1 + (i % 5) * 0.35}px`,
  duration: `${9 + (i % 7) * 2.1}s`,
  delay: `${-(i * 0.85)}s`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 9)}px`,
  opacity: 0.3 + (i % 3) * 0.13,
}));

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);

  const mapRef      = useRef(null);
  const codexRef    = useRef(null);
  const imageWrapRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    if (!imageWrapRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    imageWrapRef.current.style.transform = `translate(${cx * -14}px, ${cy * -9}px)`;
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    if (!imageWrapRef.current) return;
    imageWrapRef.current.style.transform = "";
  }, []);

  const navigate = useCallback((id) => {
    setActivePage(id);
    window.location.hash = id ?? "";
    window.scrollTo({ top: 0 });
  }, []);

  // When map becomes active, Leaflet needs to recalculate size
  useEffect(() => {
    if (activePage === "map") {
      const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
      return () => clearTimeout(t);
    }
  }, [activePage]);

  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K / Cmd+K opens global search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const handleLocationSelect = useCallback((loc) => setSelectedLocation(loc), []);
  const handlePanelClose = useCallback(() => setSelectedLocation(null), []);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const handleVideoSelect = useCallback((video) => setSelectedVideo(video), []);
  const handleVideoClose = useCallback(() => setSelectedVideo(null), []);

  const handlePinSelect = useCallback((pinId) => {
    setSelectedVideo(null);
    navigate("map");
    setTimeout(() => mapRef.current?.selectPin(pinId), 150);
  }, [navigate]);

  const handleGlobalEntrySelect = useCallback((id) => {
    navigate("codex");
    setTimeout(() => codexRef.current?.openEntry(id), 150);
  }, [navigate]);

  const handleSurprise = useCallback(() => {
    if (Math.random() < 0.5) {
      const entry = entries[Math.floor(Math.random() * entries.length)];
      navigate("codex");
      setTimeout(() => codexRef.current?.openEntry(entry.id), 150);
    } else {
      const pin = pins[Math.floor(Math.random() * pins.length)];
      handlePinSelect(pin.id);
    }
  }, [navigate, handlePinSelect]);

  const [initialPinId]   = useState(() => getParam("pin"));
  const [initialEntryId] = useState(() => getParam("entry"));

  // Deep-link: select pin or entry after mount
  useEffect(() => {
    if (initialPinId) {
      setTimeout(() => mapRef.current?.selectPin(initialPinId), 300);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selected pin → URL
  useEffect(() => {
    if (selectedLocation) setParam("pin", selectedLocation.id);
    else setParam("pin", null);
  }, [selectedLocation]);

  const handleEntryOpen  = useCallback((id) => setParam("entry", id), []);
  const handleEntryClose = useCallback(() => setParam("entry", null), []);

  const [selectedCountry, setSelectedCountry] = useState(() => getParam("country"));
  const handleCountrySelect = useCallback((id) => {
    setSelectedCountry(id);
    setParam("country", id);
  }, []);

  return (
    <div className="app">
      <Navbar activePage={activePage} onNavigate={navigate} onSearchOpen={() => setSearchOpen(true)} />

      {/* Hero — shown only on home */}
      {activePage === null && (
        <header className="hero" onMouseMove={handleHeroMouseMove} onMouseLeave={handleHeroMouseLeave}>
          {/* SVG grain filter definition */}
          <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
            <defs>
              <filter id="hero-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
          </svg>

          <div className="hero__bg" />
          <div className="hero__image-wrap" ref={imageWrapRef}>
            <img src="/hero-bg.jpg" alt="The Altor Codex — an ancient tome by candlelight" className="hero__image" />
            <div className="hero__image-fade" />
          </div>

          {/* Dust motes */}
          <div className="hero__motes" aria-hidden="true">
            {MOTES.map(m => (
              <span key={m.id} className="mote" style={{
                left: m.left,
                top: m.top,
                width: m.size,
                height: m.size,
                animationDuration: m.duration,
                animationDelay: m.delay,
                "--mote-drift": m.drift,
                opacity: m.opacity,
              }} />
            ))}
          </div>

          {/* Floating ember particles */}
          <EmberCanvas />

          {/* Film grain overlay */}
          <div className="hero__grain" aria-hidden="true" />

          <div className="hero__content">
            <p className="hero__description">
              A compendium of the known world — its regions, cities, histories, and secrets.
              What you find here may save your life. What you don't find here might end it.
            </p>
            <button className="hero__surprise" onClick={handleSurprise}>
              ✦ Surprise me
            </button>
          </div>
        </header>
      )}

      {/* About */}
      {activePage === "about" && (
        <section id="about" className="about-section page">
          <div className="section-header">
            <p className="section-eyebrow">The Setting</p>
            <h2 className="section-title">About this World</h2>
          </div>
          <div className="about-body">
            <p>
              Ereb Altor is the classic campaign setting for the Swedish roleplaying game{" "}
              <em>Drakar och Demoner</em>. Altor is the world, while Ereb is the main continent
              where most adventures take place.
            </p>
            <p>
              Created in 1989, Ereb Altor was designed to unify earlier standalone adventures
              into a shared world. Rather than being built from a single plan, it grew gradually
              through many authors and modules. This gives the setting a varied and flexible
              nature, where different cultures, time periods, and tones exist side by side.
            </p>
            <p>
              The world of Ereb is diverse and expansive. It contains kingdoms, city-states,
              tribal lands, and remote frontiers, each with its own identity. Landscapes range
              from frozen northern regions and dense forests to fertile inland seas and harsh
              coastal territories. No single empire dominates the continent, and power is often
              fragmented and contested.
            </p>
            <p>
              Magic, gods, and ancient history play an important role. Ruins of lost
              civilizations are common, and the past often influences the present. Different
              regions interpret religion, magic, and knowledge in their own ways, adding to the
              world's depth.
            </p>
            <p>
              Ereb Altor supports many styles of play, from classic heroic adventures to
              political intrigue, exploration, and darker, more mysterious stories. Its open and
              modular design encourages expansion, making it a flexible setting where new ideas
              and stories can easily be added.
            </p>
          </div>
        </section>
      )}

      {/* History */}
      {activePage === "history" && (
        <div className="page">
          <Timeline onVideoSelect={handleVideoSelect} />
        </div>
      )}

      {/* Map — always mounted, hidden when not active */}
      <div style={activePage !== "map" ? { display: "none" } : {}}>
        <section id="map" className="map-section">
          <div className="section-header">
            <h2 className="section-title">The Known World</h2>
            <p className="section-sub">Pan and zoom to explore. Click a marker to open its codex entry.</p>
          </div>
          <div className="map-container">
            <InteractiveMap ref={mapRef} onLocationSelect={handleLocationSelect} />
          </div>
        </section>
        <LocationPanel
          location={selectedLocation}
          onClose={handlePanelClose}
          onVideoSelect={handleVideoSelect}
        />
      </div>

      {/* Codex */}
      {activePage === "codex" && (
        <div className="page">
          <CodexSection
            ref={codexRef}
            initialEntryId={initialEntryId}
            onEntryOpen={handleEntryOpen}
            onEntryClose={handleEntryClose}
          />
        </div>
      )}

      {/* Chronicles */}
      {activePage === "chronicles" && (
        <div className="page">
          <MediaSection />
        </div>
      )}

      {/* Compendium */}
      {activePage === "catalog" && (
        <div className="page">
          <Compendium
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
            onPinSelect={handlePinSelect}
            onEntrySelect={handleGlobalEntrySelect}
            onVideoSelect={handleVideoSelect}
          />
        </div>
      )}

      <VideoModal
        video={selectedVideo}
        onClose={handleVideoClose}
        onPinSelect={handlePinSelect}
      />

      {searchOpen && (
        <GlobalSearch
          onPinSelect={handlePinSelect}
          onEntrySelect={handleGlobalEntrySelect}
          onVideoSelect={handleVideoSelect}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Footer — shown on home only */}
      {activePage === null && (
        <footer className="footer">
          <div className="footer__ornament">✦ ✦ ✦</div>
          <p className="footer__title">The Altor Codex</p>
          <p className="footer__sub">All knowledge within these pages is subject to revision. The world does not stand still.</p>
        </footer>
      )}
    </div>
  );
}
