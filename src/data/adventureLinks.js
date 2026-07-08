// Indexes linking adventures to the lands and section-entries they involve.
// Shared so the Compendium (country pages, entry pages) and the map's
// LocationPanel all read the same source of truth.
//
//   adventuresByPin:      country/region pin id → adventures set there
//                         (a place card naming it, or a mention in the
//                         title / tagline / summary).
//   adventuresByEntryId:  section-entry id → adventures featuring it
//                         (the reverse of the card links).
//   characterArtByEntryId: section-entry id → custom card art from adventures
//                         whose card links to that entry, so the linked page
//                         can show the named characters too (e.g. the Ogre
//                         page also shows Thord and Toch from The Hell Fort).
import { adventures } from "./adventures";
import { resolvePage, geoPlaces } from "./compendiumPages";

// Every card (place / npc / creature / item) an adventure declares.
function adventureCards(a) {
  const out = [];
  const push = (arr) => { for (const it of arr ?? []) out.push(it); };
  push(a.places); push(a.items); push(a.characters); push(a.creatures);
  for (const s of a.sections ?? []) { push(s.places); push(s.npcs); push(s.creatures); push(s.items); }
  return out;
}

export const adventuresByPin = {};
export const adventuresByEntryId = {};
export const characterArtByEntryId = {};

const countryPins = geoPlaces.filter((p) => p.type === "country");
for (const a of adventures) {
  const pinIds = new Set();
  const entryIds = new Set();
  for (const c of adventureCards(a)) {
    const t = resolvePage(c.entry ?? c.name);
    if (t?.kind === "country") pinIds.add(t.id);
    else if (t?.kind === "entry") {
      entryIds.add(t.id);
      // A card with its own art: surface it on the linked page as well,
      // captioned with the character's name and the adventure it comes from.
      if (c.image) {
        const art = (characterArtByEntryId[t.id] ??= []);
        if (!art.some((x) => x.src === c.image)) art.push({ src: c.image, name: c.name, adventure: a.title });
      }
    }
  }
  const hay = `${a.title ?? ""} ${a.tagline ?? ""} ${a.summary ?? ""}`.toLowerCase();
  for (const p of countryPins) if (hay.includes(p.name.toLowerCase())) pinIds.add(p.id);
  for (const id of pinIds) (adventuresByPin[id] ??= []).push(a);
  for (const id of entryIds) (adventuresByEntryId[id] ??= []).push(a);
}
