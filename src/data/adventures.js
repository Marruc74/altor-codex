// Adventures / campaigns played in the Ereb Altor RPG. Each adventure is one
// page in the Compendium (left-nav "Adventures" section → AdventureDetail panel).
//
// Fields:
//   id         unique slug, also the ?adventure= deep-link value
//   title      display name
//   tagline    optional short subtitle / quote
//   summary    optional one-line blurb shown above the body
//   detail     markdown path under src/data/codex/ (lazy-loaded; may embed images)
//   videoIds   related chronicle/episode video ids (shown as Related Videos)
//   characters optional cast — [{ name, role, image, videoId }]
//                image: served from public/, e.g.
//                  "/codex/Adventures/The Misty Island/Characters/<name>.jpg"
//                  (missing image falls back to a ◈ placeholder)
//                videoId: optional — clicking the card opens that video
export const adventures = [
  {
    id: "the-misty-island",
    title: "The Misty Island",
    tagline: "",
    summary: "The party's voyage to the fog-bound isle — Chapter 2 of the Codex.",
    detail: "Adventures/the-misty-island.md",
    videoIds: ["-6x3huqel8E", "b5zJNvqF5n8"], // Chapter 2A & 2B
    characters: [],
  },
];
