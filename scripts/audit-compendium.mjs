// Compendium health audit. Run:  node scripts/audit-compendium.mjs  (or npm run audit)
// Runs automatically before `npm run build` (prebuild hook) and in CI; exits
// non-zero on any HARD issue so a broken compendium can't ship.
//
// Sources of truth: src/data/compendium (the files), src/data/videoData.js (real
// chronicle videos + EXTRA_GEO), and src/data/compendiumRegistry.generated.js
// (the markdown-only pages, produced by generate-compendium-registry.mjs).
//
// HARD (fail): ORPHAN files (a page missing from the registry - regenerate it),
// BROKEN regs (a registry row whose .md is gone), BROKEN images, broken
// adventure `entry:` links, broken RELATED_BY_SLUG refs, invalid adventure YAML.
// WARN only: DUPLICATE slugs and EMPTY pages (the repo has a few intentional).
//
// Geography is pin-driven (src/data/locations.js), so its files are matched
// against pin ids/names as well as videoData.

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import path from "path";
import yaml from "js-yaml";
import { compendiumRegistry } from "../src/data/compendiumRegistry.generated.js";
import { themes } from "../src/data/compendiumTags.js";
import { crossRefs } from "../src/data/crossRefs.generated.js";

const ROOT = "src/data/compendium";
const vd = readFileSync("src/data/videoData.js", "utf8");
const loc = existsSync("src/data/locations.js") ? readFileSync("src/data/locations.js", "utf8") : "";
const comp = existsSync("src/components/Compendium.jsx") ? readFileSync("src/components/Compendium.jsx", "utf8") : "";

const toSlug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/['‘’ʼ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// SECTION_MAP from videoData
const SECTION_MAP = {};
{
  const block = vd.slice(vd.indexOf("Geography:"), vd.indexOf("};", vd.indexOf("Geography:")));
  const re = /(?:"([^"]+)"|([A-Za-z][\w &]*?))\s*:\s*"(\w+)"/g; let x;
  while ((x = re.exec(block))) SECTION_MAP[(x[1] || x[2]).trim()] = x[3];
}
function titleSection(title) {
  const colon = title.indexOf(":"), dash = title.indexOf(" - ");
  let prefix, name;
  if (colon !== -1) { prefix = title.slice(0, colon).trim(); name = title.slice(colon + 1).trim(); }
  else if (dash !== -1) { prefix = title.slice(0, dash).trim(); name = title.slice(dash + 3).trim(); }
  else return { section: "lore", name: title };
  const base = prefix.split(" ")[0]; let section = null;
  for (const [k, v] of Object.entries(SECTION_MAP)) if (prefix === k || prefix.startsWith(k + " ") || base === k) { section = v; break; }
  return { section: section ?? "lore", name };
}

const reg = {};
const add = (s, n) => { (reg[s] ??= new Set()).add(toSlug(n)); };
for (const m of vd.matchAll(/title:\s*"([^"]+)"/g)) { const p = titleSection(m[1]); add(p.section, p.name); }

// Markdown-only pages now come from the generated registry (5 content sections).
// An orphan = a file missing from the registry (someone added a page and didn't
// re-run generate-compendium-registry.mjs); a broken reg = a registry row whose
// file is gone (a page deleted/renamed without regenerating). So these two
// checks double as the "registry is in sync with the filesystem" guard.
const extraEntries = [];
for (const e of compendiumRegistry) { add(e.section, e.name); extraEntries.push({ section: e.section, group: e.group, name: e.name, slug: e.slug }); }
// EXTRA_GEO is the one hand-kept geography list still in videoData.js.
{
  const start = vd.indexOf("const EXTRA_GEO = [");
  if (start !== -1) {
    const block = vd.slice(start, vd.indexOf("].map(", start));
    for (const m of block.matchAll(/\{\s*group:\s*(null|"([^"]*)")\s*,\s*name:\s*"([^"]+)"\s*\}/g)) {
      const group = m[1] === "null" ? null : m[2];
      add("geography", m[3]); extraEntries.push({ section: "geography", group, name: m[3] });
    }
  }
}

const geoSlugs = new Set();
for (const m of loc.matchAll(/\bid:\s*"([^"]+)"/g)) geoSlugs.add(m[1]);
for (const m of loc.matchAll(/\bname:\s*"([^"]+)"/g)) geoSlugs.add(toSlug(m[1]));

const FOLDER = { Creatures: "creatures", Peoples: "peoples", Lore: "lore", Magic: "magic", Characters: "characters", History: "history", Conflicts: "conflicts", Geography: "geography" };
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const f = path.join(d, n); if (statSync(f).isDirectory()) walk(f); else if (n.endsWith(".md")) files.push(f.replace(/\\/g, "/")); } })(ROOT);

const bySlug = {}, orphans = [], empties = [], badImg = [];
for (const f of files) {
  const rel = f.slice(ROOT.length + 1), top = rel.split("/")[0], slug = path.basename(f, ".md");
  (bySlug[slug] ??= []).push(rel);
  const raw = readFileSync(f, "utf8");
  const body = raw.replace(/^---[\s\S]*?\n---\n/, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/^#.*$/gm, "").replace(/\s+/g, " ").trim();
  if (body.length < 60 && !slug.startsWith("_")) empties.push(`${rel} (${body.length} chars)`);

  const refs = new Set();
  for (const m of raw.matchAll(/!\[[^\]]*\]\(([^)]+?)(?:\s+"[^"]*")?\)/g)) refs.add(m[1].trim());
  for (const m of raw.matchAll(/^\s*image:\s*["']?(\/[^"'\n]+?)["']?\s*$/gm)) refs.add(m[1].trim());
  for (const r of refs) { if (!r.startsWith("/")) continue; if (!existsSync("public" + decodeURIComponent(r))) badImg.push(`${rel} -> ${r}`); }

  if (top === "Adventures" || slug.startsWith("_")) continue;
  const section = FOLDER[top]; if (!section) continue;
  if (section === "geography") { if (!geoSlugs.has(slug) && !reg.geography?.has(slug) && !reg.countries?.has(slug)) orphans.push(`[geography] ${rel}`); continue; }
  if (!reg[section]?.has(slug)) orphans.push(`[${section}] ${rel}`);
}

const skipGroup = (g, s) => { if (!g) return true; g = g.toLowerCase(); s = s.toLowerCase(); return g === s || g + "s" === s || g === s + "s"; };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const brokenReg = [];
for (const e of extraEntries) {
  const sl = e.slug ?? toSlug(e.name);
  const p = skipGroup(e.group, e.section) ? `${cap(e.section)}/${sl}.md` : `${cap(e.section)}/${e.group}/${sl}.md`;
  if (!existsSync(path.join(ROOT, p))) brokenReg.push(`${e.section}/${e.group ?? "-"}/${e.name} -> expected ${p}`);
}

const slugs = new Set(files.map((f) => path.basename(f, ".md")));
// every real page slug: md basenames (entries + geography + adventures) plus map pins
const allValid = new Set([...slugs, ...geoSlugs]);

// compendiumTags: every theme member must be a real page
const badTag = [];
for (const t of themes) for (const s of t.slugs) if (!allValid.has(s)) badTag.push(`${t.id} -> ${s}`);

// crossRefs.generated: every referenced slug must be a real page (catches a stale
// index pointing at a deleted/renamed page; "forgot to regenerate" after adding a
// mention is caught by the CI git-diff check, like the registry).
const badXref = [];
for (const map of [crossRefs.mentions, crossRefs.backlinks])
  for (const [k, arr] of Object.entries(map)) {
    if (!allValid.has(k)) badXref.push(`key ${k}`);
    for (const s of arr) if (!allValid.has(s)) badXref.push(`${k} -> ${s}`);
  }

const badEntry = [];
for (const f of files.filter((f) => f.includes("/Adventures/"))) for (const m of readFileSync(f, "utf8").matchAll(/^\s*entry:\s*([A-Za-z0-9-]+)\s*$/gm)) if (!slugs.has(m[1])) badEntry.push(`${path.basename(f)} -> ${m[1]}`);
const badRel = [];
const rb = comp.match(/RELATED_BY_SLUG\s*=\s*\{([\s\S]*?)\n\};/);
if (rb) { const re = /"([a-z0-9-]+)":\s*\[([^\]]*)\]/g; let x; while ((x = re.exec(rb[1])) !== null) { if (!slugs.has(x[1])) badRel.push(`key missing: ${x[1]}`); for (const v of x[2].matchAll(/"([a-z0-9-]+)"/g)) if (!slugs.has(v[1])) badRel.push(`${x[1]} -> ${v[1]}`); } }

// adventure frontmatter must be valid YAML (parsed at runtime by adventures.js,
// so `npm run build` does NOT catch a broken block - e.g. an unquoted summary
// with a "colon space" inside it).
const badYaml = [];
const FM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
for (const f of files.filter((f) => f.includes("/Adventures/"))) {
  const m = readFileSync(f, "utf8").match(FM); if (!m) continue;
  try { yaml.load(m[1]); } catch (e) { badYaml.push(`${path.basename(f)}: ${e.reason} (line ${e.mark?.line})`); }
}

const dups = Object.entries(bySlug).filter(([, v]) => v.length > 1);
const out = (t, a) => { console.log(`\n### ${t} (${a.length})`); a.forEach((x) => console.log("  - " + x)); };
console.log(`Compendium audit — ${files.length} files`);
out("Orphan files (not reachable in nav)", orphans);
out("Broken registrations (noVideo entry, no md)", brokenReg);
out("Duplicate slugs", dups.map(([s, v]) => `${s}: ${v.join("  |  ")}`));
out("Empty / stub pages", empties);
out("Broken image refs", badImg);
out("Broken adventure entry: links", badEntry);
out("Broken RELATED_BY_SLUG refs", badRel);
out("Invalid adventure YAML frontmatter", badYaml);
out("Theme slugs with no page (compendiumTags.js)", badTag);
out("Cross-ref slugs with no page (crossRefs stale)", badXref);

// Hard failures fail the build/CI; duplicate slugs and empty pages are warnings
// (the repo has a couple of intentional ones). Run the registry/crossrefs
// generators if orphans, broken regs or stale cross-refs appear.
const hard = orphans.length + brokenReg.length + badImg.length + badEntry.length + badRel.length + badYaml.length + badTag.length + badXref.length;
console.log(`\n${hard === 0 ? "OK" : "FAIL"} — ${hard} hard issue(s); ${dups.length} duplicate slug(s), ${empties.length} empty page(s) (warnings).`);
if (hard > 0) process.exit(1);
