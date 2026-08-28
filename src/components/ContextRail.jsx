import { SourceCredit } from "./compendiumCards";
import { useMediaQuery } from "../lib/useMediaQuery";

// The reader's right-hand column: everything *about* the page you are reading,
// kept out of the reading flow itself. Previously all of this sat below the
// prose as full-width card grids, which meant scrolling past the whole article
// to find out what it connects to.
//
// Below 1400px there is no room for a third column, so the same markup falls
// back to a stack of <details> under the prose (see .reader--stacked in the
// stylesheet). Using <details> rather than a hand-rolled accordion means the
// keyboard and screen-reader behaviour comes for free.

const KIND_LABEL = { adventure: "Adventure", country: "Land" };
const kindLabel = (k) => KIND_LABEL[k] ?? "Lore";

// Scroll to a section without touching location.hash. The app routes on the
// hash (#catalog, #map, …), so letting an anchor overwrite it would put the
// router's own state in the hands of a table-of-contents link. The href stays
// for middle-click and "copy link address"; only the default jump is replaced.
const jumpTo = (id) => (e) => {
  const el = document.getElementById(id);
  if (!el) return;                       // let the browser try, rather than swallow the click
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Move keyboard focus along with the viewport, so the next Tab continues from
  // the section rather than from the rail.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
};

function RailGroup({ title, children, open = false, stacked }) {
  if (stacked) {
    return (
      <details className="rail-group" open={open}>
        <summary className="rail-group__summary">{title}</summary>
        <div className="rail-group__body">{children}</div>
      </details>
    );
  }
  return (
    <section className="rail-group">
      <h3 className="panel-hd">{title}</h3>
      <div className="rail-group__body">{children}</div>
    </section>
  );
}

function PageLink({ page, onOpenPage }) {
  return (
    <button className="rail-link" onClick={() => onOpenPage(page)}>
      <span className="rail-link__name">{page.name}</span>
      <span className="rail-link__kind">{kindLabel(page.kind)}</span>
    </button>
  );
}

export default function ContextRail({
  headings = [],
  themes = [],
  themeLabel = {},
  onThemeSelect,
  mapPins = [],
  onPinSelect,
  subPages = [],
  related = [],
  featuredIn = [],
  referencedBy = [],
  videos = [],
  onVideoSelect,
  onOpenPage,
  sources,
  actions,
}) {
  // Below 1400px the rail drops under the prose, where a dozen fully-expanded
  // groups would be a long scroll past the end of the article. There it becomes
  // <details> instead - collapsed by default apart from the first two - which
  // also brings keyboard and screen-reader behaviour for free. Same breakpoint
  // as the layout change in the stylesheet; kept in sync by hand because the
  // element type has to change, which CSS cannot do.
  const stacked = useMediaQuery("(max-width: 1399px)");

  const has = (a) => a && a.length > 0;
  const linkable = !!onOpenPage;

  // Nothing worth a column: let the caller collapse it.
  const empty =
    !has(headings) && !has(themes) && !has(mapPins) && !has(subPages) &&
    !has(related) && !has(featuredIn) && !has(referencedBy) && !has(videos) &&
    !has(sources) && !actions;
  if (empty) return null;

  return (
    <div className={`rail-ctx ${stacked ? "rail-ctx--stacked" : ""}`}>
      {actions && <div className="rail-ctx__actions">{actions}</div>}

      {has(headings) && (
        <RailGroup title="On this page" open stacked={stacked}>
          <nav className="rail-toc">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`rail-toc__item rail-toc__item--h${h.depth}`}
                onClick={jumpTo(h.id)}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </RailGroup>
      )}

      {(has(themes) || has(mapPins)) && (
        <RailGroup title="Themes" open stacked={stacked}>
          <div className="rail-chips">
            {themes.map((id) => (
              <button key={id} className="codex-tag" onClick={() => onThemeSelect?.(id)}>
                {themeLabel[id] ?? id}
              </button>
            ))}
            {mapPins.map((p) => (
              <button
                key={p.id}
                className="codex-tag codex-tag--map"
                onClick={() => onPinSelect?.(p.id)}
              >
                ◈ {p.name} on the map
              </button>
            ))}
          </div>
        </RailGroup>
      )}

      {has(subPages) && linkable && (
        <RailGroup title="Sub-pages" open stacked={stacked}>
          {subPages.map((t) => (
            <PageLink key={`${t.kind}-${t.id}`} page={t} onOpenPage={onOpenPage} />
          ))}
        </RailGroup>
      )}

      {has(related) && linkable && (
        <RailGroup title="Related" open stacked={stacked}>
          {related.map((t) => (
            <PageLink key={`${t.kind}-${t.id}`} page={t} onOpenPage={onOpenPage} />
          ))}
        </RailGroup>
      )}

      {has(featuredIn) && linkable && (
        <RailGroup title="Featured in" stacked={stacked}>
          {featuredIn.map((a) => (
            <button
              key={a.id}
              className="rail-link"
              onClick={() => onOpenPage({ kind: "adventure", id: a.id })}
            >
              <span className="rail-link__name">{a.title}</span>
              <span className="rail-link__kind">Adventure</span>
            </button>
          ))}
        </RailGroup>
      )}

      {has(referencedBy) && linkable && (
        <RailGroup title="Referenced by" stacked={stacked}>
          {referencedBy.map((t) => (
            <PageLink key={`${t.kind}-${t.id}`} page={t} onOpenPage={onOpenPage} />
          ))}
        </RailGroup>
      )}

      {has(videos) && (
        <RailGroup title="Chronicles" stacked={stacked}>
          <div className="rail-videos">
            {videos.map((rv) => (
              <button
                key={rv.id}
                className="rail-video"
                onClick={() => onVideoSelect(rv)}
                title={rv.name}
              >
                <img
                  src={`https://img.youtube.com/vi/${rv.id}/mqdefault.jpg`}
                  alt=""
                  loading="lazy"
                />
                <span className="rail-video__play" aria-hidden="true">▶</span>
                <span className="rail-video__name">{rv.name}</span>
              </button>
            ))}
          </div>
        </RailGroup>
      )}

      {has(sources) && (
        <div className="rail-ctx__sources">
          <SourceCredit sources={sources} />
        </div>
      )}
    </div>
  );
}
