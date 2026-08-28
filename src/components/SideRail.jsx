import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { useModal } from "../lib/useModal";
import { DESTINATIONS, PHONE_PRIMARY } from "../data/navigation";

// The archive's standing navigation. On a desktop it is a fixed rail down the
// left edge; below 700px the same list becomes a bottom tab bar, because a
// vertical rail on a phone eats a fifth of the screen width and puts the targets
// where thumbs don't reach.
//
// Six destinations is one too many for a bottom bar, so the phone layout keeps
// the four most-used and folds History / About / Surprise into a "More" sheet.

function MoreSheet({ activePage, onNavigate, onSurprise, onClose }) {
  const ref = useRef(null);
  useModal(ref, onClose);

  // Choosing a destination closes the sheet on the way out, but the browser Back
  // button can change the page underneath it too - dismiss on that as well, so
  // the sheet is never left floating over a page it didn't open.
  useEffect(() => {
    window.addEventListener("popstate", onClose);
    return () => window.removeEventListener("popstate", onClose);
  }, [onClose]);

  const overflow = DESTINATIONS.filter((d) => !PHONE_PRIMARY.has(d.id));

  return (
    <>
      <div className="rail-sheet__backdrop" onClick={onClose} />
      <div className="rail-sheet framed" ref={ref} tabIndex={-1} role="dialog" aria-label="More">
        <div className="rail-sheet__grip" aria-hidden="true" />
        {overflow.map((d) => (
          <button
            key={d.label}
            className={`rail-sheet__item ${activePage === d.id ? "rail-sheet__item--active" : ""}`}
            onClick={() => { onNavigate(d.id); onClose(); }}
            data-autofocus={d === overflow[0] ? "" : undefined}
          >
            <Icon name={d.icon} size={20} />
            <span>{d.label}</span>
          </button>
        ))}
        <button className="rail-sheet__item" onClick={() => { onSurprise(); onClose(); }}>
          <Icon name="surprise" size={20} />
          <span>Surprise me</span>
        </button>
      </div>
    </>
  );
}

export default function SideRail({ activePage, onNavigate, onSearchOpen, onSurprise }) {
  const [moreOpen, setMoreOpen] = useState(false);
  // Stable, so the sheet's popstate listener subscribes once rather than on
  // every render of the rail.
  const closeMore = useCallback(() => setMoreOpen(false), []);
  const inMore = !PHONE_PRIMARY.has(activePage);

  return (
    <>
      <nav className="rail" aria-label="Sections">
        <span className="rail__sigil" aria-hidden="true">✦</span>

        <ul className="rail__list">
          {DESTINATIONS.map((d) => {
            const active = activePage === d.id;
            const phoneHidden = !PHONE_PRIMARY.has(d.id);
            return (
              <li key={d.label} className={phoneHidden ? "rail__li rail__li--overflow" : "rail__li"}>
                <button
                  className={`rail__item ${active ? "rail__item--active" : ""}`}
                  onClick={() => onNavigate(d.id)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={d.icon} />
                  <span className="rail__label">{d.label}</span>
                  <span className="rail__label rail__label--short">{d.short}</span>
                </button>
              </li>
            );
          })}

          {/* Phone only: everything that didn't fit as a tab. */}
          <li className="rail__li rail__li--more">
            <button
              className={`rail__item ${inMore ? "rail__item--active" : ""}`}
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
            >
              <Icon name="more" />
              <span className="rail__label">More</span>
            </button>
          </li>
        </ul>

        {/* Utilities. Desktop rail only - on a phone, search lives in the top
            bar and Surprise sits in the More sheet. */}
        <div className="rail__tools">
          <button className="rail__item" onClick={onSearchOpen} title="Search (Ctrl+K)">
            <Icon name="search" />
            <span className="rail__label">Search</span>
          </button>
          <button className="rail__item" onClick={onSurprise} title="Open something at random">
            <Icon name="surprise" />
            <span className="rail__label">Surprise</span>
          </button>
        </div>

        <span className="rail__seal" aria-hidden="true" />
      </nav>

      {moreOpen && (
        <MoreSheet
          activePage={activePage}
          onNavigate={onNavigate}
          onSurprise={onSurprise}
          onClose={closeMore}
        />
      )}
    </>
  );
}
