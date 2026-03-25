import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pins } from "../data/locations";

const IMG_W = 3248;
const IMG_H = 2200;

function toLatLng(x, y) {
  return [IMG_H - y, x];
}

const PIN_STYLES = {
  capital: { fill: "#c8a951", size: 13, ring: true  },
  city:    { fill: "#c0c0c0", size: 9,  ring: false },
  continent: { fill: "#9a6abf", size: 14, ring: true  },
  country:   { fill: "#c87a3a", size: 11, ring: true  },
  region:  { fill: "#7a9a5a", size: 9,  ring: false },
  water:   { fill: "#4a7aaa", size: 9,  ring: false },
  mountain: { fill: "#9a9a9a", size: 9,  ring: false },
  forest:   { fill: "#4a7a3a", size: 9,  ring: false },
  site:     { fill: "#a07840", size: 9,  ring: false },
  ruin:    { fill: "#8a6520", size: 9,  ring: false },
  dungeon: { fill: "#8a2020", size: 9,  ring: false },
  shrine:  { fill: "#3a7a6a", size: 9,  ring: false },
};

const TYPE_LABELS = {
  capital: "Capitals",
  city:    "Cities",
  country: "Countries",
  region:  "Regions",
  water:   "Water",
  continent: "Continents",
  mountain: "Mountains",
  forest:   "Forests",
  site:     "Sites",
  ruin:    "Ruins",
  dungeon: "Dungeons",
  shrine:  "Shrines",
};

function makePinIcon(type) {
  const style = PIN_STYLES[type] ?? PIN_STYLES.city;
  const { fill, size, ring } = style;
  const total = size * 2;
  const stem = 7;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total + stem}" viewBox="0 0 ${total} ${total + stem}">
      ${ring ? `<circle cx="${size}" cy="${size}" r="${size - 1}" fill="none" stroke="${fill}" stroke-width="1.5" opacity="0.35"/>` : ""}
      <circle cx="${size}" cy="${size}" r="${size - 2}" fill="${fill}" stroke="#0a0807" stroke-width="1.5"/>
      ${ring ? `<circle cx="${size}" cy="${size}" r="${(size - 2) / 3}" fill="#0a0807"/>` : ""}
      <line x1="${size}" y1="${total - 2}" x2="${size}" y2="${total + stem}" stroke="${fill}" stroke-width="1.5" opacity="0.7"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "altor-pin",
    iconSize: [total, total + stem],
    iconAnchor: [size, total + stem],
    popupAnchor: [0, -(total + stem)],
  });
}

// Derive the types actually present in the pin data
const ACTIVE_TYPES = [...new Set(pins.map((p) => p.type))];

export default function InteractiveMap({ onLocationSelect }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const layerGroupsRef = useRef({});
  const onSelectRef    = useRef(onLocationSelect);
  onSelectRef.current  = onLocationSelect;

  const [visibleTypes, setVisibleTypes] = useState(() =>
    Object.fromEntries(ACTIVE_TYPES.map((t) => [t, true]))
  );

  // Build map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const bounds = [[0, 0], [IMG_H, IMG_W]];
    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      attributionControl: false,
      zoomControl: false,
      maxBounds: [[-IMG_H * 0.2, -IMG_W * 0.2], [IMG_H * 1.2, IMG_W * 1.2]],
      maxBoundsViscosity: 0.85,
    });

    L.imageOverlay("/Altor.jpg", bounds).addTo(map);
    map.fitBounds(bounds);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Create one LayerGroup per type
    const groups = {};
    ACTIVE_TYPES.forEach((type) => {
      groups[type] = L.layerGroup().addTo(map);
    });
    layerGroupsRef.current = groups;

    pins.forEach((pin) => {
      const marker = L.marker(toLatLng(pin.x, pin.y), {
        icon: makePinIcon(pin.type),
        title: pin.name,
      });

      marker.bindTooltip(
        `<span class="altor-tooltip">${pin.name}</span>`,
        { direction: "top", offset: [0, -4], className: "altor-tooltip-wrap", permanent: false }
      );

      marker.on("click", async () => {
        onSelectRef.current({ ...pin, loading: true });
        try {
          const detail = await import(`../data/locations/${pin.id}.js`);
          onSelectRef.current({ ...pin, ...detail.default, loading: false });
        } catch {
          onSelectRef.current({ ...pin, loading: false });
        }
      });

      const group = groups[pin.type] ?? groups[ACTIVE_TYPES[0]];
      marker.addTo(group);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Show/hide layer groups when visibleTypes changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(layerGroupsRef.current).forEach(([type, group]) => {
      if (visibleTypes[type]) {
        if (!map.hasLayer(group)) group.addTo(map);
      } else {
        if (map.hasLayer(group)) group.remove();
      }
    });
  }, [visibleTypes]);

  const toggleType = (type) =>
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));

  return (
    <div className="map-frame">
      <div className="map-corner map-corner--tl" />
      <div className="map-corner map-corner--tr" />
      <div className="map-corner map-corner--bl" />
      <div className="map-corner map-corner--br" />
      <div className="map-label-top">ALTOR — KNOWN TERRITORIES</div>

      <div className="map-filters">
        {ACTIVE_TYPES.map((type) => {
          const style = PIN_STYLES[type] ?? PIN_STYLES.city;
          return (
            <button
              key={type}
              className={`map-filter-btn ${visibleTypes[type] ? "map-filter-btn--on" : "map-filter-btn--off"}`}
              onClick={() => toggleType(type)}
              style={{ "--pin-color": style.fill }}
            >
              <span className="map-filter-btn__dot" />
              {TYPE_LABELS[type] ?? type}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="leaflet-map" />
      <div className="map-label-bottom">✦ Click any marker to learn more ✦</div>
    </div>
  );
}
