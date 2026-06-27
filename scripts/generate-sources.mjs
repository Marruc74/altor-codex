// Generates src/data/sources.generated.js — for each compendium page, the
// source book(s) it draws on, derived from the reference/ archive. Source names
// are the ORIGINAL SWEDISH book titles. Combined at runtime with the curated
// map in sources.js (the Sinkadus issues that have no reference file).
//
// Attribution signals, most to least precise:
//   1. Title match  — page title equals a reference book's title (an adventure
//                     → its own book; a region → its sourcebook). Matched on the
//                     English README gloss too, since the pages are in English.
//   2. Filename      — page slug is a token of a reference filename.
//   3. Heading match — page title appears as a heading inside a reference file.
//   4. Group → book  — curated table mapping creature/people/magic groups to
//                     their (Swedish) bestiary/handbook. Heuristic.
//
// Re-run via the build (prebuild) or by hand:  node scripts/generate-sources.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const refDir = path.join(root, "reference");
const compDir = path.join(root, "src/data/compendium");

const stripParen = (s) => s.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
const norm = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const toSlug = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’ʼ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Canonical Swedish book titles, keyed by reference filename stem (suffix
// variants like -alt/-detailed collapse onto the base stem first).
const SWEDISH_TITLE = {
  // Bestiary
  "monsterboken": "Monsterboken", "monsterboken-ii": "Monsterboken II",
  "monsterboxen-ii-de-humanoida-raserna": "Monsterboxen II: De humanoida raserna",
  "monsterboxen-iii-kaos": "Monsterboxen III: Kaos",
  "monsterboxen-iv-legendariska-varelser": "Monsterboxen IV: Legendariska varelser",
  "sinkadus-8": "Sinkadus 8",
  // Peoples
  "alver": "Alver", "svartfolk": "Svartfolk",
  // Handbooks
  "magikerns-handbok": "Magikerns handbok", "krigarens-handbok": "Krigarens handbok",
  "hjaltarnas-handbok": "Hjältarnas handbok", "tjuvar-och-lonnmordare": "Tjuvar och lönnmördare",
  "kaos-vaktare": "Kaos Väktare", "magi-regelbok": "Magi: Regelboken",
  "dod-samuraj-regler": "Samuraj: Jih-pun", "dimension-travel-sinkadus-31": "Sinkadus 31",
  "sinkadus-35": "Sinkadus 35",
  // Sourcebooks
  "aidne": "Aidne", "magilre": "Magilre", "trakorien": "Trakorien", "torshem": "Torshem",
  "monturerna": "Monturerna", "barbia-siratsias-vita-formelbok": "Barbia: Siratsias vita formelbok",
  "ereb-altor-kampanjbok": "Ereb Altor: Kampanjboken",
  "ereb-altor-kampanjbok-utokad": "Ereb Altor: Kampanjboken (utökad)",
  "ereb-altor-spelledarbok": "Ereb Altor: Spelledarboken",
  "krilloan-kampanjbok": "Krilloan: Kampanjboken", "imperium-jorpagnum": "Imperium Jorpagnum",
  // Adventures
  "den-femte-konfluxen": "Den femte konfluxen", "svavelvinter": "Svavelvinter",
  "doda-skogen": "Döda skogen", "helvetesfortet": "Helvetesfortet", "kristalltjuren": "Kristalltjuren",
  "marsklandet": "Marsklandet", "melindors-aterkomst": "Melindors återkomst", "novastenen": "Novastenen",
  "oraklets-fyra-ogon": "Oraklets fyra ögon", "rosten-fran-forntiden": "Rösten från forntiden",
  "slutstriden": "Slutstriden", "spindelkonungens-pyramid": "Spindelkonungens pyramid",
  "tvillingbergen": "Tvillingbergen", "maktens-portar": "Maktens portar", "morkrets-hjarta": "Mörkrets hjärta",
  "enhorningshornet": "Enhörningshornet", "kandra": "Kandra", "jeraz": "Jeraz", "djupets-fasor": "Djupets fasor",
  "dimon": "Dimön", "kopparhavets-kapare": "Kopparhavets kapare",
  "krilloan-aventyrsboken": "Krilloan: Äventyrsboken", "aventyrspaket-1": "Äventyrspaket 1",
  "arans-vag-4": "Arans väg", "auktionen": "Auktionen", "demonprinsen": "Demonprinsen",
  "ereb-altor-aventyrsboken": "Ereb Altor: Äventyrsboken",
};

// Distinctive proper nouns in a text (capitalized, ≥4 letters), for matching an
// adventure to the reference book that shares its cast and places across the
// Swedish/English language gap. Common filler caps are dropped.
const STOP = new Set(
  ("the and för från den det att med som han hon den ett sin var och drakar demoner sinkadus expert " +
   "this that with from when then once they their there here north south east west chapter part scene " +
   "adventure adventurers player players treasure curse map village town city").split(" ")
);
const properNouns = (text) => {
  const set = new Set();
  for (const m of text.matchAll(/\b([A-ZÅÄÖ][a-zA-ZåäöÅÄÖ]{3,})\b/g)) {
    const n = norm(m[1]);
    if (n.length >= 4 && !STOP.has(n)) set.add(n);
  }
  return set;
};

const VARIANT = /-(alt|characters|detailed|entities|summary|gm|full|komplett)$/;
const baseStem = (stem) => { let s = stem; while (VARIANT.test(s)) s = s.replace(VARIANT, ""); return s; };
const prettify = (stem) => stem.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const svTitle = (file) => {
  const stem = baseStem(file.replace(/\.md$/, ""));
  return SWEDISH_TITLE[stem] ?? prettify(stem);
};

// README tables → filename → English book gloss (used only for matching).
const fileToBook = {};
for (const line of fs.readFileSync(path.join(refDir, "README.md"), "utf8").split("\n")) {
  const m = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/);
  if (!m || m[1] === "File" || /^[-\s|]+$/.test(m[1])) continue;
  const files = [...m[1].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
  for (const f of files) fileToBook[f] = m[2].trim();
}

// Index reference files; collect a title-match table (English gloss + Swedish
// title both → the Swedish display) and per-file headings / filename tokens.
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith(".md") && e.name !== "README.md" ? [p] : [];
  });
const refs = [];
const matchToDisplay = new Map();
for (const fp of walk(refDir)) {
  const file = path.basename(fp);
  const text = fs.readFileSync(fp, "utf8");
  const display = svTitle(file);
  const category = path.relative(refDir, fp).replace(/\\/g, "/").split("/")[0];
  const headings = new Set(
    [...text.matchAll(/^#{1,4}\s+(.+?)\s*$/gm)].map((m) => norm(m[1].replace(/^[\d.\s]+/, "")))
  );
  const advOrSinkadus = category === "adventures" || /sinkadus/i.test(file);
  refs.push({
    display, category, advOrSinkadus, headings,
    tokens: new Set(file.replace(/\.md$/, "").split("-")),
    words: new Set(norm(text).split(" ")),
  });
  const en = fileToBook[file];
  for (const t of [display, en, en && stripParen(en)].filter(Boolean)) {
    const k = norm(t);
    if (k && !matchToDisplay.has(k)) matchToDisplay.set(k, display);
  }
}

// Group → book(s), Swedish titles (must match svTitle output so they dedupe).
const MB1 = "Monsterboken", MB2 = "Monsterboken II", MB3 = "Monsterboxen III: Kaos",
  MB4 = "Monsterboxen IV: Legendariska varelser", KAOS = "Kaos Väktare", ALVER = "Alver",
  SVART = "Svartfolk", HUMAN = "Monsterboxen II: De humanoida raserna",
  MAGE = "Magikerns handbok", KRIGARE = "Krigarens handbok";
const GROUP_BOOKS = {
  "Animals": [MB1, MB2], "Fable Animals": [MB1, MB2], "Dragons": [MB4],
  "Demons": [MB3, KAOS], "Lesser Demons": [MB3, KAOS], "Demons of Demonicum": [MB3, KAOS],
  "Demonic Creatures": [MB3, KAOS], "Chaos Warriors": [MB3],
  "Elementals": [MB1, MB2], "Elemental Creatures": [MB1, MB2], "Elemental Lords": [MB1, MB2],
  "Magical Creatures": [MB1, MB2], "Magical Undead": [MB1, MB2], "Corporeal Undead": [MB1, MB2],
  "Wraiths & Wights": [MB1, MB2], "Shapeshifters": [MB1, MB2], "Spirits": [MB1, MB2], "Plants": [MB1, MB2],
  "Elves": [ALVER], "Sylvans": [ALVER], "Dark Folks": [SVART, HUMAN],
  "Animal Humanoids": [HUMAN], "Other Humanoids": [HUMAN], "Stonekin": [HUMAN],
  "Schools": [MAGE], "Items": [KRIGARE], "The Multiverse": [KAOS],
};

// Adventures that come from one known book, listed authoritatively because the
// reference file uses the Swedish adventure title (e.g. "Skuggan av en ros"), so
// the English page title can't title-match and the proper-noun fallback would
// otherwise mis-score them against setting-sharing siblings. The whole Krilloan
// campaign (Shadow of a Rose, Enemies of the Beginning, Day of Wrath) is in the
// one Krilloan adventure book and nothing else.
const ADVENTURE_BOOK = {
  "shadow-of-a-rose": "Krilloan: Äventyrsboken",
  "enemies-of-the-beginning": "Krilloan: Äventyrsboken",
  "day-of-wrath": "Krilloan: Äventyrsboken",
};

// Registry → slug → group.
const { compendiumRegistry } = await import(pathToFileURL(path.join(root, "src/data/compendiumRegistry.generated.js")).href);
const groupBySlug = {};
for (const e of compendiumRegistry) groupBySlug[e.slug ?? toSlug(e.name)] = e.group;

// Walk compendium pages → attribute.
const out = {};
const add = (slug, title) => { (out[slug] ??= new Set()).add(title); };

for (const fp of walk(compDir)) {
  const slug = path.basename(fp).replace(/\.md$/, "");
  const text = fs.readFileSync(fp, "utf8");
  const isAdventure = fp.replace(/\\/g, "/").includes("/Adventures/");

  // Authoritative single-book adventures: set the one source and skip all other
  // matching (including the proper-noun fallback), so no stray book is added.
  if (ADVENTURE_BOOK[slug]) { add(slug, ADVENTURE_BOOK[slug]); continue; }

  let title = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  let advMeta = null;
  if (isAdventure) {
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fm) { try { advMeta = yaml.load(fm[1]) ?? {}; } catch { advMeta = {}; } }
    title = advMeta?.title ?? title;
  }
  title = title ?? slug;
  const nTitle = norm(title);

  if (matchToDisplay.has(nTitle)) add(slug, matchToDisplay.get(nTitle));
  for (const b of GROUP_BOOKS[groupBySlug[slug]] ?? []) add(slug, b);
  for (const r of refs) {
    if (r.category === "adventures") continue; // set-in ≠ sourced-from
    if (r.tokens.has(slug)) add(slug, r.display);
    else if (nTitle.length > 3 && r.headings.has(nTitle)) add(slug, r.display);
  }

  // Adventures with no precise title match yet (not in the README table): fall
  // back to matching the distinctive proper nouns in the title/tagline/summary
  // (not the whole body - campaign siblings share setting names) against the
  // adventure & Sinkadus files, keeping only the top-scoring book(s). Catches
  // the issue an adventure ran in even when its title differs by language.
  if (isAdventure && !out[slug]) {
    const idText = [advMeta?.title, advMeta?.tagline, advMeta?.summary].filter(Boolean).join(" ");
    const nouns = properNouns(idText);
    let max = 0;
    const scored = [];
    for (const r of refs) {
      if (!r.advOrSinkadus) continue;
      let score = 0;
      for (const n of nouns) if (r.words.has(n)) score++;
      if (score > 0) { scored.push([score, r.display]); if (score > max) max = score; }
    }
    if (max >= 2) for (const [s, d] of scored) if (s === max) add(slug, d);
  }
}

const sorted = Object.fromEntries(
  Object.entries(out).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, [...v].sort().slice(0, 4)])
);
const body =
  "// AUTO-GENERATED by scripts/generate-sources.mjs — do not edit by hand.\n" +
  "// Compendium page slug → source book(s) (original Swedish titles), derived\n" +
  "// from the reference/ archive. Merged with the curated map in sources.js.\n" +
  `export const generatedSources = ${JSON.stringify(sorted, null, 2)};\n`;
fs.writeFileSync(path.join(root, "src/data/sources.generated.js"), body);
console.log(`sources.generated.js — ${Object.keys(sorted).length} pages attributed`);
