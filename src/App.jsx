import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import MediaSection from "./components/MediaSection";
import VideoCatalog from "./components/VideoCatalog";
import "./App.css";

export default function App() {
  const [activeSection, setActiveSection] = useState("chronicles");

  useEffect(() => {
    const sections = ["chronicles", "catalog"];
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

      <MediaSection />
      <VideoCatalog />

      {/* Footer */}
      <footer className="footer">
        <div className="footer__ornament">✦ ✦ ✦</div>
        <p className="footer__title">The Altor Codex</p>
        <p className="footer__sub">All knowledge within these pages is subject to revision. The world does not stand still.</p>
      </footer>
    </div>
  );
}
