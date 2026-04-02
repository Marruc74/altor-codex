# Country File Style Guide

Internal reference for maintaining consistency across country markdown files.
Not rendered anywhere in the app.

---

## Standard Section Order

Use only the sections that apply. If a country lacks the data for a section, omit it entirely.

1. `## Overview`
2. `## Geography`
3. `## Climate`
4. `## People`
5. `## Culture`
6. `## Language`
7. `## Society`
8. `## Government`
9. `## Economy`
10. `## Military`
11. `## Religion`
12. `## History`
13. `## Foreign Relations`
14. Country-specific unique sections (e.g. `## The Trolls`, `## The Four Jarldoms`)

---

## Overview Stat Block

Use `- **Key:** value` bullet format. Always bold the key. Order: Population, Capital, Area (if notable), Government, Religion, Exports, Imports, Military (if brief enough).

Demographics go in parentheses on the Population line.

```markdown
## Overview

One or two prose sentences describing the country in broad strokes.

- **Population:** approx. 160,000 (80% humans, 20% other)
- **Capital:** Cityname (~7,000 inhabitants)
- **Government:** Feudal monarchy
- **Religion:** The Shining Path
- **Exports:** timber, iron, copper, furs
- **Imports:** cloth, salt, precious metals
- **Military:** small army, strong knightly cavalry
```

**Reference files:** felicien.md, kardien.md, jorduashur.md

---

## Named Groups, Eras, Conflicts

For items with 1–2 descriptors: use `- **Name** — desc, desc` on a single line.

```markdown
## People

- **Northern Barbarians** — nomadic warriors, livestock herding, strong tribal culture
- **People of Babor** — more organized society, developed cities, trade focused
```

```markdown
## History

- **Prehistoric Era** — early inhabitants lived as hunters and nomads, later pastoral tribes
- **Bronze Age** — migration from other regions, tribes spread across the land
- **Dark Age** — fragmentation, invasions, decline of royal authority
```

For items with 3+ sub-points: use a `### Name` subsection instead.

```markdown
### The Echther

The ruling nobility.

- Proud and high-born
- Strong honor culture
- Arrogant toward outsiders
- Skilled warriors and riders
```

---

## Key–Value Pairs Inside Sections

When listing named attributes (military forces, city types, coin types, etc.), bold the key.

```markdown
Typical peacetime forces:

- **King:** ~500 soldiers
- **Dukes:** ~100
- **Counts:** ~50
- **Barons:** ~25
```

```markdown
- **Noble Cities** — governed by bailiffs, pay taxes to the nobility
- **Free Cities** — have bought their independence, governed by city councils
```

---

## Simple Enumerations

Plain bullets, no bold, no trailing descriptions.

```markdown
Common crops include:

- Wheat
- Barley
- Oats
- Rye
```

---

## Bold in Prose

Only use bold for **proper nouns and named terms** being introduced for the first time — god names, ship types, special materials, named institutions.

```markdown
The primary religion is the worship of **Fraschikel**.

The people speak **Jordiska**, a language related to Ransardian.

Erebos is governed by the **Council of Five Houses**.
```

Do **not** use bold for general emphasis (`**Women often hold leading roles**`) or as inline section headers (`**Characteristics:**`).

---

## Inline Bold Headers — Forbidden

Never use bold as a substitute for a heading.

```markdown
# Wrong
**Characteristics:**
- Proud and high-born

# Correct
### The Echther
- Proud and high-born
```

---

## Line-Break Lists — Forbidden

Never use trailing-space soft breaks (`word  \n`) to fake a list.

```markdown
# Wrong
warm and subtropical  
hot summers  
mild winters

# Correct (prose when short)
The climate is warm and subtropical, with hot summers and mild winters.

# Correct (bullets when 4+ items or scannable info matters)
- Warm and subtropical
- Hot summers
- Mild winters
```

---

## Imports / Exports

Always inline as key–value on a single line each.

```markdown
- **Imports:** textiles, spices, luxury goods, metals
- **Exports:** silver, glass, wine, crafts, agricultural goods
```

If in the Overview stat block, same format.

---

## Climate Section

Short sections: condense to prose. Longer sections with distinct zones: use `###` subsections.

```markdown
## Climate (short)

The climate is warm and subtropical, with hot summers and mild winters.
```

```markdown
## Climate (zoned)

### Highlands
Cold and windier, with harsh winters and snow.

### Lowlands
Milder climate, dry summers.
```

---

## History Section

Prefer the named-era format. If eras don't have clear names, plain bullets work.

```markdown
## History (named eras)

- **The Age of Kings** — a king attempts to rule, central power remains weak
- **The Age of Trade** — trade expands rapidly, merchants become wealthier than nobles
- **The Age of the Five Houses** — merchants revolt, five houses take control
```

```markdown
## History (plain)

- Colonized by people from Jorpagna
- Barbarians from Begusta arrived later
- Many wars followed; the land was long ruled from Begusta
- Eventually, Magilre rebelled and became independent
```

---

## What to Remove

Strip anything that is author/game-design meta, not in-world lore:

- "Each village includes: population, local conflicts, professions, notable NPCs"
- "A family tree of the dukes is also included in the original material"
- "It can be described as a medieval trade republic, similar to Venice"
- Sections titled `## Themes`, `## Summary`, `## Typical Adventures`, `## Tone and Style`, `## Overall Picture`, `## Trivia`

---

## Files in Good Shape (reference)

These files are well-formatted and can be used as a reference when uncertain:

- **felicien.md** (`Ereb/Countries/Felicien/`) — best Overview stat block, good Society/Slavery structure
- **kardien.md** (`Ereb/Countries/Kardien/`) — good People subsections, Cities and Military format
- **jorduashur.md** (`Ereb/Countries/Jorduashur/`) — good Overview with merged Quick Facts, Religion with named gods
- **erebos.md** (`Ereb/Countries/Erebos/`) — good Geography with named island subsections, History eras
