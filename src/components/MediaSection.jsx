import { useState } from "react";
import VideoModal from "./VideoModal";

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

// Lore drawn from the series bible. This is the trio's world, so the cold plot
// and the characters belong here in the Chronicles (not the Compendium).
const PLACES = [
  { label: "Klomellien", name: "Klomellien", description: "A salt-rich land in the cold north of Ereb, off the Copper Sea. Fish, salt and coal come out of its working ports, and so do people who stay and get used up." },
  { label: "Poane", name: "Poane", description: "The grey northern harbour city in Klomellien where Kaelene grew up and learned to read a crowd. She got out; most don't." },
  { label: "Zorakin", name: "Zorakin", description: "A feudal kingdom on the Copper Sea and, in older song, the heartland of The Shining Way. It holds both Brinewatch on the coast and Outskirt deep in the eastern forest." },
  { label: "Brinewatch", name: "Brinewatch", description: "The whitewashed fishing village on Zorakin's coast where Bram grew up under his father the dock master, and walked out one morning rather than inherit it." },
  { label: "Berendien", name: "Berendien", description: "A realm founded after the Third Conflux, when chieftains and forest elves broke the svartfolk. Its founding myth turns on an elf-given crown, an uneasy rhyme with the thing now following Kaelene." },
  { label: "Berendien", name: "Atrema", description: "A warm-stoned university city below the Carenthi peaks, all vineyards and cypress. The Academy keeps its upper towers; Aelthira studied there six years." },
  { label: "The south", name: "Jorvaine", description: "A southern town and Aelthira's first destination, home to a reclusive scholar who published on animist boundary theory and then went silent." },
  { label: "Copper Sea", name: "Jorpagna", description: "Once the dominant empire of the Copper Sea, consumed in the Third Conflux by the fleshbiters and the horrors loosed from its own magic schools. Now a haunted ruin, and the place where Tarek fell and the Crowned One woke." },
  { label: "Bram's road", name: "Vesket, Morral, Mern & Adrath", description: "The caravan circuit Bram learned the road on: Vesket the market town, Morral the caravan city, Mern a village broken by debt-bondage, and Adrath, where his conscience cost him a post." },
  { label: "Zorakin", name: "Outskirt", description: "A small forest village in eastern Zorakin, two days east of the Grey, that the trio quietly adopt as a home base between roads." },
];

const LOCATIONS = [
  { label: "Atrema", name: "The Academy", description: "The institution in Atrema's upper towers where the magic schools are taught, and where a restricted archive hides documents older than the Academy itself. Aelthira left rather than teach a model she knew was a lie." },
  { label: "Outskirt", name: "The Grey", description: "A wide, still, mist-bound lake two days west of Outskirt that no one will fish, and no one will say why. The crossing to the Misty Island; something in the water watches and lets travellers pass." },
  { label: "The Grey", name: "The Misty Island", description: "An island that appears and vanishes in the Grey's mist, hiding a dead sorcerer's drowned hall. The site makes magic run cheap, a door left open. Adapted from the Drakar och Demoner module Dimön." },
  { label: "Outskirt", name: "Greatstead", description: "The largest farm in Outskirt: Warge and Luvia's loud, full, loving house, and their children Vagnhild and Biorn. The home none of the trio ever had, which is why they talk its children off the road." },
  { label: "Outskirt", name: "The Three Stags", description: "Outskirt's one inn, run by the old outlaws Bryte and Ulvar. The warm centre of the village, and the room Bram holds with a story." },
  { label: "Outskirt", name: "Mifalodor's Hut", description: "The hermit alchemist's hut on the slope above Outskirt, where Mifalodor brews his elixirs and warns that cheap magic is a door left open." },
  { label: "Outskirt", name: "The Stone Chapel", description: "Outskirt's small chapel of The Shining Way, the order's sunburst-and-sword cut above the altar, the mark Tarek taught Kaelene to read. Kept by the dreaming priest Rabindranath." },
  { label: "The road", name: "The Skeleton Village", description: "An unnamed ruin a day off the road, razed by a goblin raid two centuries ago and later patrolled by a necromancer's skeletons, with a Shining Way knight buried beneath its church. The trio's first road job; cleansed and left free." },
  { label: "Jorpagna", name: "The Jorpagna Tomb", description: "The ruin beneath Jorpagna that Kaelene and Tarek delved three years before the story's present, where they woke the crowned thing that took him." },
];

const ITEMS = [
  { label: "Blade", name: "The Deathbringer", description: "Cadal's pitch-black broadsword, its runes a bound summons: spoken aloud, they call living fire to serve the wielder a while, then send it home. Bram carries it out of the drowned hall, the one worked thing they take." },
  { label: "Sign", name: "The Hollow Mark", description: "The figure the sorcerer cut into the rock of the Misty Island, named for the pointed emptiness at its centre. Aelthira sees it is the same shape the Academy locked away: proof, cut in stone, that the buried thing is real." },
  { label: "Talisman", name: "Cadal's Medallion", description: "The dead champion's warding talisman, given to Bram. Magic slides off it, and it glows blue when death-magic is near. It is the reason Bram lives where Cadal did not." },
  { label: "Map", name: "The Burned Map", description: "A half-burned but genuine map of the Misty Island, sold to the trio by the unreliable Sirter for fifteen gold. He took it off a traveller who died on the west track." },
  { label: "Text", name: "The Mireth Principles", description: "A foundational magical text cited with a tell-tale 'generally', the loose thread Aelthira pulls until the whole buried lie comes with it." },
  { label: "Keepsake", name: "Bram's Ship-Coin", description: "His brother's worn coin, a ship stamped almost smooth. It is Bram's unfinished goodbye, and the anchor he carries the road on." },
  { label: "Draught", name: "The Antimagi Draught", description: "Mifalodor's flat grey warding brew that turns a person, for a while, into poor soil for a spell to take root in. Kaelene drinks it before facing the demon Akrae." },
];

// The supporting and recurring cast, beyond the three leads above.
const PEOPLE = [
  { label: "Kaelene's mentor", name: "Tarek", description: "The quiet man who saw the skill behind a starving thief and trained Kaelene in Poane. He taught her to read rooms and marks, the Shining Way's sunburst-and-sword among them. He fell in the Jorpagna tomb; whether he truly died is left open." },
  { label: "The threat", name: "The Crowned One", description: "The ancient, crowned thing woken in the Jorpagna tomb. It crosses distance without seeming to move, carries a killing cold, and took Tarek. Now it follows a thread that leads to Kaelene." },
  { label: "Bram's mentor", name: "Orvith", description: "The lean, weathered caravan guard who taught Bram his craft by showing rather than telling, and gave him his first real respect on the Morral run." },
  { label: "Aelthira's friend", name: "Fen Marwick", description: "Aelthira's steady study-partner of five years at the Academy. He counsels caution, then carries her bag to the gate when she leaves. Her tether back to Atrema." },
  { label: "Aelthira's mentor", name: "Professor Carenthal", description: "The long-tenured faculty member who always took Aelthira seriously, and in the end was part of the institution's refusal. He never told her she was wrong, which was the most honest thing he could do." },
  { label: "Bram's road", name: "Corvel", description: "The soft-voiced merchant who lends to villages at terms they can't pay and collects in forced labour. Warning Mern about him cost Bram his post." },
  { label: "Bram's road", name: "The Caravan Master", description: "The pragmatic woman who runs the Vesket-to-Morral caravan and first takes Bram on as muscle, then lets him go over the Mern affair without rancour. In his tall tales she slips into a former employer he calls Corvin." },
  { label: "Brinewatch", name: "Bram's Father", description: "The dock master of Brinewatch, hard and precise and never loud, who loves through work and expectation. The home Bram hasn't gone back to." },
  { label: "Brinewatch", name: "Bram's Brother", description: "Bram's quiet, steadying brother, who gave him the worn ship-coin and stayed to keep their father's dock. The one Bram writes to and means to go back for." },
  { label: "The Skeleton Village", name: "The Priest", description: "The ghost who haunts the road near a ruined village and begs passing travellers to cleanse the skeletons left in it. Two centuries ago he buried a nameless knight of The Shining Way beneath the church; a century later he died bringing a wall down on the necromancer who came to rob the grave. Freed at last, he thanks each of the trio by name." },
  { label: "The Skeleton Village", name: "The Nameless Knight", description: "A champion of The Shining Way who drove off a goblin raid alone two centuries ago and fell at the wall in the doing of it. The villagers buried him with honour beneath the church, his sunburst-and-sword shield and arms beside him. The trio leave every piece of it where it lies; his namelessness is the point." },
  { label: "The Skeleton Village", name: "The Necromancer", description: "The servant of death who came a century ago with twenty skeletons to strip the knight's grave. The priest killed him at the altar with a bolt of lightning and died in the same blast, but his soldier-precise skeletons still walk their patrol. He is never named." },
  { label: "Greatstead", name: "Vagnhild", description: "Warge and Luvia's grown daughter, the image of her mother in youth and one of the trio's admirers at Greatstead. She hears the turn in her brother's path sooner than he does, and turns the island gold the trio leave behind into arming his training." },
  { label: "Greatstead", name: "Biorn", description: "Warge and Luvia's sixteen-year-old son, adventure-hungry exactly as Bram once was. Bram talks him out of following to the island and into staying to guard the village, and the boy takes up the spear." },
  { label: "The Three Stags", name: "Bryte", description: "The big, fair, well-liked former outlaw who keeps the front of Outskirt's inn, and never quite explains how he and Ulvar came by it." },
  { label: "The Three Stags", name: "Ulvar", description: "The lean, hunched, sharp-eyed former outlaw who keeps the inn's books and whose fingers still itch around a rich guest's purse. Kaelene reads him for what he is in seconds, one old thief knowing another." },
  { label: "Outskirt", name: "The Three Dwarves", description: "The three soaked, shaking eyewitnesses who burst into the Three Stags with the tale no one in Outskirt will repeat: the mist parting on the Grey, an island where none had been, a tall fire-licked shape on its tower. Their terror is the spark, then they flee east and don't look back." },
  { label: "Outskirt", name: "Sirter", description: "A shabby villager with wine on his breath who sells the trio a half-burned map of the island for fifteen gold. The map is real; his story about it is not." },
  { label: "Outskirt", name: "Mifalodor", description: "The tiny, vinegar-tempered hermit alchemist above Outskirt who trades brews for goods and warns that the island makes magic cheap, and cheap magic is a door left open." },
  { label: "The Shining Way", name: "Rabindranath", description: "The old holy man who keeps Outskirt's chapel of The Shining Way and dreams true. He sends the trio off uneasy, having dreamed of a man in a torn shirt who waited a long time and was glad." },
  { label: "The Misty Island", name: "Cadal", description: "The grieving ghost in a torn mail shirt: a warrior who came to kill the sorcerer and save the woman he loved, and was killed by the demon Akrae before he reached her. He gives Bram his warding medallion and cannot rest until Akrae is dead." },
  { label: "The Misty Island", name: "Tuviol", description: "The woman Cadal loved and Prince Emrys's sister, held beneath the island and given to the sorcerer's working a century ago. The trio find her cell long cold, her tally of days cut off mid-row." },
  { label: "The Misty Island", name: "Emrys", description: "Tuviol's brother, a prince kept to be sacrificed, who scratched a last message into his cell wall begging whoever found it to tell Cadal where Tuviol was. Every line of that hope had already failed when he wrote it." },
  { label: "The Misty Island", name: "The Sorcerer", description: "The dead master of the drowned hall, who reached through the thin skin of the world for something he couldn't hold and burned for it, days before the trio set out. He left the Hollow Mark cut in the rock. The module names him Sith." },
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

function LoreGrid({ items }) {
  return (
    <div className="lore-grid">
      {items.map((item) => (
        <article key={item.name} className="lore-card">
          <span className="lore-card__label">{item.label}</span>
          <h4 className="lore-card__title">{item.name}</h4>
          <p className="lore-card__desc">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export default function MediaSection() {
  const [active, setActive] = useState(null);

  return (
    <section id="chronicles" className="media-section">
      <div className="section-header">
        <p className="section-eyebrow">THE CHRONICLES</p>
        <h2 className="section-title">The Story So Far</h2>
        <p className="section-subtitle">
          The recorded history of the Codex, from its origins to the present.
        </p>
      </div>

      <div className="chronicles-sections">
        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Chapters</h3>
          <MediaGrid items={CHAPTERS} onSelect={setActive} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Episodes</h3>
          <MediaGrid items={EPISODES} onSelect={setActive} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Characters</h3>
          <MediaGrid items={CHARACTERS} onSelect={setActive} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">People</h3>
          <LoreGrid items={PEOPLE} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Places</h3>
          <LoreGrid items={PLACES} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Locations</h3>
          <LoreGrid items={LOCATIONS} />
        </div>

        <div className="chronicles-sub">
          <h3 className="chronicles-sub__title">Items</h3>
          <LoreGrid items={ITEMS} />
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
