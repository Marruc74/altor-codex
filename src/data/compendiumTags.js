// Curated cross-cutting themes for faceted browsing of the compendium. Unlike
// the section/group folder tree, a theme can span sections (a creature, a land,
// a people and an adventure can share one). Group-based members are derived from
// the generated registry (always valid); hand-added members are listed by slug
// and validated by the audit (npm run audit fails on an unknown slug).
import { compendiumRegistry } from "./compendiumRegistry.generated.js";

const inGroups = (...groups) =>
  compendiumRegistry.filter((e) => groups.includes(e.group)).map((e) => e.slug);

const theme = (id, label, slugs) => ({ id, label, slugs: [...new Set(slugs)].sort() });

export const themes = [
  theme("draconic", "Dragons & Draconic", [
    ...inGroups("Dragons"), "dragon", "the-dragon-masters", "dragon-magic", "tatsu", "dragon-warrior",
  ]),
  theme("undead", "Undead", [
    ...inGroups("Corporeal Undead", "Magical Undead", "Wraiths & Wights"),
    "necromancy", "spiritism", "the-bane-storm",
  ]),
  theme("demonic", "Demons & Demonic", [
    ...inGroups("Demons", "Lesser Demons", "Demons of Demonicum", "Demonic Creatures"),
    "demonology", "demonicum", "inferno",
  ]),
  theme("fey", "Fey & Elf-folk", [
    ...inGroups("Sylvans", "Elves"), "elves", "gnome",
  ]),
  theme("jih-pun", "Jih-pun (the Far East)", [
    ...inGroups("Jih-Pun"), "jih-pun", "jih-mono", "ainu", "shikome", "hengeyokai", "kojin",
    "the-ghost-general", "the-dragon-flute", "the-shoguns-wrath",
  ]),
  theme("elemental", "Elemental", [
    ...inGroups("Elementals", "Elemental Creatures", "Elemental Lords"), "elemental",
  ]),
  theme("aquatic", "Aquatic & the Seas", [
    "sea-dragon", "sea-serpent", "dragonsnake", "mermaid", "naiad", "sea-elf", "water-elf",
    "kappa", "giant-octopus", "dolphin", "killer-whale", "shark", "stingray", "barracuda",
  ]),
  theme("magic", "Magic & Magicians", [
    ...inGroups("Schools"), "the-aspects-of-magic", "the-ways-of-magicians", "magical-symbols",
    "familiars", "dragon-magic", "metals",
  ]),
  theme("dark-folk", "Orcs & Black-folk", [...inGroups("Dark Folks")]),
  theme("trolls", "Trolls & Giants", [
    "troll", "cave-troll", "forest-troll", "olog-hai", "ogre", "titan",
  ]),
  theme("shapeshifters", "Shapeshifters", [
    ...inGroups("Shapeshifters"),
  ]),
  theme("beasts", "Beasts & Fable Animals", [
    ...inGroups("Animals", "Fable Animals"),
  ]),
  theme("religion", "Gods & Faith", [
    ...inGroups("Religions"),
  ]),
];

// slug -> [themeId…]  and  themeId -> Set(slug)
export const slugsByTheme = Object.fromEntries(themes.map((t) => [t.id, new Set(t.slugs)]));
export const themesBySlug = (() => {
  const m = {};
  for (const t of themes) for (const s of t.slugs) (m[s] ??= []).push(t.id);
  return m;
})();
export const themeLabel = Object.fromEntries(themes.map((t) => [t.id, t.label]));
