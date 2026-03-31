import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import InteractiveMap from "./components/InteractiveMap";
import LocationPanel from "./components/LocationPanel";
import CodexSection from "./components/CodexSection";
import MediaSection from "./components/MediaSection";
import VideoCatalog from "./components/VideoCatalog";
import VideoModal from "./components/VideoModal";
import "./App.css";

export default function App() {
  const [activeSection, setActiveSection] = useState("codex");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const handleLocationSelect = useCallback((loc) => setSelectedLocation(loc), []);
  const handlePanelClose = useCallback(() => setSelectedLocation(null), []);

  const mapRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const handleVideoSelect = useCallback((video) => setSelectedVideo(video), []);
  const handleVideoClose = useCallback(() => setSelectedVideo(null), []);
  const handlePinSelect = useCallback((pinId) => {
    setSelectedVideo(null);
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => mapRef.current?.selectPin(pinId), 600);
  }, []);

  useEffect(() => {
    const sections = ["about", "map", "codex", "chronicles", "catalog"];
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
      <Navbar activeSection={activeSection} />

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

      <CodexSection />

      <MediaSection />
      <VideoCatalog onVideoSelect={handleVideoSelect} />

      <VideoModal
        video={selectedVideo}
        onClose={handleVideoClose}
        onPinSelect={handlePinSelect}
      />

      {/* Footer */}
      <footer className="footer">
        <div className="footer__ornament">✦ ✦ ✦</div>
        <p className="footer__title">The Altor Codex</p>
        <p className="footer__sub">All knowledge within these pages is subject to revision. The world does not stand still.</p>
      </footer>
    </div>
  );
}
