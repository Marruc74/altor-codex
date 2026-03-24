import { useState } from "react";
import { regions, cities } from "../data/locations";

const MOUNTAIN_GROUPS = [
  // Ember Highlands mountains
  { x: 490, y: 230, s: 1.2 }, { x: 520, y: 250, s: 1.0 }, { x: 545, y: 215, s: 0.9 },
  { x: 560, y: 255, s: 1.1 }, { x: 510, y: 270, s: 0.8 },
  // Northern border
  { x: 420, y: 75, s: 0.8 }, { x: 445, y: 68, s: 0.7 }, { x: 470, y: 78, s: 0.9 },
];

const FOREST_DOTS = [
  { x: 220, y: 290 }, { x: 240, y: 310 }, { x: 260, y: 295 }, { x: 250, y: 330 },
  { x: 280, y: 350 }, { x: 300, y: 320 }, { x: 270, y: 370 }, { x: 230, y: 355 },
  { x: 310, y: 370 }, { x: 320, y: 340 }, { x: 290, y: 310 }, { x: 215, y: 340 },
];

function Mountain({ x, y, s = 1 }) {
  return (
    <polygon
      points={`${x},${y - 16 * s} ${x - 10 * s},${y} ${x + 10 * s},${y}`}
      fill="none"
      stroke="#c8a95180"
      strokeWidth="1"
    />
  );
}

function Tree({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="4" fill="#2d6a3480" />
      <circle cx={x} cy={y} r="2.5" fill="#3d8a4480" />
    </g>
  );
}

export default function InteractiveMap({ onLocationSelect }) {
  const [hoveredId, setHoveredId] = useState(null);

  const handleRegionClick = (region) => {
    onLocationSelect(region);
  };

  const handleCityClick = (e, city) => {
    e.stopPropagation();
    onLocationSelect(city);
  };

  return (
    <div className="map-container">
      <div className="map-frame">
        <div className="map-corner map-corner--tl" />
        <div className="map-corner map-corner--tr" />
        <div className="map-corner map-corner--bl" />
        <div className="map-corner map-corner--br" />

        <div className="map-label-top">ALTOR — KNOWN TERRITORIES</div>
        <div className="map-label-bottom">✦ Click any region or city to learn more ✦</div>

        <svg
          className="map-svg"
          viewBox="0 0 700 620"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Interactive map of Altor"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="city-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="sea-gradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0d1f2f" />
              <stop offset="100%" stopColor="#060e16" />
            </radialGradient>
            <pattern id="sea-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0,20 Q10,15 20,20 Q30,25 40,20" fill="none" stroke="#1a3a5040" strokeWidth="0.8" />
              <path d="M0,30 Q10,25 20,30 Q30,35 40,30" fill="none" stroke="#1a3a5030" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Sea */}
          <rect width="700" height="620" fill="url(#sea-gradient)" />
          <rect width="700" height="620" fill="url(#sea-pattern)" />

          {/* Regions */}
          {regions.map((region) => (
            <g key={region.id}>
              <polygon
                points={region.points}
                fill={hoveredId === region.id ? region.hoverColor : region.color}
                stroke="#c8a95160"
                strokeWidth="1.5"
                strokeLinejoin="round"
                style={{
                  cursor: "pointer",
                  transition: "fill 0.25s ease",
                  filter: hoveredId === region.id ? "url(#glow)" : "none",
                }}
                onMouseEnter={() => setHoveredId(region.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleRegionClick(region)}
              />
              {/* Region border highlight on hover */}
              {hoveredId === region.id && (
                <polygon
                  points={region.points}
                  fill="none"
                  stroke="#c8a951"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          ))}

          {/* Decorative mountains */}
          {MOUNTAIN_GROUPS.map((m, i) => (
            <Mountain key={i} x={m.x} y={m.y} s={m.s} />
          ))}

          {/* Decorative trees */}
          {FOREST_DOTS.map((t, i) => (
            <Tree key={i} x={t.x} y={t.y} />
          ))}

          {/* Coastline detail lines */}
          <path
            d="M 200,520 Q 230,540 270,535 Q 310,530 340,545 Q 370,558 400,550 Q 430,540 460,535"
            fill="none"
            stroke="#1a3a5060"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />

          {/* Region labels */}
          {regions.map((region) => {
            const pts = region.points.split(" ").map((p) => p.split(",").map(Number));
            const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
            const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
            return (
              <text
                key={region.id + "-label"}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={hoveredId === region.id ? "#e8d5a3" : "#c8a95180"}
                fontSize="9"
                fontFamily="'Cinzel', serif"
                letterSpacing="2"
                style={{ pointerEvents: "none", transition: "fill 0.25s" }}
              >
                {region.name.toUpperCase()}
              </text>
            );
          })}

          {/* Cities */}
          {cities.map((city) => (
            <g
              key={city.id}
              style={{ cursor: "pointer" }}
              onClick={(e) => handleCityClick(e, city)}
              onMouseEnter={() => setHoveredId(city.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Pulse ring on hover */}
              {hoveredId === city.id && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="12"
                  fill="none"
                  stroke="#c8a951"
                  strokeWidth="1"
                  opacity="0.5"
                  style={{ pointerEvents: "none" }}
                />
              )}
              {/* City marker */}
              <circle
                cx={city.x}
                cy={city.y}
                r={city.type === "capital" ? 6 : 4}
                fill={hoveredId === city.id ? "#e8d5a3" : "#c8a951"}
                stroke="#0c0a08"
                strokeWidth="1.5"
                filter="url(#city-glow)"
                style={{ transition: "r 0.2s ease, fill 0.2s ease" }}
              />
              {city.type === "capital" && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="2.5"
                  fill="#0c0a08"
                  style={{ pointerEvents: "none" }}
                />
              )}
              {/* City name */}
              <text
                x={city.x}
                y={city.y - 11}
                textAnchor="middle"
                fill={hoveredId === city.id ? "#e8d5a3" : "#c8a951aa"}
                fontSize={city.type === "capital" ? "8.5" : "7.5"}
                fontFamily="'Cinzel', serif"
                letterSpacing="1"
                style={{ pointerEvents: "none", transition: "fill 0.2s" }}
              >
                {city.name}
              </text>
            </g>
          ))}

          {/* Compass rose */}
          <g transform="translate(630, 65)">
            <circle cx="0" cy="0" r="22" fill="none" stroke="#c8a95130" strokeWidth="1" />
            <circle cx="0" cy="0" r="3" fill="#c8a951" />
            {/* N */}
            <polygon points="0,-18 -4,-8 0,-12 4,-8" fill="#c8a951" />
            {/* S */}
            <polygon points="0,18 -4,8 0,12 4,8" fill="#c8a95160" />
            {/* E */}
            <polygon points="18,0 8,-4 12,0 8,4" fill="#c8a95160" />
            {/* W */}
            <polygon points="-18,0 -8,-4 -12,0 -8,4" fill="#c8a95160" />
            <text x="0" y="-24" textAnchor="middle" fill="#c8a951" fontSize="9" fontFamily="'Cinzel', serif">N</text>
          </g>

          {/* Scale bar */}
          <g transform="translate(30, 590)">
            <line x1="0" y1="0" x2="80" y2="0" stroke="#c8a95160" strokeWidth="1" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#c8a95160" strokeWidth="1" />
            <line x1="80" y1="-4" x2="80" y2="4" stroke="#c8a95160" strokeWidth="1" />
            <text x="40" y="-7" textAnchor="middle" fill="#c8a95180" fontSize="7" fontFamily="'Cinzel', serif">100 LEAGUES</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
