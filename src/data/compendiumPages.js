// Shared page resolver: turns a name or slug into a navigable Compendium page
// (a country, an adventure, or a section entry). Used by Compendium.jsx for its
// card cross-links and by MediaSection.jsx to link Chronicles cards to the
// Compendium pages that share their subject. One source of truth so both stay
// in step.
import { pins } from "./locations";
import { adventures } from "./adventures";
import { allEntries } from "./videoData";

export function toSlug(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['‘’ʼ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Curated non-country pins that also count as Geography places (a notable
// region/forest with a page), so they resolve like countries.
const EXTRA_GEO_PLACE_IDS = new Set(["mereld", "goiana", "krilloan", "tannatopol", "nohstril"]);
export const geoPlaces = pins
  .filter((p) => p.type === "country" || EXTRA_GEO_PLACE_IDS.has(p.id))
  .sort((a, b) => a.name.localeCompare(b.name));

const ENTRY_SECTIONS = new Set([
  "peoples", "creatures", "lore", "magic", "history", "conflicts", "characters",
]);

// slug -> page target. Priority country pin > adventure > section entry, so a
// name that is also a country resolves to its country page first.
const PAGE_BY_SLUG = (() => {
  const map = {};
  const add = (slug, val) => { if (slug && !(slug in map)) map[slug] = val; };
  for (const p of geoPlaces) add(toSlug(p.name), { kind: "country", id: p.id, name: p.name });
  for (const a of adventures) add(toSlug(a.title), { kind: "adventure", id: a.id, name: a.title });
  for (const v of allEntries)
    if (ENTRY_SECTIONS.has(v.section)) add(toSlug(v.name), { kind: "entry", id: v.id, name: v.name, entry: v });
  // Non-pin Geography pages (e.g. Caranor, Beyural) open as entries too, so links
  // and cross-references can reach them. Country pins above keep priority.
  for (const v of allEntries)
    if (v.section === "geography") add(toSlug(v.name), { kind: "entry", id: v.id, name: v.name, entry: v });
  return map;
})();

export const resolvePage = (s) => (s ? PAGE_BY_SLUG[toSlug(String(s))] ?? null : null);
