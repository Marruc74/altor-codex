import Icon from "./Icon";

// The top bar carries identity and search. Section navigation lives in the rail
// (SideRail), so this no longer duplicates it - on a phone the bar shrinks to
// the wordmark plus a search button and the rail becomes the bottom tab bar.

export default function Navbar({ onNavigate, onSearchOpen }) {
  return (
    <header className="topbar">
      <h1 className="topbar__brand-h">
        <button
          className="topbar__brand"
          onClick={() => onNavigate(null)}
          aria-label="The Altor Codex — home"
        >
          <span className="topbar__sigil" aria-hidden="true">✦</span>
          <span className="topbar__lockup">
            <span className="topbar__title">The Altor Codex</span>
            <span className="topbar__edition">Ereb Altor</span>
            <span className="topbar__tagline">a Drakar och Demoner archive</span>
          </span>
        </button>
      </h1>

      <button className="topbar__search" onClick={onSearchOpen}>
        <Icon name="search" size={18} className="topbar__search-icon" />
        <span className="topbar__search-text">
          Search the archive - places, peoples, creatures, chronicles…
        </span>
        <kbd className="topbar__kbd">Ctrl K</kbd>
      </button>

      <button
        className="topbar__search-btn"
        onClick={onSearchOpen}
        aria-label="Search"
        title="Search (Ctrl+K)"
      >
        <Icon name="search" size={20} />
      </button>
    </header>
  );
}
