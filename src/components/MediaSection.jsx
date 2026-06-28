import { useState, useEffect, useRef } from "react";
import VideoModal from "./VideoModal";
import { resolvePage } from "../data/compendiumPages";
import { adventures } from "../data/adventures";
import { entryImages } from "../data/entryImages.generated";
import { thumbSrc, onThumbError, IMAGE_MISSING } from "../lib/thumb";

const CHAPTERS = [
  { id: "6LBJzNV1ELE", label: "Prologue",   title: "The Altor Codex — Prologue" },
  { id: "uwAW1TD2hi4", label: "Backstory",  title: "The Altor Codex — Backstory" },
  { id: "SkHa9w8liis", label: "Chapter 1",  title: "The Secret of Skeleton Village" },
  { id: "-6x3huqel8E", label: "Chapter 2A", title: "The Misty Island" },
  { id: "b5zJNvqF5n8", label: "Chapter 2B", title: "The Misty Island" },
];

const EPISODES = [
  { id: "HP1Jp6Jw6K4", label: "Episode", title: "White Silence" },
  { id: "zrQP8BwudKM", label: "Episode", title: "The Hollow Back" },
];

const CHARACTERS = [
  { id: "eoVRxFnDAHU", label: "Character", title: "Kaelene Fenholt" },
  { id: "8F5Mb3Ammuw", label: "Character", title: "Bram Kestrel" },
  { id: "i-ydrEYHeCk", label: "Character", title: "Aelthira Moonveil" },
];

// Lore drawn from the series bible, grouped by the adventure each card belongs
// to. An adventure group's `link` resolves to its Compendium page (the source
// module behind the trio's version); each card may also carry its own `link`.
// This is the trio's world, so the cold plot and the characters live here in
// the Chronicles, not the Compendium. The final group holds the trio's own
// origins and the lands they came from, the backstory and prologue behind the
// road jobs.
const LORE_GROUPS = [
  {
    id: "skeleton",
    numeral: "I",
    title: "The Skeleton Village's Secret",
    link: "The Skeleton Village's Secret",
    blurb:
      "The trio's first road job, and the whole of it unfolds in a single day at one ruined village. A priest's ghost stops them on the road and begs them to cleanse the skeletons a necromancer left behind a century ago. They fight through to the church, find a nameless knight's grave still intact beneath the altar, and take nothing. The cold plot stays still; the warm clock runs the day.",
    people: [
      { label: "The Skeleton Village", name: "The Priest", link: "The Skeleton Village's Secret", description: "The ghost who haunts the road near a ruined village and begs passing travellers to cleanse the skeletons left in it. Two centuries ago he buried a nameless knight of The Shining Way beneath the church; a century later he died bringing a wall down on the necromancer who came to rob the grave. Freed at last, he thanks each of the trio by name." },
      { label: "The Skeleton Village", name: "The Nameless Knight", link: "The Skeleton Village's Secret", description: "A champion of The Shining Way who drove off a goblin raid alone two centuries ago and fell at the wall in the doing of it. The villagers buried him with honour beneath the church, his sunburst-and-sword shield and arms beside him. The trio leave every piece of it where it lies; his namelessness is the point." },
      { label: "The Skeleton Village", name: "The Necromancer", link: "The Skeleton Village's Secret", description: "The servant of death who came a century ago with twenty skeletons to strip the knight's grave. The priest killed him at the altar with a bolt of lightning and died in the same blast, but his soldier-precise skeletons still walk their patrol. He is never named." },
    ],
    locations: [
      { label: "The road", name: "The Skeleton Village", link: "The Skeleton Village's Secret", description: "An unnamed ruin a day off the road, razed by a goblin raid two centuries ago and later patrolled by a necromancer's skeletons, with a Shining Way knight buried beneath its church. The trio's first road job; cleansed and left free." },
    ],
  },
  {
    id: "misty",
    numeral: "II",
    title: "The Misty Island",
    link: "The Misty Island",
    blurb:
      "The trio's second road job, and the first told at full novel length. Three terrified dwarves bring word of an island that appears in the mist on the Grey, and against the exact shape of her nightmare, Kaelene chooses to go. Down through cold water lies a dead sorcerer's drowned hall, a grieving ghost, a bound demon, and a black-bladed sword. Only Aelthira carries the cold off the island.",
    people: [
      { label: "Greatstead", name: "Vagnhild", link: "The Misty Island", description: "Warge and Luvia's grown daughter, the image of her mother in youth and one of the trio's admirers at Greatstead. She hears the turn in her brother's path sooner than he does, and turns the island gold the trio leave behind into arming his training." },
      { label: "Greatstead", name: "Biorn", link: "The Misty Island", description: "Warge and Luvia's sixteen-year-old son, adventure-hungry exactly as Bram once was. Bram talks him out of following to the island and into staying to guard the village, and the boy takes up the spear." },
      { label: "The Three Stags", name: "Bryte", link: "The Misty Island", description: "The big, fair, well-liked former outlaw who keeps the front of Outskirt's inn, and never quite explains how he and Ulvar came by it." },
      { label: "The Three Stags", name: "Ulvar", link: "The Misty Island", description: "The lean, hunched, sharp-eyed former outlaw who keeps the inn's books and whose fingers still itch around a rich guest's purse. Kaelene reads him for what he is in seconds, one old thief knowing another." },
      { label: "Outskirt", name: "Throin", link: "The Misty Island", description: "The strongest of the three dwarves who haul metal up from the Ore Mountains to Outskirt each quarter. They are the eyewitnesses who burst into the Three Stags soaked and shaking, with the tale no one in the village will repeat: the mist parting on the Grey, an island where none had been." },
      { label: "Outskirt", name: "Badinor", link: "The Misty Island", description: "One of the three Ore Mountains dwarves who supply Outskirt and carry the wider world's news in with the metal. He saw the tall fire-licked shape on the island's tower and the sky gone red, and would not go near it again." },
      { label: "Outskirt", name: "Okald", link: "The Misty Island", description: "The third of the metal-bearing dwarves on their long quarterly trek from the Ore Mountains. Their terror is the spark that sets the trio on the road; once the tale is told, the three flee east and don't look back." },
      { label: "Outskirt", name: "Sirter", link: "The Misty Island", description: "A shabby villager with wine on his breath who sells the trio a half-burned map of the island for fifteen gold. The map is real; his story about it is not." },
      { label: "Outskirt", name: "Mifalodor", link: "The Misty Island", description: "The tiny, vinegar-tempered hermit alchemist above Outskirt who trades brews for goods and warns that the island makes magic cheap, and cheap magic is a door left open." },
      { label: "The Shining Way", name: "Rabindranath", link: "The Misty Island", description: "The old holy man who keeps Outskirt's chapel of The Shining Way and dreams true. He sends the trio off uneasy, having dreamed of a man in a torn shirt who waited a long time and was glad." },
      { label: "The Misty Island", name: "Cadal", link: "The Misty Island", description: "The grieving ghost in a torn mail shirt: a warrior who came to kill the sorcerer and save the woman he loved, and was killed by the demon Akrae before he reached her. He gives Bram his warding medallion and cannot rest until Akrae is dead." },
      { label: "The Misty Island", name: "Tuviol", link: "The Misty Island", description: "The woman Cadal loved and Prince Emrys's sister, held beneath the island and given to the sorcerer's working a century ago. The trio find her cell long cold, her tally of days cut off mid-row." },
      { label: "The Misty Island", name: "Emrys", link: "The Misty Island", description: "Tuviol's brother, a prince kept to be sacrificed, who scratched a last message into his cell wall begging whoever found it to tell Cadal where Tuviol was. Every line of that hope had already failed when he wrote it." },
      { label: "The Misty Island", name: "The Sorcerer", link: "The Misty Island", ref: "Sith", description: "The dead master of the drowned hall, who reached through the thin skin of the world for something he couldn't hold and burned for it, days before the trio set out. He left the Hollow Mark cut in the rock. The module names him Sith." },
    ],
    places: [
      { label: "Zorakin", name: "Outskirt", link: "The Misty Island", description: "A small forest village in eastern Zorakin, two days east of the Grey, that the trio quietly adopt as a home base between roads." },
    ],
    locations: [
      { label: "Outskirt", name: "The Grey", link: "The Misty Island", description: "A wide, still, mist-bound lake two days west of Outskirt that no one will fish, and no one will say why. The crossing to the Misty Island; something in the water watches and lets travellers pass." },
      { label: "The Grey", name: "The Misty Island", link: "The Misty Island", description: "An island that appears and vanishes in the Grey's mist, hiding a dead sorcerer's drowned hall. The site makes magic run cheap, a door left open. Adapted from the Drakar och Demoner module Dimön." },
      { label: "Outskirt", name: "Greatstead", link: "The Misty Island", ref: "The Great Farm", description: "The largest farm in Outskirt: Warge and Luvia's loud, full, loving house, and their children Vagnhild and Biorn. The home none of the trio ever had, which is why they talk its children off the road." },
      { label: "Outskirt", name: "The Three Stags", link: "The Misty Island", description: "Outskirt's one inn, run by the old outlaws Bryte and Ulvar. The warm centre of the village, and the room Bram holds with a story." },
      { label: "Outskirt", name: "Mifalodor's Hut", link: "The Misty Island", description: "The hermit alchemist's hut on the slope above Outskirt, where Mifalodor brews his elixirs and warns that cheap magic is a door left open." },
      { label: "Outskirt", name: "The Stone Chapel", link: "The Misty Island", description: "Outskirt's small chapel of The Shining Way, the order's sunburst-and-sword cut above the altar, the mark Tarek taught Kaelene to read. Kept by the dreaming priest Rabindranath." },
    ],
    items: [
      { label: "Blade", name: "The Deathbringer", link: "The Misty Island", description: "Cadal's pitch-black broadsword, its runes a bound summons: spoken aloud, they call living fire to serve the wielder a while, then send it home. Bram carries it out of the drowned hall, the one worked thing they take." },
      { label: "Talisman", name: "Cadal's Medallion", link: "The Misty Island", description: "The dead champion's warding talisman, given to Bram. Magic slides off it, and it glows blue when death-magic is near. It is the reason Bram lives where Cadal did not." },
      { label: "Map", name: "The Burned Map", link: "The Misty Island", ref: "Map", description: "A half-burned but genuine map of the Misty Island, sold to the trio by the unreliable Sirter for fifteen gold. He took it off a traveller who died on the west track." },
      { label: "Draught", name: "The Antimagi Draught", link: "The Misty Island", description: "Mifalodor's flat grey warding brew that turns a person, for a while, into poor soil for a spell to take root in. Kaelene drinks it before facing the demon Akrae." },
    ],
  },
  {
    id: "unicorn",
    numeral: "III",
    title: "The Unicorn Horn",
    link: "The Unicorn Horn",
    blurb:
      "The trio's third road job, a journey rather than a single ruin. An old priestess of the Delitha order hires them to recover a lost relic, a fragment of unicorn horn hidden a generation ago beneath the free city of Kandra, and to find the child the left-hand priests have taken for it. The rescue becomes a race, then a trap, then the loudest the cold plot has rung yet, and the thing that took Tarek begins to climb the thread toward Kaelene.",
    people: [
      { label: "The Delitha order", name: "The Sanctified", link: "The Unicorn Horn", description: "The old, part-elven priestess of the Delitha order's highest grade who hires the trio at the healing temple outside Kérem-el-Krôm and sets the quest. A patron, not a fighter, grown eccentric in her long age." },
      { label: "The cold plot", name: "Liella", link: "The Unicorn Horn", description: "Twelve years old, last of the Delitha founder's bloodline, taken by the Zeeri because she is bound to the relic. She dreams the same cold corridor Kaelene does, though they share no blood, proof the dream runs through the thing on the other side. She refuses the open door from the inside and saves herself." },
      { label: "Kandra", name: "Larm Legast", link: "The Unicorn Horn", description: "The long-dead smith and dwarf-friend who carried the relic out of a burning temple a generation ago and hid it in dwarf-built catacombs beneath his own house in Kandra, behind three scattered keys. Sixteen years in the ground before the story opens." },
      { label: "Kandra", name: "Liva", link: "The Unicorn Horn", description: "Larm's daughter, a gem-cutter in Kandra, who keeps the first key without knowing what it is. The Zeeri seize her to force the trio's hand, and Bram cuts her free at the climax." },
      { label: "The Zeeri", name: "Sarn", link: "The Unicorn Horn", description: "The Zeeri priest who works the finished Hollow Mark at the foot of the buried pillar to force the door open, the book's antagonist on the ground. He is taken by the door he opened as it shut." },
    ],
    places: [
      { label: "Berendien", name: "Kandra", link: "The Unicorn Horn", description: "A small free city built where two rivers meet under a golden owl on red, known for its blue-tinted glass. The relic's hiding place and the country's deepest knock-point both lie in the catacombs beneath it." },
      { label: "Kandra", name: "The Magicians' House", link: "The Unicorn Horn", description: "A hexagonal guild-tower raised over a buried basalt pillar. For four hundred years its magicians have argued over how to cut the Hollow Mark into its floor and never finished it, the one thing keeping the door beneath shut." },
      { label: "The river road", name: "Hébanon", link: "The Unicorn Horn", description: "A river-mouth town on the way to Kandra, ruled by a council of merchants, known for its gladiator games and a prophecy-driven ban on magicians. A waypoint on the trio's journey." },
      { label: "The river road", name: "Kérem-el-Krôm", link: "The Unicorn Horn", description: "The trading village on the great river where the job begins. The Delitha order's healing temple stands a short ride outside it, and the Sanctified sets the quest there." },
    ],
    locations: [
      { label: "Kandra", name: "The Catacombs", link: "The Unicorn Horn", description: "Dwarf-built passages beneath Larm's house, sealed behind three locked doors and three scattered keys, that open onto the cavern and the buried pillar at the foot of the city. The cold corridor of Kaelene's nightmare, walked at last on purpose." },
    ],
    items: [
      { label: "Relic", name: "The Unicorn-Horn Fragment", link: "The Unicorn Horn", description: "A shard of unicorn horn and the spirit-stone bound to it, hidden by Larm Legast a generation ago. Liella is tied to it, and holds it warm in her hands when she turns the open door away." },
      { label: "Keys", name: "The Three Keys", link: "The Unicorn Horn", description: "Three keys scattered through Kandra that open the relic's vault: one kept by Liva, one down a well on the southern square, one hidden in the city's own owl coat-of-arms above Larm's door." },
      { label: "Sign", name: "The Hollow Mark", link: "The Unicorn Horn", description: "The figure cut into the cavern floor, finished where Kandra's magicians spent four hundred years refusing to finish their own. Aelthira knows it from the island and the Academy: one thing, now seen four times." },
    ],
  },
  {
    id: "borrowed",
    numeral: "IV",
    title: "The Borrowed War",
    link: "The Unicorn and the Dragon-Serpent",
    blurb:
      "The trio's fourth road job and the first deliberate side story, a war far off their own map. They answer a recruiter's poster on the Berendien coast and sail east to Hynsolge, into the tenth year of a civil war, hired as foreign muscle. Under the war runs something older, a star-cult that means to use a dying fallen star. The cold plot does not move an inch, on purpose, and Aelthira learns to tell a true rhyme from her own door. Adapted from the Drakar och Demoner module The Unicorn and the Dragon-Serpent.",
    people: [
      { label: "The New Army", name: "Abrahim Stoneclaw", link: "The Unicorn and the Dragon-Serpent", description: "New baron of Ansorvia and field-leader of the freed-serf New Army, marching under the white unicorn, whose father a baron tortured to death years before. A grave, merciful commander who steadies men by being looked at, and wins his country in the lemon groves." },
      { label: "The Star Doctrine", name: "Parikila Omurtaag", link: "The Unicorn and the Dragon-Serpent", description: "Half-demon master of the Star Doctrine and murderer of its founder, who wields a blade that drinks light and souls and serves Onaabys of the Red Moon. Old, patient, and certain of more time. He escapes the climax by teleport, carrying the spent star south." },
      { label: "Bolthar", name: "Eb-Bolthar", link: "The Unicorn and the Dragon-Serpent", description: "An old war-priest of the axe-god Bolthar, no metal on him, who came east hunting the half-demon, arrived too late, and threw his weight into the battle instead and turned it. The one figure who carries cosmic-scale weight, so the trio can stay human." },
      { label: "Hynsolge", name: "Agila", link: "The Unicorn and the Dragon-Serpent", description: "The crippled poet whose smuggled verse gave the war its slogan of the twisted horn, held thirty years in a baron's cell. Freed and reunited with his son at the close." },
      { label: "The New Army", name: "Serter Doublehand", link: "The Unicorn and the Dragon-Serpent", description: "Agila's son, the recruiter on the Berendien coast who signs the trio onto the rebel rolls, not knowing his imprisoned father still lives." },
      { label: "The cult's captives", name: "Aldred Stoneward", link: "The Unicorn and the Dragon-Serpent", description: "A Berendien-born adventurer and secret werewolf, taken by the star-cult for the blood its rite needs and freed by the trio in the under-temple." },
      { label: "The cult's captives", name: "Salah Goldheart", link: "The Unicorn and the Dragon-Serpent", description: "A sorceress and Aldred's beloved, taken by the cult for the recipe's blood. She spends the last of her power on a sending that brings the trio to them." },
    ],
    places: [
      { label: "Copper Sea", name: "Hynsolge", link: "Hynsolge", description: "A small, sun-baked land on the far shore of the Copper Sea, all lemon groves and river cities and more little gods than it can use, in the tenth year of a civil war between a freed-serf New Army and the old baronage." },
      { label: "Hynsolge", name: "Greyburg", link: "The Unicorn and the Dragon-Serpent", description: "The river city and county seat of Brangoria, climbing in tiers of pale stone above a fat brown river. Held by a cruel baron under the red dragon-serpent; the Star Doctrine's temple lies in a dome beneath it." },
      { label: "The far south", name: "Soluna", link: "The Unicorn and the Dragon-Serpent", description: "A far southern continent, off the trio's map, where the half-demon keeps a son and a fire. The dying star is carried there at the close, parking that thread a long way off and on its own axis." },
    ],
    items: [
      { label: "Blade", name: "Kred-Bar-Onaabys", link: "The Unicorn and the Dragon-Serpent", description: "Parikila's blade that drinks the light, the weapon he waits behind in the temple beneath Greyburg." },
      { label: "Relic", name: "The Fallen Star", link: "The Unicorn and the Dragon-Serpent", description: "A dying fallen star, a spent relic of the Red Moon, carried down out of the forest. The cult means to use it; the half-demon carries what is left of it south, to be fed back to strength over years." },
      { label: "Blade", name: "The Deathbringer", link: "The Unicorn and the Dragon-Serpent", description: "Cornered against the half-demon, Bram wakes the black sword's salamanders again and feels none of the old dread, because the fire is plainly and only needed. The thing he feared was never the sword but the reaching for it." },
      { label: "Keepsake", name: "The Unicorn Medal", link: "The Unicorn and the Dragon-Serpent", description: "The medal stamped with a unicorn that closes the book, with a freed poet, a ship turning west, and an apple shared at the rail. The warm clock, alone." },
    ],
  },
  {
    id: "shadow",
    numeral: "V",
    title: "The Shadow of a Rose",
    link: "Shadow of a Rose",
    blurb:
      "The trio's fifth road job and the second deliberate side story, a holiday at the bottom of the world. They sail down the one-way strait to Krilloan on a careless whim and cannot leave, the wind that would carry them home blows perhaps once in five years. One idle evening catches them a dying courier's silver cup, a coven's grudge, and a vampire's patience. This module rhymes with the spine harder than any before it, and every rhyme is rendered, on purpose, as not the thing. Adapted from the Drakar och Demoner module Skuggan av en ros.",
    people: [
      { label: "Black Rose Brotherhood", name: "Mildred Yeovil", link: "Shadow of a Rose", description: "Krilloan's foremost herb-mistress, pale and lovely and cold-eyed, secretly a true witch sworn to the demon-prince Hemaquiel and a leader of the Black Rose Brotherhood. She runs the hirelings who hunt the cup, then sues the trio for peace when the vampire turns on the city, and keeps her word at the close: she clears their name and deeds them a house." },
      { label: "Black Rose Brotherhood", name: "Hilja", link: "Shadow of a Rose", description: "The Brotherhood's finest mind-walker, a lame, bedbound woman whose soul leaves her broken body to ride at a distance. She is the cold that chose in the lane and the passenger that walked Bram into a poisoned kitchen and heard everything the trio said for a fortnight." },
      { label: "Imaria's cult", name: "Lerajie", link: "Shadow of a Rose", description: "An old, pale, deathless vampire, emissary of the imprisoned goddess Imaria, grown out of patience with the coven's century of quiet. He raises the dead in the trio's stolen faces and sets the city alight to flush them out, and so betrays his own coven. Ended in the Black Library by Bram's fire." },
      { label: "The Gendilj", name: "Karcist Kataris", link: "Shadow of a Rose", description: "The masked benefactor who shadows the trio from the tower onward and breaks them out of the condemned cell on the eve of the pyre, because he hunts the same enemy and they serve him alive. Motive half-lit; a player with a hand of his own." },
      { label: "Ordo Magica", name: "Guazzo Arathaso", link: "Enemies of the Beginning", description: "A broad, one-eyed old dwarf, a master of Ordo Magica who throws no reflection. He identifies the cup at once, offers too much gold to take it off the trio's hands, swallows the cult's name, and sends word the moment they leave. The order's cold interest in a dangerous thing loose in its city." },
      { label: "Sabertooth Guard", name: "Sereth Vohr", link: "Shadow of a Rose", description: "Guazzo's sworn sword, plain-faced and flat-eyed, in a helm wrought as a sabertooth's skull. She marks the trio at the tower, watches their trial, and charges the walking dead beside them in the square, soldier to soldier. Neither friend nor enemy." },
      { label: "The Oktagon", name: "Hemaquiel", link: "Shadow of a Rose", description: "A horned, goat-footed demon-prince, the Brotherhood's god, an enemy of the light who prizes wisdom and joy and rarely strikes directly. He keeps three owned pocket-worlds, is bound absolutely by his own word, and grants the trio the vampire's life because the vampire betrayed his coven. A transaction, not the cold." },
      { label: "The Black Library", name: "Jazeriel", link: "Shadow of a Rose", description: "The bored, ancient demon-librarian who keeps Hemaquiel's labyrinth and points the way to a quarry only for a riddle answered. He gives the trio a dagger that points to the undead." },
    ],
    places: [
      { label: "Sanritra peninsula", name: "Krilloan", link: "Krilloan", description: "A canal-laced jungle port south of the Copper Sea, down the one-way Way Out: easy to sail to and all but impossible to leave. Ruled in truth by the magicians of Ordo Magica over a deep underworld of demon-cults. The trio are stranded here at the close." },
      { label: "Krilloan", name: "The Sink", link: "Shadow of a Rose", description: "Krilloan's old thieves' quarter, sunk into a stone hollow and laced with tunnels into the sewers, so a careful traveller crosses half of it unseen. Kaelene's element." },
      { label: "Off Krilloan", name: "Tannatopol", link: "Tannatopol", description: "A fog-bound island off Krilloan where the necromancers keep their dead within the law, founded by the deathless Vlad Kamantur. Krilloan alone among the lands of the light tolerates raised dead, which is its pride and the fuse the vampire lights." },
    ],
    locations: [
      { label: "Hemaquiel's worlds", name: "The Black Library", link: "Shadow of a Rose", description: "A shifting labyrinth said to hold a copy of everything ever thought, said, or done. Aelthira rules it a demon's vanity and walks past it, but files it as the one place that could answer what the Hollow Mark is and whether Tarek is dead. A loaded gun left for later." },
      { label: "Hemaquiel's worlds", name: "Rodomelantos & Yflasefugh", link: "Shadow of a Rose", description: "The demon-prince's other two owned worlds: Rodomelantos, the burning island where his witches gather from across Altor, and Yflasefugh, the fire-place where he sends his enemies to burn. Reached by a keyed mushroom-ring rite." },
      { label: "The way south", name: "The Way Out & the RhabdoRhinn", link: "Shadow of a Rose", description: "The one-way strait that lets a ship slip south with ease but never beat back north, except on the RhabdoRhinn, a hard southerly that blows perhaps once in five years. The reason the trio reach Krilloan on a whim and cannot leave." },
    ],
    items: [
      { label: "Relic", name: "The Silver Cup", link: "Shadow of a Rose", description: "Holy to the imprisoned death-goddess Imaria, pressed into Kaelene's arms by a dying courier in a lane. The magicians of Ordo Magica covet it, the Black Rose Brotherhood hunts it, and the whole book turns on who holds it." },
      { label: "Grimoire", name: "The Black Book", link: "Shadow of a Rose", description: "A coven's stolen grimoire marked with a five-pointed star, recovered from a pawnshop on its own ticket. The star is a common pentagram, Kaelene names it, and Aelthira rules it not the Hollow Mark." },
    ],
    seeds: [
      { label: "Firewalled", name: "Imária", link: "Imária", description: "The imprisoned death-goddess the silver cup serves: far off, patient, and bent on drowning the world. A different prisoner on a different axis from the Crowned One, and explicitly not freed here. The cup teaches Aelthira that the dark holds more than one such prisoner." },
      { label: "A planted lever", name: "Vlad Kamantur", link: "Shadow of a Rose", description: "A deathless necromancer who founded both Ordo Magica and the necromancer-isle of Tannatopol, his own memory long since worn to nothing. Seeded only as a dark portrait on the tower stair: an undying thing old enough to have seen the Confluxes, with a hole where its past should be." },
    ],
  },
  {
    id: "backstory",
    numeral: "0",
    title: "Backstory & Prologue",
    blurb:
      "The prequel the road jobs grow out of: the closed worlds the trio each walked out of, the mentors who shaped them, and the cold thing that woke in a southern tomb and began to follow Kaelene's thread. The lands they came from, and the wound the whole series turns on.",
    people: [
      { label: "Kaelene's mentor", name: "Tarek", description: "The quiet man who saw the skill behind a starving thief and trained Kaelene in Poane. He taught her to read rooms and marks, the Shining Way's sunburst-and-sword among them. He fell in the Jorpagna tomb; whether he truly died is left open." },
      { label: "The threat", name: "The Crowned One", description: "The ancient, crowned thing woken in the Jorpagna tomb. It crosses distance without seeming to move, carries a killing cold, and took Tarek. Now it follows a thread that leads to Kaelene, and after the working beneath Kandra it has begun to climb it." },
      { label: "Bram's mentor", name: "Orvith", description: "The lean, weathered caravan guard who taught Bram his craft by showing rather than telling, and gave him his first real respect on the Morral run." },
      { label: "Aelthira's friend", name: "Fen Marwick", description: "Aelthira's steady study-partner of five years at the Academy. He counsels caution, then carries her bag to the gate when she leaves. Her tether back to Atrema." },
      { label: "Aelthira's mentor", name: "Professor Carenthal", description: "The long-tenured faculty member who always took Aelthira seriously, and in the end was part of the institution's refusal. He never told her she was wrong, which was the most honest thing he could do." },
      { label: "Bram's road", name: "Corvel", description: "The soft-voiced merchant who lends to villages at terms they can't pay and collects in forced labour. Warning Mern about him cost Bram his post." },
      { label: "Bram's road", name: "The Caravan Master", description: "The pragmatic woman who runs the Vesket-to-Morral caravan and first takes Bram on as muscle, then lets him go over the Mern affair without rancour. In his tall tales she slips into a former employer he calls Corvin." },
      { label: "Brinewatch", name: "Bram's Father", description: "The dock master of Brinewatch, hard and precise and never loud, who loves through work and expectation. The home Bram hasn't gone back to." },
      { label: "Brinewatch", name: "Bram's Brother", description: "Bram's quiet, steadying brother, who gave him the worn ship-coin and stayed to keep their father's dock. The one Bram writes to and means to go back for." },
    ],
    places: [
      { label: "Klomellien", name: "Klomellien", link: "Klomellien", description: "A salt-rich land in the cold north of Ereb, off the Copper Sea. Fish, salt and coal come out of its working ports, and so do people who stay and get used up." },
      { label: "Poane", name: "Poane", description: "The grey northern harbour city in Klomellien where Kaelene grew up and learned to read a crowd. She got out; most don't." },
      { label: "Zorakin", name: "Zorakin", link: "Zorakin", description: "A feudal kingdom on the Copper Sea and, in older song, the heartland of The Shining Way. It holds both Brinewatch on the coast and Outskirt deep in the eastern forest." },
      { label: "Brinewatch", name: "Brinewatch", description: "The whitewashed fishing village on Zorakin's coast where Bram grew up under his father the dock master, and walked out one morning rather than inherit it." },
      { label: "Berendien", name: "Berendien", link: "Berendien", description: "A realm founded after the Third Conflux, when chieftains and forest elves broke the svartfolk. Its founding myth turns on an elf-given crown, an uneasy rhyme with the thing now following Kaelene." },
      { label: "Berendien", name: "Atrema", description: "A warm-stoned university city below the Carenthi peaks, all vineyards and cypress. The Academy keeps its upper towers; Aelthira studied there six years." },
      { label: "The south", name: "Jorvaine", description: "A southern town and Aelthira's first destination, home to a reclusive scholar who published on animist boundary theory and then went silent." },
      { label: "Copper Sea", name: "Jorpagna", link: "Jorpagna", description: "Once the dominant empire of the Copper Sea, consumed in the Third Conflux by the fleshbiters and the horrors loosed from its own magic schools. Now a haunted ruin, and the place where Tarek fell and the Crowned One woke." },
      { label: "Bram's road", name: "Vesket, Morral, Mern & Adrath", description: "The caravan circuit Bram learned the road on: Vesket the market town, Morral the caravan city, Mern a village broken by debt-bondage, and Adrath, where his conscience cost him a post." },
    ],
    locations: [
      { label: "Atrema", name: "The Academy", description: "The institution in Atrema's upper towers where the magic schools are taught, and where a restricted archive hides documents older than the Academy itself. Aelthira left rather than teach a model she knew was a lie." },
      { label: "Jorpagna", name: "The Jorpagna Tomb", description: "The ruin beneath Jorpagna that Kaelene and Tarek delved three years before the story's present, where they woke the crowned thing that took him." },
    ],
    items: [
      { label: "Sign", name: "The Hollow Mark", description: "The figure the sorcerer cut into the rock of the Misty Island, named for the pointed emptiness at its centre. Aelthira sees it is the same shape the Academy locked away: proof, cut in stone, that the buried thing is real." },
      { label: "Text", name: "The Mireth Principles", description: "A foundational magical text cited with a tell-tale 'generally', the loose thread Aelthira pulls until the whole buried lie comes with it." },
      { label: "Keepsake", name: "Bram's Ship-Coin", description: "His brother's worn coin, a ship stamped almost smooth. It is Bram's unfinished goodbye, and the anchor he carries the road on." },
    ],
  },
];

// Reading order: the prequel (Episode 0) first, then the five road jobs.
const GROUP_ORDER = ["backstory", "skeleton", "misty", "unicorn", "borrowed", "shadow"];
const ORDERED_GROUPS = [...LORE_GROUPS].sort(
  (a, b) => GROUP_ORDER.indexOf(a.id) - GROUP_ORDER.indexOf(b.id)
);

// Chronicles cards borrow (never copy) images that already live in the
// Compendium: a card linking to an adventure shows that adventure's portrait
// of the same subject, and a card linking to a country shows the country's
// first page image. Paths point straight at the existing /compendium files.
const normName = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// adventure id -> Map(normalised card name -> { name, description, src, portrait,
// fit }). The Compendium shows character art as 2:3 portraits and places/items as
// 16:9, so we carry each source card's orientation through (figures default to
// portrait, matching the adventure view's NPC/Creature grids).
const ADVENTURE_CARDS = (() => {
  const out = {};
  for (const a of adventures) {
    const m = new Map();
    const add = (figure) => (c) => {
      if (c?.name && !m.has(normName(c.name)))
        m.set(normName(c.name), {
          name: c.name,
          description: c.description ?? "",
          src: c.image ?? null,
          portrait: c.portrait ?? figure,
          fit: c.fit,
        });
    };
    (a.characters || []).forEach(add(true));
    (a.creatures || []).forEach(add(true));
    (a.places || []).forEach(add(false));
    (a.items || []).forEach(add(false));
    for (const s of a.sections || []) {
      (s.npcs || []).forEach(add(true));
      (s.creatures || []).forEach(add(true));
      (s.places || []).forEach(add(false));
      (s.items || s.objects || []).forEach(add(false));
    }
    out[a.id] = m;
  }
  return out;
})();

// The Compendium card a Chronicles card draws from, so shared cards live in one
// place. A card names the adventure card it borrows from with `ref`, else we
// match on the card's own name (exact, then a shared prefix/suffix, so the bible's
// "Tuviol" finds "Princess Tuviol"). Returns the source card or null.
function matchAdventureCard(item) {
  const target = item.link ? resolvePage(item.link) : null;
  if (!target || target.kind !== "adventure") return null;
  const m = ADVENTURE_CARDS[target.id];
  if (!m) return null;
  const key = normName(item.ref ?? item.name);
  if (m.has(key)) return m.get(key);
  for (const [name, card] of m) {
    const [short, long] = key.length <= name.length ? [key, name] : [name, key];
    if (short.length >= 4 && (long.startsWith(short) || long.endsWith(short))) return card;
  }
  return null;
}

// The image for a Chronicles card as { src, portrait, fit }, or null: the matched
// adventure card's art, or a linked country page's first image (shown landscape).
function loreCardImage(item, match) {
  if (match?.src) return { src: match.src, portrait: match.portrait, fit: match.fit };
  const target = item.link ? resolvePage(item.link) : null;
  if (target && target.kind !== "adventure") {
    const src = entryImages[target.id];
    if (src) return { src, portrait: false, fit: undefined };
  }
  return null;
}

// The card types rendered under each adventure group, in order.
const LORE_TYPES = [
  { key: "people", label: "People" },
  { key: "places", label: "Places" },
  { key: "locations", label: "Locations" },
  { key: "items", label: "Items" },
  { key: "seeds", label: "Threads to the Spine" },
];

function MediaGrid({ items, onSelect }) {
  return (
    <div className="media-grid">
      {items.map((item) => (
        <button key={item.id} className="media-card media-card--clickable" onClick={() => onSelect(item)}>
          <div className="media-card__thumbnail">
            <img
              src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
              alt={item.title}
              loading="lazy"
            />
            <div className="media-card__play-overlay">
              <span className="media-card__play-icon">▶</span>
            </div>
          </div>
          <div className="media-card__info">
            <span className="media-card__type">{item.label}</span>
            <h3 className="media-card__title">{item.title}</h3>
          </div>
        </button>
      ))}
    </div>
  );
}

function LoreImage({ src, alt }) {
  if (!src) return null;
  return (
    <div className="lore-card__media">
      <img src={thumbSrc(src)} alt={alt} loading="lazy" onError={onThumbError(src)} />
    </div>
  );
}

// A single-image viewer: click the backdrop or press Escape to close.
function Lightbox({ image, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className="lightbox__content"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={image.caption || "Image viewer"}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lightbox__close" onClick={onClose} aria-label="Close image viewer">✕</button>
        <div className="lightbox__track">
          <img src={image.src} alt={image.alt} className="lightbox__image" />
        </div>
        {image.caption && (
          <div className="lightbox__footer"><p className="lightbox__caption">{image.caption}</p></div>
        )}
      </div>
    </div>
  );
}

// One Chronicles lore card, built from the Compendium's card so borrowed images
// fit the same way (2:3 portraits, 16:9 places). The card never navigates on its
// own: clicking the image opens it full size, and only the "view more" link goes
// to the Compendium page it shares a subject with.
function LoreCard({ item, onOpenPage, groupTarget, onLightbox }) {
  const match = matchAdventureCard(item);
  const img = loreCardImage(item, match);
  // Shared cards take their text from the adventure (single source of truth); a
  // card's own description is the fallback, used for the cold-plot subjects and
  // renamed figures no adventure card holds.
  const description = match?.description || item.description || "";
  const target = item.link ? resolvePage(item.link) : null;
  const linkable = target && onOpenPage;
  const sameAsGroup = groupTarget && target && groupTarget.kind === target.kind && groupTarget.id === target.id;
  const cls =
    "codex-card chron-card" +
    (img?.portrait ? " codex-card--portrait" : "") +
    (img?.fit === "contain" ? " codex-card--fit" : "") +
    (img ? " codex-card--split" : "");

  return (
    <article className={cls}>
      {img ? (
        <button
          className="codex-card__image-btn"
          onClick={() => onLightbox({ src: img.src, alt: item.name, caption: item.name })}
          aria-label={`View image of ${item.name}`}
        >
          <div className="codex-card__image-wrap">
            <img className="codex-card__image" src={thumbSrc(img.src)} alt={item.name} loading="lazy" onError={onThumbError(img.src)} />
          </div>
        </button>
      ) : (
        <div className="codex-card__image-wrap">
          <img className="codex-card__image codex-card__image--missing" src={IMAGE_MISSING} alt="" aria-hidden="true" />
        </div>
      )}
      <div className="codex-card__body">
        <span className="codex-card__kicker">{item.label}</span>
        <p className="codex-card__title">{item.name}</p>
        <p className="codex-card__summary">{description}</p>
        {linkable && !sameAsGroup && (
          <button className="codex-card__entry-link codex-card__entry-link--btn" onClick={() => onOpenPage(target)}>
            {target.kind === "adventure" ? "Read the adventure" : "Open in compendium"} ↗
          </button>
        )}
      </div>
    </article>
  );
}

function LoreGrid({ items, onOpenPage, groupTarget, onLightbox }) {
  return (
    <div className="country-detail__entries-grid">
      {items.map((item) => (
        <LoreCard key={item.name} item={item} onOpenPage={onOpenPage} groupTarget={groupTarget} onLightbox={onLightbox} />
      ))}
    </div>
  );
}

// Sidebar order: Watch (the videos), then Episode 0 and the five road jobs.
const NAV_ITEMS = [
  { id: "watch", numeral: null, title: "Watch" },
  ...ORDERED_GROUPS.map((g) => ({ id: g.id, numeral: g.numeral, title: g.title })),
];

function ContentHeader({ eyebrow, title }) {
  return (
    <>
      <div className="country-detail__header">
        <div className="country-detail__header-text">
          <p className="country-detail__eyebrow">{eyebrow}</p>
          <h2 className="country-detail__name">{title}</h2>
        </div>
      </div>
      <div className="country-detail__divider" />
    </>
  );
}

function WatchContent({ onSelect }) {
  const blocks = [
    { label: "Chapters", items: CHAPTERS },
    { label: "Episodes", items: EPISODES },
    { label: "Characters", items: CHARACTERS },
  ];
  return (
    <>
      <ContentHeader eyebrow="The Chronicles" title="Watch" />
      {blocks.map(({ label, items }) => (
        <div key={label} className="country-detail__block">
          <p className="location-panel__section-label">{label}</p>
          <MediaGrid items={items} onSelect={onSelect} />
        </div>
      ))}
    </>
  );
}

function GroupContent({ group, onOpenPage, onLightbox }) {
  const groupTarget = group.link ? resolvePage(group.link) : null;
  const title = group.numeral != null ? `${group.numeral}. ${group.title}` : group.title;
  return (
    <>
      <ContentHeader eyebrow="The Chronicles" title={title} />
      {group.blurb && <p className="country-detail__section-desc">{group.blurb}</p>}
      {groupTarget && onOpenPage && (
        <button className="chron-read-cta" onClick={() => onOpenPage(groupTarget)}>
          Read the adventure ↗
        </button>
      )}
      {LORE_TYPES.map(({ key, label }) =>
        group[key]?.length ? (
          <div key={key} className="country-detail__block">
            <p className="location-panel__section-label">{label}</p>
            <LoreGrid items={group[key]} onOpenPage={onOpenPage} groupTarget={groupTarget} onLightbox={onLightbox} />
          </div>
        ) : null
      )}
    </>
  );
}

export default function MediaSection({ onOpenPage }) {
  const [active, setActive] = useState(null); // open video, if any
  const [lightbox, setLightbox] = useState(null); // open image, if any
  // The story reads in order from its prequel, so Episode 0 (the backstory and
  // prologue) is the landing chapter.
  const [selected, setSelected] = useState("backstory");
  const group = ORDERED_GROUPS.find((g) => g.id === selected);

  return (
    <section id="chronicles" className="media-section">
      <div className="section-header">
        <p className="section-eyebrow">THE CHRONICLES</p>
        <h2 className="section-title">The Story So Far</h2>
        <p className="section-subtitle">
          Five road jobs, the trio who walk them, and the cold thread that runs beneath.
        </p>
      </div>

      <div className="compendium-layout">
        <aside className="compendium-sidebar">
          <nav className="compendium-nav">
            <div className="compendium-nav__section">
              <div className="compendium-nav__section-hd">
                <div className="compendium-nav__hd-title chron-nav__hd">
                  <span className="compendium-nav__sigil">❖</span>
                  <span className="compendium-nav__title">The Chronicles</span>
                </div>
              </div>
              <ul className="compendium-nav__list">
                {NAV_ITEMS.map((it) => (
                  <li key={it.id}>
                    <button
                      className={`compendium-nav__item chron-nav__item${selected === it.id ? " compendium-nav__item--active" : ""}`}
                      onClick={() => setSelected(it.id)}
                    >
                      <span className="chron-nav__num">{it.numeral ?? ""}</span>
                      <span>{it.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        <div className="compendium-main">
          {selected === "watch" ? (
            <WatchContent onSelect={setActive} />
          ) : (
            group && <GroupContent group={group} onOpenPage={onOpenPage} onLightbox={setLightbox} />
          )}
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
      {lightbox && <Lightbox image={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}
