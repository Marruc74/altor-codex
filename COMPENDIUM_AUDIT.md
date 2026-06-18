# Compendium Audit

Health audit of `src/data/compendium`. Run it any time with:

```bash
npm run audit        # node scripts/audit-compendium.mjs
```

It also runs automatically before every `npm run build` (the `prebuild` hook)
and in CI (`.github/workflows/ci.yml`), and **exits non-zero on any hard issue**,
so a broken compendium can't ship.

It checks, deterministically, against the files, `videoData.js` (real videos +
`EXTRA_GEO`), `locations.js` pins, `compendiumRegistry.generated.js` (the
markdown-only pages), `compendiumTags.js` (themes) and `crossRefs.generated.js`
(the page cross-reference index): orphan/stale-registry, broken registrations,
duplicate slugs, empty/stub pages, broken image refs, broken adventure `entry:`
links, broken `RELATED_BY_SLUG` refs, invalid adventure YAML frontmatter, theme
slugs with no page, and stale cross-refs.

**Adding a page:** drop the `.md` file, then `npm run registry`. **After editing
page prose:** `npm run crossrefs` (rebuilds the "Referenced by"/"Related"/place→entry
index). The audit fails if either generated file is stale. **Keep this file in
step** - after adding, removing or filling pages, update the lists below.

> The adventure-YAML check matters: `adventures.js` parses frontmatter at
> *runtime*, so `npm run build` does NOT catch a broken block (e.g. an unquoted
> `summary:` containing a "colon space"). The audit does.

---

## Last run: 2026-06-19 — 615 files

Structurally clean. All connection checks pass:

| Check | Result |
|---|---|
| Orphan files | 0 |
| Broken registrations | 0 |
| Broken image refs | 0 |
| Broken adventure `entry:` links | 0 |
| Broken `RELATED_BY_SLUG` refs | 0 |
| Invalid adventure YAML | 0 |
| Duplicate slugs | 1 (intentional) |
| Empty / stub pages | 3 (no source available) |

### Remaining duplicate (intentional)
- `Geography/Samkarna/melukha.md` + `History/melukha.md` — a Geography place
  page and a History article for the same subject, by design. Not a problem.

### Remaining empty pages (no source to fill them)
- `Characters/aelthira-moonveil.md`, `Characters/bram-kestrel.md`,
  `Characters/kaelene-fenholt.md` — video-backed chronicle characters with no
  source-book text; the YouTube videos are their content.

---

## Resolved (history)

- Filled from references: the four classical elementals (salamander, sylf, undin,
  gnom), angyon, mermaid, ratman, church-of-sbintor, and the Ereb Altor continent
  overview.
- Removed two empty duplicate stubs: `Geography/golwynda-sea.md` and
  `Geography/ereb-altor.md` (the real pages live in their subfolders).
- Fixed invalid YAML in `the-dragon-flute.md` (unquoted `summary:` with a colon).
- Added from Monster Book II: the **Animals** group (musk ox, wolverine, king
  cheetah, insect swarm, beaver, barracuda, narwhal, piranha, stingray, aurochs,
  Portuguese man o' war, wild boar, spitting cobra, moose, eagle, llama, reindeer,
  pig, yak, walrus, dwarf elephant, giant shark, giant rhinoceros, predatory
  crane, cave lion), plus Alfin, Hippocampus, Giant Turtle, Peryton, Wererat,
  Hjortid, Eagle-Man, Selkie, Ghost Horse, Lantern-Man.
- Added from Monster Book I: more **Animals** (the bears - brown, grizzly, cave,
  black; the great cats - lion, tiger, leopard, jaguar, cheetah, saber-toothed
  tiger; bison, elephant, mammoth, hippopotamus, hyena, fox, wolf, dire wolf,
  wild dog, venomous snake, python, alligator, crocodile, shark, dolphin, killer
  whale, bat swarm, rat swarm, scorpion, spider).

## Known gaps (not yet added)

- **Monster Book I domestic livestock** (Nyttodjur: donkey, mule, pony, camel,
  the horses, ox, cow, bull, water buffalo, sheep, goat) - deliberately skipped
  as gear/livestock rather than lore creatures. Add a "Livestock" set if wanted.

- **Monster Book II dinosaurs** (pp. 30–45: allosaurus, ankylosaurus, apatosaurus,
  brachiosaurus, deinonychus, pachycephalosaurus, spinosaurus, stegosaurus,
  stenonychosaurus, triceratops, tyrannosaurus, elasmosaurus, ichtyosaurus,
  mosasaurus, pteranodon, quetzalcoatlus, dinosauroid) have no entries. They would
  form a "Dinosaurs" Creatures group if wanted.

## Reference bestiaries available

Monster Book I (`monsterboken.md`), Monster Book II (`monsterboken-ii.md`), the
Humanoid Races box (`monsterboxen-ii-de-humanoida-raserna.md`), Monster Box III
Chaos (`monsterboxen-iii-kaos.md`), Monster Box IV Legendary Creatures
(`monsterboxen-iv-legendariska-varelser.md`). Note: `monsterboken-ii.md` is an
index with one-line glosses, not full creature text.
