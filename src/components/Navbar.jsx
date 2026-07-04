import { useState } from "react";

const navLinks = [
  { id: "about",      label: "About"      },
  { id: "history",    label: "History"    },
  { id: "map",        label: "Map"        },
  { id: "chronicles", label: "Chronicles" },
  { id: "catalog",    label: "Compendium" },
];

export default function Navbar({ activePage, onNavigate, onSearchOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (id) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar navbar--scrolled">
      <h1 className="navbar__brand-h">
        <button className="navbar__brand" onClick={() => navigate(null)} aria-label="The Altor Codex — home">
          <span className="navbar__sigil" aria-hidden="true">✦</span>
          <span className="navbar__title">The Altor Codex</span>
        </button>
      </h1>

      <ul id="navbar-links" className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
        {navLinks.map((link) => (
          <li key={link.id}>
            <button
              className={`navbar__link ${activePage === link.id ? "navbar__link--active" : ""}`}
              onClick={() => navigate(link.id)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="navbar__search"
        onClick={onSearchOpen}
        aria-label="Search"
        title="Search (Ctrl+K)"
      >⌕</button>

      <button
        className="navbar__burger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        aria-controls="navbar-links"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
