import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import InteractiveMap from "./components/InteractiveMap";
import LocationPanel from "./components/LocationPanel";
import Timeline from "./components/Timeline";
import CodexSection from "./components/CodexSection";
import MediaSection from "./components/MediaSection";
import VideoCatalog from "./components/VideoCatalog";
import VideoModal from "./components/VideoModal";
import GlobalSearch from "./components/GlobalSearch";
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
    url.searchParams.delete(key === "pin" ? "entry" : "pin");
  } else {
    url.searchParams.delete(key);
  }
  history.replaceState(null, "", url);
}

export default function App() {
  const [activeSection, setActiveSection] = useState("codex");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const handleLocationSelect = useCallback((loc) => setSelectedLocation(loc), []);
  const handlePanelClose = useCallback(() => setSelectedLocation(null), []);

  const mapRef   = useRef(null);
  const codexRef = useRef(null);

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

  const handleGlobalEntrySelect = useCallback((id) => {
    codexRef.current?.openEntry(id);
    document.getElementById("codex")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const handleVideoSelect = useCallback((video) => setSelectedVideo(video), []);
  const handleVideoClose = useCallback(() => setSelectedVideo(null), []);
  const handlePinSelect = useCallback((pinId) => {
    setSelectedVideo(null);
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => mapRef.current?.selectPin(pinId), 600);
  }, []);

  const handleSurprise = useCallback(() => {
    if (Math.random() < 0.5) {
      const entry = entries[Math.floor(Math.random() * entries.length)];
      codexRef.current?.openEntry(entry.id);
      document.getElementById("codex")?.scrollIntoView({ behavior: "smooth" });
    } else {
      const pin = pins[Math.floor(Math.random() * pins.length)];
      handlePinSelect(pin.id);
    }
  }, [handlePinSelect]);

  // Read URL params once, synchronously, before any effect can modify them
  const [initialPinId]   = useState(() => getParam("pin"));
  const [initialEntryId] = useState(() => getParam("entry"));

  // Deep-link on page load
  useEffect(() => {
    if (initialPinId) {
      document.getElementById("map")?.scrollIntoView({ block: "start" });
      const t = setTimeout(() => mapRef.current?.selectPin(initialPinId), 300);
      return () => clearTimeout(t);
    }
    if (initialEntryId) {
      document.getElementById("codex")?.scrollIntoView({ block: "start" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selected pin → URL (skip first render to avoid clobbering deep-link params)
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    if (selectedLocation) setParam("pin", selectedLocation.id);
    else setParam("pin", null);
  }, [selectedLocation]);

  const handleEntryOpen  = useCallback((id) => setParam("entry", id), []);
  const handleEntryClose = useCallback(() => setParam("entry", null), []);

  useEffect(() => {
    const sections = ["about", "history", "map", "codex", "chronicles", "catalog"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="app">
      <Navbar activeSection={activeSection} onSearchOpen={() => setSearchOpen(true)} />

      {/* Hero */}
      <header className="hero">
        <div className="hero__bg" />
        <div className="hero__image-wrap">
          <img src="/hero-bg.jpg" alt="The Altor Codex — an ancient tome by candlelight" className="hero__image" />
          <div className="hero__image-fade" />
        </div>
        <div className="hero__content">
          <p className="hero__description">
            A compendium of the known world — its regions, cities, histories, and secrets.
            What you find here may save your life. What you don't find here might end it.
          </p>
          <button
            className="hero__cta"
            onClick={() => document.getElementById("chronicles")?.scrollIntoView({ behavior: "smooth" })}
          >
            Open the Codex
            <span className="hero__cta-arrow">↓</span>
          </button>
          <button className="hero__surprise" onClick={handleSurprise}>
            ✦ Surprise me
          </button>
        </div>
        <div className="hero__scroll-hint">✦ Scroll to explore ✦</div>
      </header>

      {/* About Section */}
      <section id="about" className="about-section">
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

      <Timeline onVideoSelect={handleVideoSelect} />

      {/* Map Section */}
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

      <CodexSection
        ref={codexRef}
        initialEntryId={initialEntryId}
        onEntryOpen={handleEntryOpen}
        onEntryClose={handleEntryClose}
      />

      <MediaSection />
      <VideoCatalog onVideoSelect={handleVideoSelect} />

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

      {/* Footer */}
      <footer className="footer">
        <div className="footer__ornament">✦ ✦ ✦</div>
        <p className="footer__title">The Altor Codex</p>
        <p className="footer__sub">All knowledge within these pages is subject to revision. The world does not stand still.</p>
      </footer>
    </div>
  );
}
