// Generates public/og-index.json — a lookup from a shareable deep-link param
// (ce / entry / country / adventure / pin → id) to {title, description, image}.
// The Netlify edge function (netlify/edge-functions/og.js) reads it to rewrite
// the page's Open Graph / Twitter / <title> tags so a pasted link previews as
// the actual page (crawlers don't run the SPA's JS).
//
// Re-run via the build (prebuild) or by hand:  node scripts/generate-og-index.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://thealtorcodex.netlify.app";
const HERO = `${SITE}/hero-bg.jpg`;
const TAGLINE = "A compendium of the known world of Altor — its regions, cities, histories, and secrets.";

const imp = (rel) => import(pathToFileURL(path.join(root, rel)).href);
const { allEntries, SECTIONS } = await imp("src/data/videoData.js");
const { pins } = await imp("src/data/locations.js");
const { entries: codexEntries } = await imp("src/data/codex/index.js");
const { entryImages } = await imp("src/data/entryImages.generated.js");

const SECTION_LABEL = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label]));

function toSlug(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['‘’ʼ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// A /compendium/... path → absolute, space-encoded URL.
const fullImg = (p) => (p ? `${SITE}${encodeURI(p)}` : null);
// A YouTube id (11 url-safe chars) → thumbnail URL.
const ytThumb = (id) => (/^[A-Za-z0-9_-]{11}$/.test(id) ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);
const trim = (s, n = 200) => {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

const index = {};
const put = (key, title, description, image) => {
  if (!(key in index)) index[key] = { title: `${title} — The Altor Codex`, description: trim(description), image: image || HERO };
};

// 1) Compendium section entries (opened via ?ce=)
const ENTRY_SECTIONS = new Set(["peoples", "creatures", "lore", "magic", "history", "conflicts", "characters", "geography"]);
for (const v of allEntries) {
  if (!ENTRY_SECTIONS.has(v.section)) continue;
  const sec = SECTION_LABEL[v.section] ?? "Lore";
  const where = v.group ? `${sec} · ${v.group}` : sec;
  const img = fullImg(entryImages[toSlug(v.name)]) || ytThumb(v.id) || HERO;
  put(`ce:${v.id}`, v.name, `${where} in the world of Ereb Altor. ${TAGLINE}`, img);
}

// 2) Codex entries (opened via ?entry=)
for (const e of codexEntries) {
  const img = e.image ? fullImg(e.image) : (fullImg(entryImages[toSlug(e.title ?? e.name ?? "")]) || HERO);
  put(`entry:${e.id}`, e.title ?? e.name ?? e.id, e.summary || TAGLINE, img);
}

// 3) Lands (?country=) and any map pin (?pin=). Read locations/<id>.js for a
//    description + chronicle video to enrich the country pages.
const locDir = path.join(root, "src/data/locations");
const locInfo = {};
if (fs.existsSync(locDir)) {
  for (const file of fs.readdirSync(locDir)) {
    if (!file.endsWith(".js")) continue;
    const src = fs.readFileSync(path.join(locDir, file), "utf8");
    locInfo[file.replace(/\.js$/, "")] = {
      description: src.match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1]?.replace(/\\"/g, '"') ?? null,
      youtubeId: src.match(/youtubeId:\s*"([^"]+)"/)?.[1] ?? null,
    };
  }
}
const kindWord = (t) => (t === "country" ? "kingdom" : t || "place");
for (const p of pins) {
  const info = locInfo[p.id] ?? {};
  const desc = p.tagline || info.description || `${p.name}, a ${kindWord(p.type)} of Ereb Altor. ${TAGLINE}`;
  const img = fullImg(entryImages[toSlug(p.name)]) || ytThumb(info.youtubeId) || HERO;
  put(`pin:${p.id}`, p.name, desc, img);
  put(`country:${p.id}`, p.name, desc, img);
}

// 4) Adventures (?adventure=) — id is the markdown filename.
const advDir = path.join(root, "src/data/compendium/Adventures");
if (fs.existsSync(advDir)) {
  for (const file of fs.readdirSync(advDir)) {
    if (!file.endsWith(".md")) continue;
    const id = file.replace(/\.md$/, "");
    const md = fs.readFileSync(path.join(advDir, file), "utf8");
    let meta = {};
    const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (fm) { try { meta = yaml.load(fm[1]) ?? {}; } catch { meta = {}; } }
    const title = meta.title || id;
    const desc = meta.tagline || meta.summary || `An adventure set in the world of Ereb Altor. ${TAGLINE}`;
    // First /compendium/... image path (these may contain spaces, so stop only
    // at a quote, paren or newline - not at whitespace).
    const imgPath = md.match(/\/compendium\/[^"')\n]+?\.(?:jpe?g|png)/i)?.[0] ?? null;
    put(`adventure:${id}`, title, desc, fullImg(imgPath) || HERO);
  }
}

const outDir = path.join(root, "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "og-index.json"), JSON.stringify(index));
console.log(`og-index.json — ${Object.keys(index).length} keys`);
