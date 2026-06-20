// A small radial "web of connections" for an entry: the current page at the
// centre, its cross-referenced neighbours around it, click a node to travel
// there. Pure SVG, no physics and no dependency - the neighbour count is small
// (capped), so an even radial layout reads more clearly than a force sim.
//
// nodes: [{ target, label, relation }]  where relation is one of the keys in
// RELATION below and target is an openable page handle ({kind, id, ...}).

const RELATION = {
  related:   { color: "#c8a951", label: "Related" },
  ref:       { color: "#9a8878", label: "Referenced by" },
  adventure: { color: "#a33030", label: "Adventure" },
  map:       { color: "#6fa8c8", label: "On the map" },
};

const truncate = (s, n = 18) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export default function ConnectionsGraph({ center, nodes, onOpen }) {
  if (!nodes || nodes.length === 0) return null;

  const W = 660;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) - 88;
  const N = nodes.length;

  const placed = nodes.map((n, i) => {
    // Start at the top and go clockwise; offset so a lone node sits to the side.
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    return {
      ...n,
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
      tone: RELATION[n.relation] ?? RELATION.related,
      labelBelow: Math.sin(angle) >= -0.2,
    };
  });

  const usedRelations = [...new Set(nodes.map((n) => n.relation))]
    .filter((r) => RELATION[r])
    .map((r) => [r, RELATION[r]]);

  return (
    <div className="cgraph">
      <svg
        className="cgraph__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Connections for ${center}: ${nodes.length} linked pages`}
      >
        {/* edges */}
        {placed.map((n, i) => (
          <line
            key={`e-${i}`}
            className="cgraph__edge"
            x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke={n.tone.color}
          />
        ))}

        {/* neighbour nodes */}
        {placed.map((n, i) => (
          <g
            key={`n-${i}`}
            className="cgraph__node"
            transform={`translate(${n.x}, ${n.y})`}
            onClick={() => onOpen(n.target)}
            role="button"
            tabIndex={0}
            aria-label={`${n.label} - ${n.tone.label}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(n.target); } }}
          >
            <circle r="7" fill={n.tone.color} stroke="#0a0807" strokeWidth="1.5" />
            <text
              className="cgraph__label"
              y={n.labelBelow ? 22 : -14}
              textAnchor="middle"
            >
              {truncate(n.label)}
              <title>{n.label}</title>
            </text>
          </g>
        ))}

        {/* centre node */}
        <g transform={`translate(${cx}, ${cy})`}>
          <circle className="cgraph__center" r="11" />
          <text className="cgraph__center-label" textAnchor="middle" y="30">{truncate(center, 24)}</text>
        </g>
      </svg>

      <div className="cgraph__legend">
        {usedRelations.map(([key, tone]) => (
          <span key={key} className="cgraph__legend-item">
            <span className="cgraph__legend-dot" style={{ background: tone.color }} />
            {tone.label}
          </span>
        ))}
      </div>
    </div>
  );
}
