import { useState, useEffect } from "react";

const navLinks = [
  { id: "map",        label: "Map"        },
  { id: "codex",      label: "Codex"      },
  { id: "chronicles", label: "Chronicles" },
  { id: "catalog",    label: "Compendium" },
];

export default function Navbar({ activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <span className="navbar__sigil">✦</span>
        <span className="navbar__title">The Altor Codex</span>
      </div>

      <ul className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
        {navLinks.map((link) => (
          <li key={link.id}>
            <button
              className={`navbar__link ${activeSection === link.id ? "navbar__link--active" : ""}`}
              onClick={() => scrollTo(link.id)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="navbar__burger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
