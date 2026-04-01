import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
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

function makePinIcon(type, selected = false) {
  const style = PIN_STYLES[type] ?? PIN_STYLES.city;
  const { fill, ring } = style;
  const size = selected ? Math.round(style.size * 1.6) : style.size;
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

const InteractiveMap = forwardRef(function InteractiveMap({ onLocationSelect }, ref) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const markersRef    = useRef({}); // { [pin.id]: { marker, pin } }
  const onSelectRef   = useRef(onLocationSelect);
  onSelectRef.current = onLocationSelect;

  const [visibleTypes, setVisibleTypes] = useState(() =>
    Object.fromEntries(ACTIVE_TYPES.map((t) => [t, true]))
  );

  const [miniRect, setMiniRect] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const searchRef = useRef(null);
  const selectedPinRef = useRef(null); // id of currently selected pin

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
        // Restore previous selected pin to normal size
        if (selectedPinRef.current && selectedPinRef.current !== pin.id) {
          const prev = markersRef.current[selectedPinRef.current];
          if (prev) prev.marker.setIcon(makePinIcon(prev.pin.type, false));
        }
        selectedPinRef.current = pin.id;
        marker.setIcon(makePinIcon(pin.type, true));

        onSelectRef.current({ ...pin, loading: true });
        try {
          const detail = await import(`../data/locations/${pin.id}.js`);
          onSelectRef.current({ ...pin, ...detail.default, loading: false });
        } catch {
          onSelectRef.current({ ...pin, loading: false });
        }
      });

      marker.addTo(map);
      markersRef.current[pin.id] = { marker, pin };
    });

    mapRef.current = map;

    const updateMini = () => {
      const b = map.getBounds();
      const n = Math.min(b.getNorth(), IMG_H);
      const s = Math.max(b.getSouth(), 0);
      const w = Math.max(b.getWest(),  0);
      const e = Math.min(b.getEast(),  IMG_W);
      // Hide when showing ≥ 75% of the full image
      if ((e - w) / IMG_W > 0.75 && (n - s) / IMG_H > 0.75) {
        setMiniRect(null);
      } else {
        setMiniRect({
          top:    (IMG_H - n) / IMG_H * 100,
          left:   w          / IMG_W * 100,
          width:  (e - w)    / IMG_W * 100,
          height: (n - s)    / IMG_H * 100,
        });
      }
    };
    map.on("moveend zoomend", updateMini);
    setTimeout(updateMini, 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Unified visibility: type toggles + search filtering
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const q = searchQuery.trim().toLowerCase();

    Object.values(markersRef.current).forEach(({ marker, pin }) => {
      const typeVisible   = visibleTypes[pin.type] ?? true;
      const searchVisible = !q || pin.name.toLowerCase().includes(q);
      const show = typeVisible && searchVisible;

      if (show && !map.hasLayer(marker)) marker.addTo(map);
      if (!show && map.hasLayer(marker)) marker.remove();
    });
  }, [visibleTypes, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e) => {
      if (!searchRef.current?.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [searchOpen]);

  const flyToPin = async (pin) => {
    setSearchQuery("");
    setSearchOpen(false);
    const map = mapRef.current;

    // Update selected pin icon
    if (selectedPinRef.current && selectedPinRef.current !== pin.id) {
      const prev = markersRef.current[selectedPinRef.current];
      if (prev) prev.marker.setIcon(makePinIcon(prev.pin.type, false));
    }
    selectedPinRef.current = pin.id;
    const entry = markersRef.current[pin.id];
    if (entry) entry.marker.setIcon(makePinIcon(pin.type, true));

    if (map) map.flyTo(toLatLng(pin.x, pin.y), 1, { duration: 1 });
    onSelectRef.current({ ...pin, loading: true });
    try {
      const detail = await import(`../data/locations/${pin.id}.js`);
      onSelectRef.current({ ...pin, ...detail.default, loading: false });
    } catch {
      onSelectRef.current({ ...pin, loading: false });
    }
  };

  useImperativeHandle(ref, () => ({
    selectPin: (pinId) => {
      const entry = markersRef.current[pinId];
      if (entry) flyToPin(entry.pin);
    },
    invalidateSize: () => mapRef.current?.invalidateSize(),
  }));

  const toggleType = (type) =>
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));

  const searchResults = searchQuery.trim()
    ? pins.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ).slice(0, 8)
    : [];

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

      <div className="map-search" ref={searchRef}>
        <div className="map-search__wrap">
          <span className="map-search__icon">⌕</span>
          <input
            className="map-search__input"
            type="search"
            placeholder="Filter locations…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            aria-label="Filter locations"
          />
          {searchQuery && (
            <button
              className="map-search__clear"
              onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
              aria-label="Clear search"
            >✕</button>
          )}
        </div>
        {searchOpen && searchResults.length > 0 && (
          <ul className="map-search__dropdown" role="listbox">
            {searchResults.map((pin) => {
              const style = PIN_STYLES[pin.type] ?? PIN_STYLES.city;
              return (
                <li key={pin.id} role="option">
                  <button
                    className="map-search__result"
                    onClick={() => flyToPin(pin)}
                  >
                    <span className="map-search__result-dot" style={{ background: style.fill }} />
                    <span className="map-search__result-name">{pin.name}</span>
                    <span className="map-search__result-type">{TYPE_LABELS[pin.type] ?? pin.type}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div ref={containerRef} className="leaflet-map" />

      {miniRect && (
        <div className="minimap">
          <img src="/Altor.jpg" className="minimap__img" alt="Overview" />
          <div
            className="minimap__rect"
            style={{
              top:    `${miniRect.top}%`,
              left:   `${miniRect.left}%`,
              width:  `${miniRect.width}%`,
              height: `${miniRect.height}%`,
            }}
          />
        </div>
      )}

      <div className="map-label-bottom">✦ Click any marker to learn more ✦</div>
    </div>
  );
});

export default InteractiveMap;
