// Source attribution: which Drakar och Demoner book or Sinkadus issue a
// compendium page draws on, keyed by page slug. Two layers, merged below:
//
//   1. generatedSources (sources.generated.js) - derived from the reference/
//      archive by scripts/generate-sources.mjs (book titles, region & adventure
//      matches, and a group→bestiary table). Broad coverage.
//   2. CURATED (here) - hand mappings the generator can't derive: the Sinkadus
//      issues with no reference file, and a few faction/handbook pages whose
//      group is too mixed for the group table. Titles match the reference/
//      README spellings so they dedupe against the generated layer.
//
// The audit (npm run audit) fails if any slug here does not resolve to a page.
import { generatedSources } from "./sources.generated.js";

const from = (source, slugs) => slugs.map((s) => [s, source]);

const CURATED = [
  // Sinkadus magazine issues (no reference file → not auto-derivable).
  ...from("Sinkadus 7", ["hedemi", "gadirm"]),
  ...from("Sinkadus 8", ["minotaur"]),
  ...from("Sinkadus 10", ["spiritism", "voice-magic"]),
  ...from("Sinkadus 11", ["sebastian-marol", "giant-octopus"]),
  ...from("Sinkadus 14", ["forest-troll"]),
  ...from("Sinkadus 17", ["witchcraft"]),
  ...from("Sinkadus 13", ["revenant", "herbs-of-jih-pun"]),
  ...from("Sinkadus 15", ["elves", "catpeople", "goblin"]),
  ...from("Sinkadus 16", ["the-ways-of-magicians", "divination"]),
  ...from("Sinkadus 18", ["drinks-of-ereb", "the-exalted"]),
  ...from("Sinkadus 19", ["water-elf", "dwarven-architecture", "sea-dragon", "blood-elf"]),
  ...from("Sinkadus 20", ["the-brotherhood-of-the-red-fish"]),
  ...from("Sinkadus 21", ["necromancy"]),
  ...from("Sinkadus 22", ["montures"]),
  ...from("Monturerna", ["montures"]),
  ...from("Sinkadus 23", ["khab-hemi", "arn-dunkelbrink", "the-ruler-of-the-ancient-realm"]),
  ...from("Sinkadus 24", ["the-dragon-masters"]),
  ...from("Sinkadus 25", ["nohstril"]),
  ...from("Sinkadus 26", ["sese-hesuoni", "karkion"]),
  ...from("Sinkadus 32", ["stilakor", "evolakasa", "aryxamast", "kalembri"]),
  // Handbooks whose pages sit in mixed groups the group→book table can't key on.
  ...from("Tjuvar och lönnmördare", [
    "kharynos", "the-blood-spattered-feather", "the-underworld-guilds", "crime-and-punishment", "rhobdorana",
  ]),
  ...from("Krilloan: Kampanjboken", ["ordo-magica", "the-oktagon", "imaria"]),
  ...from("Hjältarnas handbok", ["heroes"]),
  ...from("Krigarens handbok", ["soul-bound-weapons", "weapon-academies", "notable-magic-items"]),
];

// Generated first, then curated layered on top; deduped per slug.
export const sourcesBySlug = (() => {
  const m = {};
  for (const [slug, arr] of Object.entries(generatedSources)) m[slug] = [...arr];
  for (const [slug, source] of CURATED) {
    (m[slug] ??= []);
    if (!m[slug].includes(source)) m[slug].push(source);
  }
  return m;
})();
