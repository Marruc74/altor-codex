# Compendium Audit

Health audit of `src/data/compendium`. Regenerate the findings any time with:

```bash
node scripts/audit-compendium.mjs
```

It checks, deterministically, against the registration in `videoData.js` (and
`locations.js` pins for Geography): orphan files, broken registrations,
duplicate slugs, empty/stub pages, broken image refs, broken adventure `entry:`
links, broken `RELATED_BY_SLUG` refs, and invalid adventure YAML frontmatter.

**Keep this file in step with the compendium** - after adding, removing or
filling pages, re-run the script and update the lists below (clear fixed items,
record new ones).

> The adventure-YAML check matters: `adventures.js` parses frontmatter at
> *runtime*, so `npm run build` does NOT catch a broken block (e.g. an unquoted
> `summary:` containing a "colon space"). The audit does.

---

## Last run: 2026-06-18 — 585 files

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

## Known gap (not yet added)

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
