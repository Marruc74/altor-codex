/**
 * generate-stubs.mjs
 * Creates skeleton .md files for every non-country, non-episode video entry
 * that doesn't already have a file.  Run with:  node scripts/generate-stubs.mjs
 *
 * Titles/sections are sourced directly from videoData.js (the single source of
 * truth), so newly-added videos are picked up automatically — no list to keep
 * in sync here.
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { videos, CONNECTED_ONLY_IDS } from "../src/data/videoData.js";

// ── Path helpers (mirror entryMdPath in Compendium.jsx) ────────────────────
function toSlug(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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

// ── Main ──────────────────────────────────────────────────────────────────
const __dirname  = dirname(fileURLToPath(import.meta.url));
const CODEX_BASE = join(__dirname, "../src/data/compendium");

const SKIP_SECTIONS = new Set(["countries", "episodes"]);

let created = 0;
let skipped = 0;

for (const { id, section, group, name } of videos) {
  if (SKIP_SECTIONS.has(section)) continue;
  if (CONNECTED_ONLY_IDS.has(id)) continue; // surfaced only as a related video

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
