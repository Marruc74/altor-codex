// Pure helpers and derived data for the Compendium: slug/path utilities, the
// image picker, page-universe sets, nav-nesting maps, and the curated related
// links. Extracted from Compendium.jsx so the UI components read cleaner. No
// JSX and no Vite-only import.meta.glob here, so it stays plainly importable.
import { SECTIONS, videosBySection, videos as allVideos, allEntries } from "../data/videoData";
import { adventures } from "../data/adventures";
import { entryImagesAll } from "../data/entryImagesAll.generated";
import { geoPlaces } from "../data/compendiumPages";

// Portrait art gets a 2:3 frame, very tall (9:16) art an even taller frame,
// square art a square frame; anything else uses the default widescreen frame.
// The flags are mutually exclusive.
export function orientClass(o) {
  if (o?.tall) return " codex-card--tall";
  if (o?.portrait) return " codex-card--portrait";
  if (o?.square) return " codex-card--square";
  return "";
}

export function refToTarget(ref) {
  if (!ref) return null;
  if (ref.kind === "entry") {
    const entry = videoById[ref.id] ?? allEntries.find((v) => v.id === ref.id) ?? null;
    return entry ? { kind: "entry", id: ref.id, entry, name: ref.name ?? entry.name } : null;
  }
  return { kind: ref.kind, id: ref.id, name: ref.name };
}

// A shareable deep-link URL for a page target (mirrors App.jsx's param scheme).
export function pageUrl(target) {
  const url = new URL(window.location.origin + window.location.pathname);
  if (target.kind === "country") url.searchParams.set("country", target.id);
  else if (target.kind === "adventure") url.searchParams.set("adventure", target.id);
  else if (target.kind === "entry") url.searchParams.set("ce", target.id);
  url.hash = "catalog";
  return url.href;
}

export const sectionLabelFor = (id) =>
  SECTION_LABEL[id] ?? (id === "adventures" ? "Adventures" : id === "geography" ? "Geography" : id);

export const videoById = Object.fromEntries(allVideos.map((v) => [v.id, v]));

export const CONTINENTS = [
  { id: "akrogal",      name: "Akrogal"         },
  { id: "ereb",         name: "Ereb"             },
  { id: "samkarna",     name: "Samkarna"         },
  { id: "soluna",       name: "Soluna"           },
  { id: "serpent-lake", name: "Serpent Lake"     },
  { id: "western-sea",  name: "The Western Sea"  },
];

export const placeKind = (pin) => {
  const t = pin.type || "place";
  return t === "country" ? "Country" : t[0].toUpperCase() + t.slice(1);
};

export const SECTION_LABEL = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label]));

// Sections that can back a browse hub, for validating a ?hub= URL param on load.
export const HUB_SECTIONS = new Set(["adventures", "geography", ...SECTIONS.map((s) => s.id)]);

// Read a valid { section, group } hub from the current URL, or null. An open
// entry (?ce=) takes the main panel, so a hub is ignored while one is set.
export function hubFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("ce")) return null;
  const section = params.get("hub");
  if (!section || !HUB_SECTIONS.has(section)) return null;
  return { section, group: params.get("hubg") || null };
}

// The full set of navigable Compendium pages (section entries + lands +
// adventures), as "kind-id" keys - the denominator for reading-progress.
export const PAGE_UNIVERSE = (() => {
  const ks = new Set();
  for (const v of allEntries) if (v.section !== "countries" && v.section !== "episodes") ks.add(`entry-${v.id}`);
  for (const p of geoPlaces) ks.add(`country-${p.id}`);
  for (const a of adventures) ks.add(`adventure-${a.id}`);
  return ks;
})();
export const TOTAL_PAGES = PAGE_UNIVERSE.size;

// Geography sub-places (parent set) that nest under their parent country in the
// nav: parent country id → [child geo entries].
export const geoChildrenByParent = (() => {
  const m = {};
  for (const g of videosBySection["geography"] || [])
    for (const v of g.videos) if (v.parent) (m[v.parent] ??= []).push(v);
  return m;
})();

// Section entries (Peoples/Creatures/…) that nest under a parent page of the
// same section (e.g. cave-orcs under orc): parent slug → [child entries]. The
// nav renders these indented beneath the parent and drops them from the flat list.
export const childrenByParentSlug = (() => {
  const m = {};
  for (const [sec, groups] of Object.entries(videosBySection)) {
    if (sec === "geography") continue; // geography handled separately above
    for (const g of groups) for (const v of g.videos) if (v.parent) {
      (m[v.parent] ??= []).push(v);
    }
  }
  for (const arr of Object.values(m)) arr.sort((a, b) => a.name.localeCompare(b.name));
  return m;
})();

// ── Path helpers ──────────────────────────────────────────────────────────
export function toSlug(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function skipGroup(group, section) {
  if (!group) return true;
  const g = group.toLowerCase(), s = section.toLowerCase();
  return g === s || g + "s" === s || g === s + "s";
}

// Seeded random image pick for browse cards. A page often has several images;
// instead of always borrowing the first, choose one by hashing the slug with a
// per-visit salt. Same salt + slug → same pick, so cards stay put across
// re-renders (no flicker); a fresh salt on the next visit re-rolls the art.
export function hashStr(str, salt) {
  let h = salt >>> 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
// Returns { src, portrait } for a random image on the page, or null. `key`
// (defaults to slug) diversifies the roll when a card represents a group.
export function pickEntryImage(slug, salt, key = slug) {
  const all = entryImagesAll[slug];
  if (!all || all.length === 0) return null;
  return all[hashStr(key, salt) % all.length];
}
export function entryMdPath(entry) {
  const sec  = entry.section[0].toUpperCase() + entry.section.slice(1);
  const slug = toSlug(entry.name);
  return skipGroup(entry.group, entry.section)
    ? `${sec}/${slug}.md`
    : `${sec}/${entry.group}/${slug}.md`;
}


// Curated "Related" links for entries not captured structurally — chiefly the
// three live conflicts, which tie to their belligerent lands and the adventures
// that dramatize them. Keyed by the entry's name-slug; values are slugs the
// resolver turns into country / adventure / entry pages.
export const RELATED_BY_SLUG = {
  "felicien-pirate-war": ["felicien", "erebos", "berendien", "caddo", "hynsolge"],
  "ransard-prepares": ["ransard", "trakorien"],
  "nidland-purification": ["nidland", "cereval", "the-hell-fort", "melindors-return", "the-final-battle", "haktahchas-arrival"],
  // The Burned Earth Clan and its member tribes link to one another.
  "burned-earth-clan": ["lunorgh-kah", "rulgh-borgnag", "urgh-grobb", "grogol-gribb", "gylk-lobbnack", "ylkor-kha-oggra", "grokashak-oggra", "kallakadak-yldrokk", "dekkadorel-gnubbt"],
  "lunorgh-kah": ["burned-earth-clan"],
  "rulgh-borgnag": ["burned-earth-clan"],
  "urgh-grobb": ["burned-earth-clan"],
  "grogol-gribb": ["burned-earth-clan"],
  "gylk-lobbnack": ["burned-earth-clan"],
  "ylkor-kha-oggra": ["burned-earth-clan"],
  "grokashak-oggra": ["burned-earth-clan"],
  "kallakadak-yldrokk": ["burned-earth-clan"],
  "dekkadorel-gnubbt": ["burned-earth-clan"],
  // The schools of magic and the magical phenomena from the Mage's Handbook.
  "animism": ["elemental", "mentalism"],
  "elemental": ["animism", "mentalism"],
  "mentalism": ["animism", "elemental", "necromancy"],
  "necromancy": ["mentalism", "dark-magic", "familiars", "tamanrasset", "kenvadsin-laogeraftjan", "revenant"],
  "dark-magic": ["necromancy"],
  // The necromancers drawn from the Necromancy archive feature: the goblin
  // book-thief and the mild interpreter who hides his claws.
  "tamanrasset": ["necromancy", "kenvadsin-laogeraftjan", "goblin"],
  "kenvadsin-laogeraftjan": ["necromancy", "erebos", "tamanrasset", "familiars"],
  // The Brotherhood of the Red Fish and its worked example, the thief whose
  // botched job opens The Stolen Elephant.
  "the-brotherhood-of-the-red-fish": ["naurudun", "hynsolge", "demonology"],
  "naurudun": ["the-brotherhood-of-the-red-fish", "hynsolge"],
  // The land of Jih-pun and the creatures and peoples of its bestiary.
  "tatsu": ["jih-pun", "orochi", "kumo", "mi", "mukade"],
  "kappa": ["jih-pun", "orochi"],
  "rokurokubi": ["jih-pun", "shutendoji"],
  "shutendoji": ["jih-pun", "rokurokubi", "uba"],
  "kumo": ["jih-pun", "tatsu", "mi", "shikome"],
  "uba": ["jih-pun", "shutendoji"],
  "orochi": ["jih-pun", "tatsu", "kappa"],
  "gaki": ["jih-pun", "shura"],
  "mi": ["jih-pun", "tatsu", "mukade", "kumo"],
  "mukade": ["jih-pun", "tatsu", "mi"],
  "nymph": ["jih-pun"],
  "shishi": ["jih-pun"],
  "shura": ["jih-pun", "gaki"],
  "tako": ["jih-pun", "giant-octopus"],
  "hengeyokai": ["jih-pun", "kojin"],
  "kojin": ["jih-pun", "shark-man", "hengeyokai"],
  "shikome": ["jih-pun", "orc", "kumo"],
  // The two human peoples of Jih-pun: the islanders and the natives they displaced.
  "jih-mono": ["jih-pun", "ainu"],
  "ainu": ["jih-pun", "jih-mono"],
  // The oni of Jih-pun and the oni-prince who schemes from the Fire-Peak.
  "oni": ["jih-pun", "ozuno", "shutendoji"],
  "ozuno": ["oni", "jih-pun"],
  // From Sinkadus 19: the deep-dwelling water elves and the dwarves' building art.
  "water-elf": ["sea-elf", "grey-elf", "shark-man"],
  "dwarven-architecture": ["dwarf", "craft-guilds"],
  // From Sinkadus 18: the dwarves' brewing, and the seven roads to immortality.
  "drinks-of-ereb": ["dwarf", "trade", "craft-guilds"],
  "the-exalted": ["the-dragon-masters", "the-gods", "the-world-of-altor"],
  // From Sinkadus 16: the persona and craft of magicians, and the seers' arts.
  "the-ways-of-magicians": ["the-aspects-of-magic", "familiars", "magical-symbols"],
  "divination": ["the-shaul-deck", "constellations", "the-ways-of-magicians"],
  // From Sinkadus 15: the elven nature, the cat-folk, and the goblins (vättar).
  "elves": ["wood-elf", "high-elf", "the-gods", "animism"],
  "catpeople": ["elves"],
  "goblin": ["dwarf", "cave-elf", "tamanrasset", "dwarven-architecture"],
  // From Sinkadus 13: the self-willed undead a necromancer makes of himself,
  // and the herb-lore of Jih-pun.
  "revenant": ["necromancy", "vampire", "death-knight", "zombie"],
  "herbs-of-jih-pun": ["jih-pun", "drinks-of-ereb"],
  // From Sinkadus 11: the mercenary captain shaped by the Sulphur Winter.
  "sebastian-marol": ["zorakin", "marjura", "sulphur-winter"],
  "the-black-water": ["ley-lines-and-magic-dead-lands", "the-bane-storm"],
  "the-bane-storm": ["necromancy", "dark-magic", "the-black-water"],
  "the-city-of-angels": ["death-angel", "the-world-of-altor"],
  "ley-lines-and-magic-dead-lands": ["dark-magic", "the-black-water"],
  // The Multiverse, Demonicum and its Guardians, and the art of demonology
  // (from the Kaos Väktare supplement).
  "the-multiverse": ["demonicum", "the-grey-halls", "inferno", "dimension-travel", "the-gods", "the-world-of-altor"],
  "the-grey-halls": ["the-multiverse", "demonicum", "dimension-travel", "demonology"],
  "demonicum": ["the-multiverse", "the-grey-halls", "inferno", "nehcrom", "bemoth", "caliban", "demonology"],
  "inferno": ["demonicum", "the-multiverse", "dimension-travel", "demonology"],
  "dimension-travel": ["inferno", "the-multiverse", "demonicum", "the-grey-halls", "demonology"],
  "nehcrom": ["demonicum", "bemoth", "caliban", "azoth", "demonic-artifacts"],
  "bemoth": ["demonicum", "nehcrom", "caliban", "animism", "karnack", "nerocq"],
  "caliban": ["demonicum", "nehcrom", "bemoth", "khurun", "darubah", "feot"],
  "demonology": ["demonicum", "the-grey-halls", "necromancy", "dark-magic", "demon-prince", "demonic-artifacts"],
  // Named demons of Demonicum and the demonic artifacts (Kaos Väktare).
  "azoth": ["nehcrom", "demonicum"],
  "karnack": ["bemoth", "demonicum", "nerocq"],
  "nerocq": ["bemoth", "demonicum", "karnack"],
  "darubah": ["caliban", "demonicum", "khurun"],
  "feot": ["caliban", "demonicum", "khurun"],
  "khurun": ["caliban", "demonicum", "darubah"],
  "fire-demon": ["demonicum", "ice-demon"],
  "ice-demon": ["demonicum", "fire-demon"],
  "knowledge-demon": ["demonicum"],
  // The four forerunners of the apocalyptic Riders (Sinkadus 32).
  "stilakor": ["evolakasa", "aryxamast", "kalembri"],
  "evolakasa": ["stilakor", "aryxamast", "kalembri"],
  "aryxamast": ["stilakor", "evolakasa", "kalembri"],
  "kalembri": ["stilakor", "evolakasa", "aryxamast"],
  "demonic-artifacts": ["demonology", "demonicum", "nehcrom", "bemoth", "soul-bound-weapons"],
  // The Warrior's Handbook: soul-bound weapons and the weapon-academies.
  "soul-bound-weapons": ["notable-magic-items", "demonic-artifacts", "demonology", "demon-prince"],
  "notable-magic-items": ["soul-bound-weapons", "demonic-artifacts"],
  "weapon-academies": ["cereval", "jorduashur", "ice-demon", "jih-pun"],
  // Thieves & Assassins: the underworld guilds and crime.
  "kharynos": ["felicien", "nidland", "the-underworld-guilds"],
  "the-blood-spattered-feather": ["the-underworld-guilds", "black-duck", "rhobdorana"],
  "the-underworld-guilds": ["kharynos", "the-blood-spattered-feather", "rhobdorana", "crime-and-punishment"],
  "crime-and-punishment": ["the-underworld-guilds"],
  "rhobdorana": ["the-underworld-guilds", "the-blood-spattered-feather"],
  // Hjältarnas Handbok: the nature of heroism (ties to the gods' game).
  "heroes": ["the-gods", "demonicum", "dark-magic"],
  // Krilloan campaign book: the ruling order, the demon-cults, their goddess.
  "ordo-magica": ["krilloan", "tannatopol", "demonology"],
  "the-oktagon": ["imaria", "the-heavenly-bodies", "montures", "krilloan", "demonology"],
  "imaria": ["the-oktagon", "montures", "krilloan"],
  // Eledain, the god of light and stars, and his one knightly order the
  // Brotherhood of the Eternally Shining Star (the Knights of Eledain), who
  // appear both in the Path of Honor and at the Skeleton Village.
  "eledain": ["the-brotherhood-of-the-eternally-shining-star", "the-gods"],
  "the-brotherhood-of-the-eternally-shining-star": ["eledain", "the-gods"],
  // The Magic rulebook: the further schools, the aspect framework, divination.
  "the-aspects-of-magic": ["animism", "elemental", "mentalism", "the-multiverse", "the-ways-of-magicians"],
  "dragon-magic": ["mentalism", "illusionism", "symbolism", "the-dragon-masters"],
  "illusionism": ["mentalism", "dragon-magic", "symbolism"],
  "symbolism": ["mentalism", "dragon-magic", "illusionism"],
  "staff-magic": ["the-aspects-of-magic", "notable-magic-items"],
  "harmonism": ["voice-magic", "the-aspects-of-magic"],
  "voice-magic": ["harmonism", "the-aspects-of-magic"],
  "spiritism": ["demonology", "necromancy", "the-aspects-of-magic"],
  "alchemy": ["notable-magic-items", "the-aspects-of-magic"],
  "ley-lines": ["magic-nodes", "magic-dead-lands", "ley-lines-and-magic-dead-lands"],
  "magic-nodes": ["ley-lines", "magic-dead-lands", "ley-lines-and-magic-dead-lands"],
  "magic-dead-lands": ["ley-lines", "magic-nodes", "ley-lines-and-magic-dead-lands"],
  "mage-storms": ["magic-nodes", "the-bane-storm", "ley-lines-and-magic-dead-lands"],
  "the-shaul-deck": ["ordo-magica", "the-heavenly-bodies"],
  "familiars": ["witchcraft", "spiritism", "animism", "the-ways-of-magicians"],
  // Worldbuilding lore cross-links.
  "coins-and-measures": ["trade"],
  "trade": ["coins-and-measures", "craft-guilds"],
  "craft-guilds": ["trade", "weapon-academies", "coins-and-measures"],
  // The dragon-masters: their title, their chronicle, and the karkion who began it.
  "the-dragon-masters": ["cereval", "karkion", "dragon-magic", "the-exalted"],
  // The Cauldron of Bitterness, and the dragon-haunted swordsman Arn.
  "khab-hemi": ["the-crown-jewels", "meh-zadrias-pillar", "the-black-water"],
  "arn-dunkelbrink": ["marjura", "trakorien", "the-oracles-four-eyes"],
  // Trolls and their goddess; Nohstril's catacombs and the society that dug them.
  "troll": ["slergolis", "cave-troll", "forest-troll", "ogre"],
  "slergolis": ["troll"],
  "ordo-nova": ["nohstril", "the-catacombs-of-nohstril", "erebos"],
  "the-catacombs-of-nohstril": ["nohstril", "ordo-nova", "erebos"],
  // The Jorpagnan empire, its fall, and the lands that founded it.
  "jorpagna-empire": ["the-fall-of-jorpagna", "grafferburg", "hynsolge", "jorpagna", "karkion"],
  "karkion": ["jorpagna-empire", "the-dragon-masters"],
  "the-fall-of-jorpagna": ["jorpagna-empire", "jorpagna"],
  "grafferburg": ["jorpagna-empire", "the-fall-of-jorpagna"],
  // Marjura, the sulphur isle, and the heretic city cast onto it from Yndar.
  "krau-ki": ["marjura", "trakorien"],
  // Eshwan Theard's hammer, and House Festglade of Nohstril and its demons.
  "the-hammer-of-eshwan-theard": ["soul-bound-weapons", "notable-magic-items"],
  "house-festglade": ["nohstril", "erebos", "the-catacombs-of-nohstril", "ordo-nova", "echram-schroedel"],
  "echram-schroedel": ["nohstril", "house-festglade"],
  "witchcraft": ["animism", "necromancy", "familiars", "the-aspects-of-magic"],
};
