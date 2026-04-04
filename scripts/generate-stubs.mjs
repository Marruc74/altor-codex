/**
 * generate-stubs.mjs
 * Creates skeleton .md files for every non-country, non-episode video entry
 * that doesn't already have a file.  Run with:  node scripts/generate-stubs.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ── Replicate the parse logic from videoData.js ───────────────────────────
const SECTION_MAP = {
  History:             "history",
  Geography:           "geography",
  Countries:           "countries",
  Magic:               "magic",
  Dragons:             "creatures",
  "Fable Animals":     "creatures",
  Elementals:          "creatures",
  Spirits:             "creatures",
  "Lesser Demon":      "creatures",
  Shapeshifters:       "creatures",
  Plants:              "creatures",
  "Corporeal Undead":  "creatures",
  "Magical Undead":    "creatures",
  "Wraiths & Wights":  "creatures",
  "Demonic Creatures": "creatures",
  Elves:               "peoples",
  "Animal Humanoids":  "peoples",
  "Animals Humanoids": "peoples",
  Stonekin:            "peoples",
  Sylvan:              "peoples",
  "Dark Folks":        "peoples",
  Conflicts:           "conflicts",
  Character:           "characters",
  Religion:            "lore",
  Lore:                "lore",
};

const CATEGORY_IS_GROUP = new Set(["creatures", "peoples", "characters", "magic", "lore"]);

function parse(title) {
  if (
    title.startsWith("The Altor Codex") ||
    title === "White Silence" ||
    title === "The Hollow Back"
  ) {
    const name = title.replace(/^The Altor Codex\s*-?\s*/, "").trim() || title;
    return { section: "episodes", group: null, name: name || title };
  }

  const colonIdx = title.indexOf(":");
  const dashIdx  = title.indexOf(" - ");

  let prefix, name;
  if (colonIdx !== -1) {
    prefix = title.substring(0, colonIdx).trim();
    name   = title.substring(colonIdx + 1).trim();
  } else if (dashIdx !== -1) {
    prefix = title.substring(0, dashIdx).trim();
    name   = title.substring(dashIdx + 3).trim();
  } else {
    return { section: "lore", group: null, name: title };
  }

  const parts        = prefix.split(" ");
  const baseCategory = parts[0];
  const subPrefix    = parts.length > 1 ? parts.slice(1).join(" ") : null;

  let matchedKey = null;
  let section    = null;
  for (const [key, val] of Object.entries(SECTION_MAP)) {
    if (prefix === key || prefix.startsWith(key + " ")) {
      matchedKey = key; section = val; break;
    }
    if (baseCategory === key) {
      matchedKey = key; section = val; break;
    }
  }

  const group = CATEGORY_IS_GROUP.has(section) ? matchedKey : subPrefix;
  return { section: section ?? "lore", group: group ?? null, name };
}

// ── Path helpers ──────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function skipGroup(group, section) {
  if (!group) return true;
  const g = group.toLowerCase();
  const s = section.toLowerCase();
  return g === s || g + "s" === s || g === s + "s";
}

function entryMdPath(section, group, name) {
  const sec  = section[0].toUpperCase() + section.slice(1);
  const slug = toSlug(name);
  return skipGroup(group, section)
    ? `${sec}/${slug}.md`
    : `${sec}/${group}/${slug}.md`;
}

// ── Raw video list (copied IDs + titles only) ─────────────────────────────
const rawTitles = [
  "Geography Samkarna: Mosgilak",
  "History The Age of Empires: Krau ki",
  "Magic: Witchcraft",
  "Countries: Trakorien",
  "Countries: Jorduashur",
  "Geography: Ereb Altor",
  "Countries: Felicien",
  "Geography Serpent Lake: The Way Out",
  "Countries: Erebos",
  "History: Jorpagna Empire",
  "Countries: Montures",
  "Geography The Eastern Seas: Yndar",
  "Geography Golwynda Sea: The Demon Tongue",
  "Countries Akrogal: Kalmurri",
  "History The Age of Armies: Efaro vs Sombatze",
  "Countries: Ransard",
  "Countries Soluna: Traxilme",
  "History The Age of Armies: Civil War",
  "Character - Kaelene Fenholt",
  "Geography The Eastern Seas: The Glass Sea",
  "Geography Samkarna: Geardon's Gap",
  "Geography Serpent Lake: Nivral Isles",
  "Character: Bram Kestrel",
  "History Yndar: The Rise",
  "Countries: Krun",
  "History The Age of Armies: End of War",
  "Geography Serpent Lake: Faryngia",
  "Dragons: Fire Dragon",
  "Elementals: Undin",
  "History The Age of Empires: Fall of Yndar",
  "History The Age of Empires: Sanithsid",
  "Countries: Magilre",
  "Countries Far West: Jih Pun",
  "Countries Soluna: Sombatze",
  "Countries: Torsheim",
  "Lesser Demon: Pazuzu",
  "History: Grey Elves",
  "Shapeshifters: Werewolf",
  "Geography: Golwynda Sea",
  "Geography Samkarna: Dragonback",
  "History Colonial Era: Krun Expanded",
  "Dragons: Gold Dragon",
  "Countries: Klomellien",
  "History The Age of Armies: Krun vs Hynsolge",
  "Geography Samkarna: Maminira me Delema",
  "Religion: The Shining Way",
  "Countries: Kardien",
  "Dragons: Sea Dragon",
  "Countries Soluna: Efaro",
  "Fable Animals: Aries",
  "Countries: Berendien",
  "Elves: Injir",
  "Dragons: Lindworm",
  "History Colonial Era: Furgia Invasion",
  "Lesser Demon: Belmon",
  "Character: Aelthira Moonveil",
  "History Dwarves: King Targald Hardfoot",
  "Geography Golwynda Sea: Raas Narram",
  "Countries: Barbia",
  "History The Age of Armies: Melukhas Fall",
  "Geography The Eastern Seas: Valgus Lake",
  "Plants: Spider Vine",
  "Elves: Dark Elf",
  "Countries: Nidland",
  "Countries: Caddo",
  "Dark Folks: Mountain Orcs",
  "Fable Animals: Acid Lizard",
  "Dragons: Sea Serpent",
  "Countries: Hynsolge",
  "Magic: Necromancy",
  "Plants: Primeval Tree",
  "Magic: Animism",
  "Countries: Zorakin",
  "History: Wood Elves",
  "Geography Serpent Lake: Maar Lacra",
  "Dragons: Dragonsnake",
  "Magic: Mentalism",
  "Countries: Jorpagna",
  "Countries Akrogal: Furgia",
  "Dragons: Ice Dragon",
  "Countries Samkarna: Melukha",
  "History The Age of Empires: Akrogal Nomads",
  "Countries Erebos: Targero",
  "History Dwarves: Bronze Discovery",
  "Elementals: Salamander",
  "History The Jorpagna Empire: Grafferburg",
  "Elementals: Umbran",
  "Countries Soluna: Thelgul",
  "History Golwynda Sea: Expansion",
  "History: The fall of Jorpagna",
  "Spirits: Ghost",
  "Lore: The Polar Regions",
  "Countries Erebos: Dakkilo",
  "Magic: Elemental",
  "Elementals: Luminal",
  "Dark Folks: Cave Orcs",
  "Dark Folks: Ylk Orcs",
  "Dragons: Light Dragon",
  "Countries Hynsolge: Fervidun",
  "Geography Golwynda Sea: Habete Grelge",
  "Countries Samkarna: Morëlvidyn",
  "Dark Folks: Steppe Orcs",
  "Elementals: Gnom",
  "Dragons: Chaos Dragon",
  "History: Melukha",
  "Countries: Cereval",
  "History Golwynda Sea: Palofar",
  "Lesser Demon: Uzorak",
  "Countries Erebos: Tolokfe",
  "Conflicts: Ransard Prepares",
  "Geography Samkarna: Jurona",
  "Conflicts: Felicien Pirate War",
  "Spirits: Will o' the wisp",
  "Elementals: Glacial",
  "Fable Animals: Cockatrice",
  "Countries Erebos: Beyural",
  "Elementals: Therm",
  "Fable Animals: Primeval Monster",
  "Countries Hynsolge: Orkovia",
  "Plants: Strangler Vine",
  "Fable Animals: Eye Beast",
  "Fable Animals: Chimera",
  "Animal Humanoids: Centaur",
  "White Silence",
  "Plants: Illusion Tree",
  "The Hollow Back",
  "Animal Humanoids: Ratman",
  "Lesser Demon: Grazur",
  "Fable Animals: Arboreal Leech",
  "Plants: Elf Eater",
  "Fable Animals: Gorgon",
  "Fable Animals: Angyon",
  "Countries Hynsolge: Greyburg",
  "Shapeshifters: Swan Maiden",
  "Animal Humanoids: Mermaid",
  "Fable Animals: Tunnel Worm",
  "Fable Animals: Pegasus",
  "Elementals: Sylf",
  "Fable Animals: Kerberos",
  "Conflicts: Nidland Purification",
  "The Altor Codex - Prologue",
  "Spirits: Spectre",
  "Fable Animals: Kelpie",
  "Animal Humanoids: Black Duck",
  "Fable Animals: Snake Sphere",
  "Elves: Cave Elf",
  "Fable Animals: Giant Amoeba",
  "Fable Animals: Roc",
  "Animal Humanoids: Wolfman",
  "Fable Animals: Siren",
  "Fable Animals: Sphinx",
  "Dark Folks: Boggle",
  "Fable Animals: Huldre",
  "Fable Animals: Rust Monster",
  "The Altor Codex - Chapter 2B - The Misty Island",
  "Fable Animals: Manticore",
  "The Altor Codex - Backstory",
  "Fable Animals: High Warden Tiger",
  "Elves: High Elf",
  "Elves: Silver Elf",
  "Fable Animals: Flying Lizard",
  "Elves: Grey Elf",
  "Fable Animals: Demon Cat",
  "Elves: Frost Elf",
  "Animal Humanoids: Karkion",
  "Animal Humanoids: Serpent",
  "Fable Animals: Sand Demon",
  "Animal Humanoids: Minotaur",
  "Dark Folks: Svartalf",
  "Fable Animals: Giant Spider",
  "Fable Animals: Onaqui",
  "Stonekin: Dwarf",
  "Sylvan: Najad",
  "Fable Animals: Kalydon",
  "The Altor Codex - Chapter 2A - The Misty Island",
  "The Altor Codex - Chapter 1 - The Secret of Skeleton Village",
  "Fable Animals: Murder Vulture",
  "Stonekin: Titan",
  "Animal Humanoids: Reptileman",
  "Fable Animals: Ambiorm",
  "Fable Animals: Gargoyle",
  "Elves: Light Elf",
  "Sylvan: Oread",
  "Elves: Sea Elf",
  "History The Age of Empires: Slimpaku",
  "Dark Folks: Goblin",
  "Stonekin: Giant",
  "Animal Humanoids: Catpeople",
  "Stonekin: Stone Biter",
  "Fable Animals: Death Owl",
  "Elves: Blood Elf",
  "Corporeal Undead: Death Knight",
  "Wraiths & Wights: Death Wraith",
  "Dark Folks: Cave Troll",
  "Fable Animals: Hippogriff",
  "Fable Animals: Unicorn",
  "Sylvan: Fire Pixie",
  "Dark Folks: Orc",
  "Wraiths & Wights: Dark Wraith",
  "Stonekin: Gargant",
  "Dark Folks: Forest Troll",
  "Magical Undead: Nightwolf",
  "Corporeal Undead: Severed Head",
  "Magical Undead: Skeleton",
  "Magical Undead: Mummy",
  "Stonekin: Troglodyte",
  "Corporeal Undead: Corpse Eaters",
  "Demonic Creatures: Cold Beast",
  "Fable Animals: Grey Mareskunk",
  "Fable Animals: Phoenix",
  "Fable Animals: Harpy",
  "Magical Undead: Zombie",
  "Fable Animals: Basilisk",
  "Fable Animals: Hydra",
  "Fable Animals: Griffin",
  "Wraiths & Wights: Phantom",
  "Dark Folks: Ogre",
  "Demonic Creatures: Black Unicorn",
  "Corporeal Undead: Hell Steed",
  "Demonic Creatures: Black Avenger",
  "Sylvan: Satyr",
  "Sylvan: Hag",
  "Demonic Creatures: Vampire Butterfly",
  "Magical Undead: Living Dead",
  "Sylvan: Dryad",
  "Sylvan: Faerie",
  "Dark Folks: Boggart",
  "Corporeal Undead: Deadmans Hand",
  "Magical Undead: Baneman",
  "Sylvan: Peerie",
  "Stonekin: Cyclop",
  "Wraiths & Wights: Barrow Wight",
  "Corporeal Undead: Mara",
  "Corporeal Undead: Vampire",
  "Sylvan: Hob",
];

// ── Main ──────────────────────────────────────────────────────────────────
const __dirname  = dirname(fileURLToPath(import.meta.url));
const CODEX_BASE = join(__dirname, "../src/data/codex");

const SKIP_SECTIONS = new Set(["countries", "episodes"]);

let created = 0;
let skipped = 0;

for (const title of rawTitles) {
  const { section, group, name } = parse(title);
  if (SKIP_SECTIONS.has(section)) continue;

  const relPath = entryMdPath(section, group, name);
  const absPath = join(CODEX_BASE, relPath);
  const absDir  = dirname(absPath);

  if (existsSync(absPath)) {
    skipped++;
    continue;
  }

  mkdirSync(absDir, { recursive: true });
  writeFileSync(absPath, `# ${name}\n`, "utf8");
  console.log("created:", relPath);
  created++;
}

console.log(`\nDone. Created ${created}, skipped ${skipped} existing.`);
