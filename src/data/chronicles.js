// Chronicles content data: the trio's road jobs, the cold plot, and the
// backstory, as structured lore groups. Extracted from MediaSection.jsx so the
// content lives as data, not code (and can be imported by tooling).

// Lore drawn from the series bible, grouped by the adventure each card belongs
// to. An adventure group's `link` resolves to its Compendium page (the source
// module behind the trio's version); each card may also carry its own `link`.
// This is the trio's world, so the cold plot and the characters live here in
// the Chronicles, not the Compendium. The final group holds the trio's own
// origins and the lands they came from, the backstory and prologue behind the
// road jobs.
export const LORE_GROUPS = [
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
    id: "made-dragon",
    numeral: "VI",
    title: "The Made Dragon",
    link: "Enemies of the Beginning",
    blurb:
      "The trio's sixth road job and their first as settled residents of Krilloan. The Commandant's daughter hires them to find her vanished brother, and the thread runs under the whole city: a conspiracy to whip Krilloan into a mob and march it on the necromancer-isle of Tannatopol. Behind it lie an old animist's fifty-year grudge and a dragon regrown from the dead. Bram carries the black sword into the dragon's cave as plain steel and never wakes its fire; the beast is undone by an apple, not a blade. Adapted from the Drakar och Demoner module Enemies of the Beginning.",
    people: [
      { label: "The conspiracy", name: "Jesefael Bamilit", link: "Enemies of the Beginning", description: "A Kardian animist of a hundred and twenty-six who wears the face of forty, maker of the dragon and architect of the war on Tannatopol. He is certain he is the only kind man in a cruel world, and kills by the score to prove it. He dies at the island, burst apart by his own sun-crystal in a wild node he never knew was there." },
      { label: "The conspiracy", name: "Torquivel", link: "Enemies of the Beginning", description: "A witch whose gift is the aging of living things. She grew the dragon's hatchling to full size in a single season and loved it as her own child, then turned on Jesefael the moment the apple gave her back the small bewildered thing it truly was. Spared, she keeps the hatchling now in a long penance." },
      { label: "The made dragon", name: "Helsikel", link: "Enemies of the Beginning", description: "Morriart, a dragon dead an age, regrown from a scrap of her hide in a giant tortoise's egg and filled with her own vengeful soul. The dispelling apple scatters the borrowed soul and leaves a harmless hatchling behind." },
      { label: "The conspiracy", name: "Narnie Santhan", link: "Enemies of the Beginning", description: "The order's gentle spiritist prodigy, drugged and used to call the dead dragon's soul without ever knowing what she did. The trigger no one thought to chain. Freed of her passenger, with grief still to do." },
      { label: "The conspiracy", name: "Mystiria Bentonor", link: "Enemies of the Beginning", description: "A harmonist who drives gentle necromancers berserk and tunes a mob with music played on no instrument. The fair woman who walks calm out of a square she has turned to murder. Taken, and sentenced to the pyre." },
      { label: "The conspiracy", name: "Melchior Desdemonikon", link: "Enemies of the Beginning", description: "An illusionist and mentalist who seeds hatred into souls laid open by tainted holy water, and nearly drops Kaelene with a working that mimics a fit. Taken, and sent to the deep cells." },
      { label: "The conspiracy", name: "Lucretia Meleagros", link: "Enemies of the Beginning", description: "Jesefael's symbolist apprentice, a buyer of time who looks young at four hundred. Her binding is cut in three tattoos that must be looked at to take hold, and it breaks on Bram's warding medallion. She flees through the Caliban's Plate to warn the cave, and is taken there." },
      { label: "The Shining Way", name: "Lauritz Huggard", link: "Enemies of the Beginning", description: "A corrupt bontisal of the Shining Way who taints the holy water that opens the faithful to Melchior's hatred. The trio know his face at once: he sat as a juror at their own trial in Krilloan. His appalled order defrocks him." },
      { label: "Ordo Magica", name: "Guazzo Arathaso", link: "Enemies of the Beginning", description: "The one-eyed dwarf-magician who once only watched the trio now stands openly with them, pressing on them his gilded apple of a single unmaking, the one thing that can undo the dragon without fire." },
      { label: "The Commandant's house", name: "Yrea Destanior", link: "Enemies of the Beginning", description: "The Commandant's daughter, a young bard who defies her father's silence and hires foreigners to find her brother, because a secret that cannot leave the city is the only kind she can trust." },
      { label: "The Commandant's house", name: "Groffotor Destanior", link: "Enemies of the Beginning", description: "The Commandant's youngest son, taken through his family's own escape tunnel to blackmail his father, and turned green by an animism forced on him too young. A willing apprentice, then a bitterly repentant one, freed at last from the eleventh cell." },
      { label: "Krilloan's swords", name: "The Commandant", description: "Krilloan's military commander, a hard grey man blackmailed into keeping his watch idle while the mob gathered, his son the price of his silence. Freed, he turns his swords loose at last." },
    ],
    places: [
      { label: "Meh-Sylfhin", name: "Jesefael's Tower", link: "Enemies of the Beginning", description: "In Krilloan's pillar quarter, where the rich live on stone columns reached by cage-lifts and sky-traffic, Jesefael's palace stands on a single shaft some hundred and sixty metres high, a hanging garden on its roof and a hidden teleport-stone in its heart." },
      { label: "Off Krilloan", name: "Tannatopol", link: "Tannatopol", description: "The fog-bound necromancer-isle three kilometres off Krilloan, which is also the city's hospice for the dying, tended by the only people who fear neither the dead nor the sick. Jesefael means to burn it. The wild magic buried in its rock is what saves it." },
    ],
    locations: [
      { label: "Beneath the mountains", name: "The Dragon Cave", link: "Enemies of the Beginning", description: "The treasure-cave where the regrown dragon is fed and grown, reached only by the teleport-stone hidden in Jesefael's palace. Where Bram plants the apple and the beast is unmade." },
      { label: "Tannatopol", name: "The Wild Node", link: "Tannatopol", description: "An old, strong knot of wild magic in the island's rock, fierce enough to tear a delicate working apart. It is why the dead lie so quiet on Tannatopol, and the failsafe that bursts Jesefael's sun-crystal and kills him by his own plan." },
    ],
    items: [
      { label: "Relic", name: "Guazzo's Gilded Apple", link: "Enemies of the Beginning", description: "The dwarf-magician's gilded apple of a single unmaking, a one-use dispel he presses on the trio. Bram carries it into the cave and plants it on the dragon, and the borrowed soul scatters and the monster is a hatchling again." },
      { label: "Sun-crystal", name: "The Lirisin", link: "Enemies of the Beginning", description: "An elf-made crystal from before the dark times whose light annihilates the undead. Jesefael's weapon against Tannatopol, meant to scour the isle clean. Carried into the island's wild node, it bursts instead of firing, and takes him with it." },
      { label: "Made stone", name: "Caliban's Stone Plates", link: "Enemies of the Beginning", description: "A pair of teleport-stones of the old times, each twinned to its distant mate, so that to set a foot on one is to lift it from the other. The only road down from Jesefael's floating palace to the Dragon Cave." },
      { label: "Blade", name: "The Deathbringer", link: "Enemies of the Beginning", description: "Bram carries the black sword into a dragon's cave as plain steel, is tempted at the worst moment to wake its fire, and does not. The lesson of the borrowed war landing at last by being unneeded: the beast is undone by an apple, and the fire stays sheathed." },
    ],
    seeds: [
      { label: "Firewalled", name: "The Near Rhymes", description: "A soul poured out of death into a made body, a nature-spirit riding the girl Narnie, a crystal of pure light against the undead. Each rhymes with the buried thing, and Aelthira rules each a working with a maker and a method, a near rhyme and not the cold. The firewall holds a third time, and the Crowned One never once looks south." },
    ],
  },
  {
    id: "day-of-wrath",
    numeral: "VII",
    title: "The Day of Wrath",
    link: "Day of Wrath",
    blurb:
      "The trio's seventh road job, and the peak of the cold plot before it is cut. Impossible murders climb through Krilloan, forty-nine sinners killed in seven sevens, each by a different wrath, fulfilling a four-century-old prophecy of the Order of Saint Kleol: the archangel Angarion, come to scour a sinful city. To stop a god the trio help the Black Rose Brotherhood raise its opposite, and the rite's crystal chooses Kaelene for its vessel. Under a god's light the Hollow Mark surfaces on her at last, and in the sky above Krilloan she cuts the cold's thread out of her own heart and ends the hunt that has driven her since the tomb. Adapted from the Drakar och Demoner module Day of Wrath.",
    people: [
      { label: "The Order of Saint Kleol", name: "Angarion", link: "Day of Wrath", description: "The archangel of Etin of the Shining Way, named in Saint Kleol's four-century-old prophecy to descend and scour a sinful city once forty-nine sinners die in seven sevens. He works through a living human host. Not the cold but the light's own terrible justice, on a separate axis, which Aelthira rules out. Destroyed in the sky duel over Krilloan." },
      { label: "The Black Rose Brotherhood", name: "Teitan", link: "Day of Wrath", description: "An abyss-being of fire and the long dark, of the Oktagon and the Red Moon, prophesied as Angarion's opposite and called to meet him in the sky so the two spend their wrath on each other rather than on the city. Poured into a living vessel by the Brotherhood's rite, then drawn out again when the angel was unmade." },
      { label: "Angarion's host", name: "Ulrik Oddbratt", link: "Day of Wrath", description: "The last mad solitary of the Order of Saint Kleol, seventy-eight and fifty years alone on the Forithos plateau, kindly and vague by day and the archangel's willing host by night. He loves the sun and talks to the burned brothers in their graves. He dies when Angarion is unmade." },
      { label: "Krilloan", name: "Migael Kalvuonos", link: "Day of Wrath", description: "An Efarisk scholar, the one man who has studied the Order of Saint Kleol, who gives the trio the lore of Kleol, the seven sevens, and the burned monastery on Forithos." },
      { label: "Black Rose Brotherhood", name: "Mildred Yeovil", link: "Day of Wrath", description: "Krilloan's foremost herb-mistress and a leader of the Black Rose Brotherhood, the coven the trio bought their peace from once already. She brings them the only counter her Black Book names, and the alliance that raises a devil to fight an angel." },
      { label: "The Shining Way", name: "The Priest of Saint Minatius", description: "The honest new Kardian priest who replaced the corrupt one, and who reads Kaelene's knowledge of the order's mark as a kind of kinship. He gives her a sun-token that echoes Tarek, and a token of the order that carries the trio past the monastery's ward." },
    ],
    places: [
      { label: "Forithos", name: "St Kleol's Monastery", link: "Day of Wrath", description: "The ruined mountain cloister of the Order of Saint Kleol, high on the fault-plateau four days north of Krilloan, its brothers long dead in the fire. The abbot's grave sits on holy ground no Brother of the Black Rose can walk, so the trio go in for the prayer while the burned monks still guard the catacombs." },
      { label: "Krilloan", name: "The Temple in Meh-Phoe", link: "Day of Wrath", description: "The temple where the count of the dead is read against the prophecy, in one of Krilloan's canal quarters. A waypoint on the trail from the murders to the mad host on the mountain." },
    ],
    items: [
      { label: "Prophecy", name: "The Prophecy of Angarion", link: "Day of Wrath", description: "A four-century-old book of the Shining Way that promised the archangel would come to scour a sinful city once forty-nine sinners had died in seven groups of seven, each by a different wrath. The murders are the prophecy coming true on schedule." },
      { label: "Relic", name: "The Prayer-scroll", link: "Day of Wrath", description: "The full summoning-prayer the Brotherhood needs and cannot reach, walled in the abbot's grave on holy ground no Brother can cross. The trio fetch it out of the catacombs so the devil can be raised against the angel." },
      { label: "Keepsake", name: "The Sun-Token", description: "The token the honest priest of Saint Minatius presses on Kaelene, an echo of Tarek's sunburst-and-sword. Read as kinship in the church, it carries the trio past the ward on the monastery gate." },
    ],
    seeds: [
      { label: "The mark surfaces", name: "The Hollow Mark & the Rose", description: "What surfaces on Kaelene under the god's light is the Hollow Mark itself, the cold's own figure, with Hemaquiel's rose set in its dead centre. A single mark claimed twice over, by rivals and not by master and servant. Invisible her whole life, to a mirror, to a lover, even to Aelthira, and seen at last only now." },
      { label: "The thread cut", name: "The Crowned One", description: "The cold reaches through the Hollow Mark once, the nearest it has ever come to the living world, a brush and not an arrival. Holding her mind inside the borrowed god by Tarek's counting drill, Kaelene takes the thread the cold ran into her in the Jorpagna tomb and cuts it. The hunt that has driven her since is over, the corridor nightmare ends, and she walks free of the Crowned One at last." },
      { label: "A new thread", name: "Hemaquiel's Claim", link: "Shadow of a Rose", description: "Reverted to herself and falling to a death she is sure of, Kaelene is caught, not by mercy and not by the cold, but by the rose warm in the place the cold had been. The demon-prince the trio bargained with in Krilloan holds a claim on her now, a treacherous ally and keeper who would deal against the cold and turn the moment it is safe to collect her. The quieter thread Aelthira takes up alone." },
    ],
  },
  {
    id: "backstory",
    numeral: "0",
    title: "Backstory & Prologue",
    blurb:
      "The prequel the road jobs grow out of: the closed worlds the trio each walked out of, the mentors who shaped them, and the cold thing that woke in a southern tomb and began to follow Kaelene's thread. The lands they came from, and the wound the whole series turns on.",
    people: [
      { label: "Kaelene's mentor", name: "Tarek", image: "/compendium/Chronicles/tarek.jpg", description: "The quiet man who saw the skill behind a starving thief and trained Kaelene in Poane. He taught her to read rooms and marks, the Shining Way's sunburst-and-sword among them. He fell in the Jorpagna tomb; whether he truly died is left open." },
      { label: "The threat", name: "The Crowned One", description: "The ancient, crowned thing woken in the Jorpagna tomb. It crosses distance without seeming to move, carries a killing cold, and took Tarek. Now it follows a thread that leads to Kaelene, and after the working beneath Kandra it has begun to climb it." },
      { label: "Bram's mentor", name: "Orvith", image: "/compendium/Chronicles/orvith.jpg", description: "The lean, weathered caravan guard who taught Bram his craft by showing rather than telling, and gave him his first real respect on the Morral run." },
      { label: "Aelthira's friend", name: "Fen Marwick", image: "/compendium/Chronicles/fen-marwick.jpg", description: "Aelthira's steady study-partner of five years at the Academy. He counsels caution, then carries her bag to the gate when she leaves. Her tether back to Atrema." },
      { label: "Aelthira's mentor", name: "Professor Carenthal", image: "/compendium/Chronicles/professor-carenthal.jpg", description: "The long-tenured faculty member who always took Aelthira seriously, and in the end was part of the institution's refusal. He never told her she was wrong, which was the most honest thing he could do." },
      { label: "Bram's road", name: "Corvel", image: "/compendium/Chronicles/corvel.jpg", description: "The soft-voiced merchant who lends to villages at terms they can't pay and collects in forced labour. Warning Mern about him cost Bram his post." },
      { label: "Bram's road", name: "The Caravan Master", image: "/compendium/Chronicles/caravan-master.jpg", description: "The pragmatic woman who runs the Vesket-to-Morral caravan and first takes Bram on as muscle, then lets him go over the Mern affair without rancour. In his tall tales she slips into a former employer he calls Corvin." },
      { label: "Brinewatch", name: "Bram's Father", image: "/compendium/Chronicles/brams-father.jpg", description: "The dock master of Brinewatch, hard and precise and never loud, who loves through work and expectation. The home Bram hasn't gone back to." },
      { label: "Brinewatch", name: "Bram's Brother", image: "/compendium/Chronicles/brams-brother.jpg", description: "Bram's quiet, steadying brother, who gave him the worn ship-coin and stayed to keep their father's dock. The one Bram writes to and means to go back for." },
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
