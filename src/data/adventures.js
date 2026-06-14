import yaml from "js-yaml";

// Each adventure is ONE markdown file under compendium/Adventures/ with a YAML
// frontmatter block for its structured fields and the prose as the body:
//
//   ---
//   title: The Misty Island
//   tagline: ""                                  # optional short subtitle/quote
//   summary: One-line blurb shown above the body.
//   videoIds: ["-6x3huqel8E", "b5zJNvqF5n8"]     # related chronicle videos
//   characters:                                  # optional cast (NPCs + creatures)
//     - name: Kaelene Fenholt
//       type: npc                                 # npc (default) | creature → groups into NPCs / Creatures
//       description: A wary ranger who knows the fog-bound coast.
//       image: /compendium/Adventures/The Misty Island/Characters/kaelene.jpg
//       videoId: eoVRxFnDAHU                      # optional — card opens this video
//   places:                                       # optional locations in the adventure
//     - name: Utkante
//       description: A windswept settlement on the island's edge.
//       image: /compendium/Adventures/The Misty Island/Places/utkante.jpg
//   items:                                         # optional items/maps/artifacts (alias: objects)
//     - name: Map
//       description: Map of the Misty Island.
//       image: /compendium/Adventures/The Misty Island/Map.jpg
//   sections:                                       # optional — group cast/places by locale or beat
//     - title: Outskirt                             # each section has its own sub-collections
//       npcs: [ ... ]                               #   npcs / creatures / places / items
//       creatures: [ ... ]                          #   (same card shape as the flat fields above)
//       places: [ ... ]
//       items: [ ... ]
//   ---
//
// `sections` and the flat `characters`/`places`/`items` fields coexist: if an
// adventure defines `sections`, they render as titled groups; otherwise the flat
// fields render as the single NPCs/Creatures/Places/Items view.
// Cards with only an image (places, items, portraits) open it in a lightbox.
//   Prose body in markdown here (may embed ![images](/compendium/...)).
//
// `id` is derived from the filename: the-misty-island.md → "the-misty-island"
// (also the ?adventure= deep-link value). Add an adventure by adding a file.

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parse(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return { data: {}, body: raw.trim() };
  return { data: yaml.load(m[1]) ?? {}, body: m[2].trim() };
}

const files = import.meta.glob("./compendium/Adventures/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const adventures = Object.entries(files)
  .map(([path, raw]) => {
    const id = path.split("/").pop().replace(/\.md$/, "");
    const { data, body } = parse(raw);
    return {
      id,
      title: data.title ?? id,
      tagline: data.tagline ?? "",
      summary: data.summary ?? "",
      // Optional campaign grouping: adventures sharing a `series` are shown
      // together in the nav, ordered by `seriesPart`.
      series: data.series ?? null,
      seriesPart: data.seriesPart ?? null,
      videoIds: data.videoIds ?? [],
      characters: data.characters ?? [],
      creatures: data.creatures ?? [],
      places: data.places ?? [],
      items: data.items ?? data.objects ?? [],
      sections: data.sections ?? [],
      body,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

// Adventures grouped for the nav: each series (ordered by seriesPart) followed
// by the standalone adventures. Series groups are listed alphabetically.
export const adventureGroups = (() => {
  const series = {};
  const standalone = [];
  for (const a of adventures) {
    if (a.series) (series[a.series] ??= []).push(a);
    else standalone.push(a);
  }
  const groups = Object.entries(series)
    .map(([name, advs]) => ({
      name,
      adventures: advs.slice().sort((a, b) => (a.seriesPart ?? 0) - (b.seriesPart ?? 0)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { groups, standalone };
})();
