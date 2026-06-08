import yaml from "js-yaml";

// Each adventure is ONE markdown file under compendium/Adventures/ with a YAML
// frontmatter block for its structured fields and the prose as the body:
//
//   ---
//   title: The Misty Island
//   tagline: ""                                  # optional short subtitle/quote
//   summary: One-line blurb shown above the body.
//   videoIds: ["-6x3huqel8E", "b5zJNvqF5n8"]     # related chronicle videos
//   characters:                                  # optional cast
//     - name: Kaelene Fenholt
//       description: A wary ranger who knows the fog-bound coast.
//       image: /compendium/Adventures/The Misty Island/Characters/kaelene.jpg
//       videoId: eoVRxFnDAHU                      # optional — card opens this video
//   ---
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
      videoIds: data.videoIds ?? [],
      characters: data.characters ?? [],
      body,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
