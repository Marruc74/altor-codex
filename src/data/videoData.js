import { eras } from "./timeline.js";

// All YouTube videos parsed from channel data
// id = YouTube video ID, title = full title, views = view count
export const rawVideos = [
  { id: "DoRWJNXqpAk", title: "Geography Samkarna: Mosgilak", views: 1416 },
  { id: "ds06t4BLezY", title: "History The Age of Empires: Krau ki", views: 1400 },
  { id: "HaLYjl6tiJI", title: "Magic: Witchcraft", views: 1266 },
  { id: "jX8pt-RTYC0", title: "Countries: Trakorien", views: 1201 },
  { id: "BvcTxNmbq_s", title: "Countries: Jorduashur", views: 1200 },
  { id: "hyuDaw-DdOo", title: "Geography: Ereb Altor", views: 1143 },
  { id: "8oeUGuiCCZE", title: "Countries: Felicien", views: 1093 },
  { id: "qDFoIXpTVqY", title: "Geography Serpent Lake: The Way Out", views: 1089 },
  { id: "WIm8eZ6Cn-U", title: "Countries: Erebos", views: 1067 },
  { id: "zcEQ6NCRJss", title: "History: Jorpagna Empire", views: 1020 },
  { id: "eRiu43jBw98", title: "Countries: Montures", views: 1006 },
  { id: "1j-5WRT3Jm0", title: "Geography The Eastern Seas: Yndar", views: 994 },
  { id: "RpP9G8LPoW4", title: "Geography Golwynda Sea: The Demon Tongue", views: 992 },
  { id: "wLvMOrmF-do", title: "Countries Akrogal: Kalmurri", views: 986 },
  { id: "DRW_sluSjFc", title: "History The Age of Armies: Efaro vs Sombatze", views: 986 },
  { id: "J_JFYRX4O-E", title: "Countries: Ransard", views: 976 },
  { id: "nSosifB-uMA", title: "Countries Soluna: Traxilme", views: 955 },
  { id: "AruWSq23ibw", title: "History The Age of Armies: Civil War", views: 938 },
  { id: "eoVRxFnDAHU", title: "Characters - Kaelene Fenholt", views: 932 },
  { id: "ZGw0DTNjLyY", title: "Geography The Eastern Seas: The Glass Sea", views: 928 },
  { id: "CMF5BhF-Iv8", title: "Geography Samkarna: Geardon's Gap", views: 894 },
  { id: "TcCuHAxIXFg", title: "Geography Serpent Lake: Nivral Isles", views: 858 },
  { id: "8F5Mb3Ammuw", title: "Characters: Bram Kestrel", views: 841 },
  { id: "8-8xTec9W7k", title: "History Yndar: The Rise", views: 840 },
  { id: "deuVtu_9UeQ", title: "Countries: Krun", views: 837 },
  { id: "VYCg3-s0mKc", title: "History The Age of Armies: End of War", views: 788 },
  { id: "StoR5ekfbio", title: "Geography Serpent Lake: Faryngia", views: 777 },
  { id: "N0741vOT4Gw", title: "Dragons: Fire Dragon", views: 768 },
  { id: "iNnx7S6ioHw", title: "Elementals: Undin", views: 765 },
  { id: "yI3mUwIbFFA", title: "History The Age of Empires: Fall of Yndar", views: 690 },
  { id: "UBmZfo00xVU", title: "History The Age of Empires: Sanithsid", views: 652 },
  { id: "cjkXAgp9J3Q", title: "Countries: Magilre", views: 634 },
  { id: "c4TlU7s_1Ww", title: "Countries Far West: Jih Pun", views: 596 },
  { id: "JoJUp6rR9vM", title: "Countries Soluna: Sombatze", views: 594 },
  { id: "AXdysyzYlmY", title: "Countries: Torsheim", views: 582 },
  { id: "N9PElcEaMhE", title: "Lesser Demons: Pazuzu", views: 547 },
  { id: "owgalEc7obg", title: "History: Grey Elves", views: 527 },
  { id: "r6Jx06ba1LY", title: "Shapeshifters: Werewolf", views: 521 },
  { id: "kk4HXgQHIqQ", title: "Geography: Golwynda Sea", views: 517 },
  { id: "rR5II1ZzIws", title: "Geography Samkarna: Dragonback", views: 505 },
  { id: "WhdOfB3csG0", title: "History Colonial Era: Krun Expanded", views: 445 },
  { id: "bxNYVfp6TQ4", title: "Dragons: Gold Dragon", views: 439 },
  { id: "qX2xnkHsZro", title: "Countries: Klomellien", views: 430 },
  { id: "DFh81Ma7rZY", title: "History The Age of Armies: Krun vs Hynsolge", views: 398 },
  { id: "3EodRTuZblQ", title: "Geography Samkarna: Maminira me Delema", views: 379 },
  { id: "7SY6JsLZ02U", title: "Religions: The Shining Way", views: 378 },
  { id: "O6i54fc3d3c", title: "Countries: Kardien", views: 331 },
  { id: "VFBIJSXuq1I", title: "Dragons: Sea Dragon", views: 303 },
  { id: "WK3S2d5KXMM", title: "Countries Soluna: Efaro", views: 297 },
  { id: "9tWidV5wg6E", title: "Fable Animals: Aries", views: 292 },
  { id: "nWd1kfojPac", title: "Countries: Berendien", views: 284 },
  { id: "2JLA1pQBmNg", title: "Elves: Injir", views: 276 },
  { id: "2vEaAf-sMgU", title: "Dragons: Lindworm", views: 273 },
  { id: "ALidc3KBcMM", title: "History Colonial Era: Furgia Invasion", views: 269 },
  { id: "cZIE9gyEBto", title: "Lesser Demons: Belmon", views: 268 },
  { id: "i-ydrEYHeCk", title: "Characters: Aelthira Moonveil", views: 258 },
  { id: "Nt8NekPK6IY", title: "History Dwarves: King Targald Hardfoot", views: 248 },
  { id: "9W_pDQB8_MQ", title: "Geography Golwynda Sea: Raas Narram", views: 246 },
  { id: "IIOkhfzlwSk", title: "Countries: Barbia", views: 246 },
  { id: "-nx3Ec_DWKw", title: "History The Age of Armies: Melukhas Fall", views: 241 },
  { id: "s1lliN47yvM", title: "Geography The Eastern Seas: Valgus Lake", views: 234 },
  { id: "FAz7-Ck6qOI", title: "Plants: Spider Vine", views: 220 },
  { id: "BivRfLT_V5w", title: "Elves: Dark Elf", views: 214 },
  { id: "tp9A9vxm9Ok", title: "Countries: Nidland", views: 211 },
  { id: "Nm-kyilBaQU", title: "Countries: Caddo", views: 207 },
  { id: "k5bUTFDdkgM", title: "Dark Folks: Mountain Orcs", views: 207 },
  { id: "s1IYs1WLkuc", title: "Fable Animals: Acid Lizard", views: 204 },
  { id: "ZFf5Vsc3WC4", title: "Dragons: Sea Serpent", views: 198 },
  { id: "BEq0sdX-y5w", title: "Countries: Hynsolge", views: 192 },
  { id: "pUr5p9d5vis", title: "Magic: Necromancy", views: 191 },
  { id: "i-a_RfbitNM", title: "Plants: Primeval Tree", views: 183 },
  { id: "YecsaEgivSM", title: "Magic: Animism", views: 183 },
  { id: "lWAHLKCD-kE", title: "Countries: Zorakin", views: 181 },
  { id: "9YaUvXHYdgY", title: "History: Wood Elves", views: 180 },
  { id: "HPIsikeVJfQ", title: "Geography Serpent Lake: Maar Lacra", views: 178 },
  { id: "W4z3MGvltl8", title: "Dragons: Dragonsnake", views: 177 },
  { id: "lERRxI7m5K8", title: "Magic: Mentalism", views: 175 },
  { id: "w5YadNPTf5s", title: "Countries: Jorpagna", views: 175 },
  { id: "UToyFHbNtZQ", title: "Countries Akrogal: Furgia", views: 175 },
  { id: "0VlNXdM3Sro", title: "Dragons: Ice Dragon", views: 171 },
  { id: "Ou-fUrwgkQY", title: "Countries Samkarna: Melukha", views: 154 },
  { id: "-Q1YkEz_TI0", title: "History The Age of Empires: Akrogal Nomads", views: 148 },
  { id: "g5-QRHjXllQ", title: "Countries Erebos: Targero", views: 145 },
  { id: "pik2483Xubg", title: "History Dwarves: Bronze Discovery", views: 144 },
  { id: "D979Ghlzybg", title: "Elementals: Salamander", views: 144 },
  { id: "tHd_GeoVJUc", title: "History The Jorpagna Empire: Grafferburg", views: 142 },
  { id: "XRYJxE4Vxpk", title: "Elementals: Umbran", views: 141 },
  { id: "rawhOhMqfLw", title: "Countries Soluna: Thelgul", views: 140 },
  { id: "Qah-qTeo2S0", title: "History Golwynda Sea: Expansion", views: 134 },
  { id: "lgl4AIXfrjk", title: "History: The fall of Jorpagna", views: 132 },
  { id: "IKr01_Ex8oc", title: "Spirits: Ghost", views: 132 },
  { id: "2ufVYb13bQ0", title: "Lore: The Polar Regions", views: 123 },
  { id: "AmBFrJTFOkQ", title: "Countries Erebos: Dakkilo", views: 118 },
  { id: "ogDV_W-G6uU", title: "Magic: Elemental", views: 116 },
  { id: "yy8h8URSVBc", title: "Elementals: Luminal", views: 112 },
  { id: "iEcXdV9oR3E", title: "Dark Folks: Cave Orcs", views: 112 },
  { id: "hbR_5advDXY", title: "Dark Folks: Ylk Orcs", views: 112 },
  { id: "OsAJPbTdMHA", title: "Dragons: Light Dragon", views: 111 },
  { id: "eFsTb-T6__U", title: "Countries Hynsolge: Fervidun", views: 109 },
  { id: "42O_p4UpbCk", title: "Geography Golwynda Sea: Habete Grelge", views: 107 },
  { id: "cQYuFXz5yQo", title: "Countries Samkarna: Morëlvidyn", views: 107 },
  { id: "pzRWYcHB5c4", title: "Dark Folks: Steppe Orcs", views: 107 },
  { id: "7umvV3x1R6g", title: "Elementals: Gnom", views: 106 },
  { id: "aDpK-eWd4NI", title: "Dragons: Chaos Dragon", views: 106 },
  { id: "BhcaUkSNLM0", title: "History: Melukha", views: 104 },
  { id: "fpaEJH6zA3g", title: "Countries: Cereval", views: 102 },
  { id: "SBXkOqDA_tg", title: "History Golwynda Sea: Palofar", views: 93 },
  { id: "ZKkrChk6mH0", title: "Lesser Demons: Uzorak", views: 93 },
  { id: "i9BHjbB47pY", title: "Countries Erebos: Tolokfe", views: 85 },
  { id: "XDz5nBxuSDU", title: "Conflicts: Ransard Prepares", views: 84 },
  { id: "lT5xEwpWsIE", title: "Geography Samkarna: Jurona", views: 84 },
  { id: "COMRmVtLiAE", title: "Conflicts: Felicien Pirate War", views: 80 },
  { id: "Susha9aI-Sg", title: "Spirits: Will o' the wisp", views: 72 },
  { id: "ePfjnqPkhwo", title: "Elementals: Glacial", views: 70 },
  { id: "gE4DWgn1b6w", title: "Fable Animals: Cockatrice", views: 62 },
  { id: "hBVMZKASM_s", title: "Countries Erebos: Beyural", views: 59 },
  { id: "tAuSXMh0ytA", title: "Elementals: Therm", views: 54 },
  { id: "c4eeUBOlIM8", title: "Fable Animals: Primeval Monster", views: 54 },
  { id: "AM1V3DJECiU", title: "Countries Hynsolge: Orkovia", views: 52 },
  { id: "5slPSfPh_Ys", title: "Plants: Strangler Vine", views: 44 },
  { id: "6AHlegQCl5Q", title: "Fable Animals: Eye Beast", views: 43 },
  { id: "sG7YUcLppx8", title: "Fable Animals: Chimera", views: 41 },
  { id: "r2j-WV-CFBA", title: "Animal Humanoids: Centaur", views: 39 },
  { id: "HP1Jp6Jw6K4", title: "White Silence", views: 34 },
  { id: "D0XlYMgq5Jo", title: "Plants: Illusion Tree", views: 31 },
  { id: "zrQP8BwudKM", title: "The Hollow Back", views: 30 },
  { id: "ZO8V69aFfUw", title: "Animal Humanoids: Ratman", views: 29 },
  { id: "YbZdnklAJD4", title: "Lesser Demons: Grazur", views: 26 },
  { id: "cBRFr_C1k14", title: "Fable Animals: Arboreal Leech", views: 24 },
  { id: "YyLbdsnYPzU", title: "Plants: Elf Eater", views: 18 },
  { id: "Q7uZkGoGRrI", title: "Fable Animals: Gorgon", views: 17 },
  { id: "mm4Zu8qI-Q0", title: "Fable Animals: Angyon", views: 17 },
  { id: "tCsg0dzduEs", title: "Countries Hynsolge: Greyburg", views: 16 },
  { id: "lNvt0ICjaEU", title: "Shapeshifters: Swan Maiden", views: 15 },
  { id: "Jm54xxVZQ9A", title: "Animal Humanoids: Mermaid", views: 13 },
  { id: "CH1NXha6QyY", title: "Fable Animals: Tunnel Worm", views: 12 },
  { id: "SB1XJU3yjdY", title: "Fable Animals: Pegasus", views: 12 },
  { id: "m93nmnWWVR8", title: "Elementals: Sylf", views: 12 },
  { id: "27U5MCmNv4M", title: "Fable Animals: Kerberos", views: 12 },
  { id: "kO2G7VMkI6s", title: "Conflicts: Nidland Purification", views: 12 },
  { id: "6LBJzNV1ELE", title: "The Altor Codex - Prologue", views: 11 },
  { id: "vCnIMwbSf54", title: "Spirits: Spectre", views: 11 },
  { id: "6nsUMlQENWE", title: "Fable Animals: Kelpie", views: 11 },
  { id: "MnihS3UpN5E", title: "Animal Humanoids: Black Duck", views: 10 },
  { id: "QASpcGWBbW8", title: "Fable Animals: Snake Sphere", views: 9 },
  { id: "FKDZSw_-OZA", title: "Elves: Cave Elf", views: 9 },
  { id: "xoSDqXzmUNo", title: "Fable Animals: Giant Amoeba", views: 9 },
  { id: "HnKQqBO3A-I", title: "Fable Animals: Roc", views: 9 },
  { id: "MLQVGlyH8O4", title: "Animal Humanoids: Wolfman", views: 9 },
  { id: "bnU_bqvF1mA", title: "Fable Animals: Siren", views: 9 },
  { id: "cQdC5sI9we0", title: "Fable Animals: Sphinx", views: 9 },
  { id: "gM8PfE7potM", title: "Dark Folks: Boggle", views: 8 },
  { id: "D8_TESKUfD8", title: "Fable Animals: Huldre", views: 8 },
  { id: "noQs3fPFHOU", title: "Fable Animals: Rust Monster", views: 8 },
  { id: "b5zJNvqF5n8", title: "The Altor Codex - Chapter 2B - The Misty Island", views: 8 },
  { id: "ehztggNUEfg", title: "Fable Animals: Manticore", views: 8 },
  { id: "uwAW1TD2hi4", title: "The Altor Codex - Backstory", views: 8 },
  { id: "qJHlsJihPzg", title: "Fable Animals: High Warden Tiger", views: 7 },
  { id: "Nn1ovh3x5p0", title: "Elves: High Elf", views: 7 },
  { id: "fyGTS21VNZ8", title: "Elves: Silver Elf", views: 7 },
  { id: "jRbz9_q84Ug", title: "Fable Animals: Flying Lizard", views: 7 },
  { id: "iTm3fYGSZvE", title: "Elves: Grey Elf", views: 7 },
  { id: "ORaycOxBk2w", title: "Fable Animals: Demon Cat", views: 7 },
  { id: "PragjLAKjTY", title: "Elves: Frost Elf", views: 6 },
  { id: "bW_6BOwwWWw", title: "Animal Humanoids: Karkion", views: 6 },
  { id: "CM6YbSJHyHE", title: "Animal Humanoids: Serpent", views: 6 },
  { id: "Rw7qXPuEb8A", title: "Fable Animals: Sand Demon", views: 6 },
  { id: "z2_WnIVtmWA", title: "Animal Humanoids: Minotaur", views: 6 },
  { id: "DF4ruhIcG9w", title: "Dark Folks: Svartalf", views: 6 },
  { id: "32Hjh6PELKg", title: "Fable Animals: Giant Spider", views: 6 },
  { id: "oQHioPvfP7E", title: "Fable Animals: Onaqui", views: 6 },
  { id: "Ga0plmKw6vY", title: "Stonekin: Dwarf", views: 6 },
  { id: "m9m510nJTAw", title: "Sylvans: Najad", views: 6 },
  { id: "I238uC9pxLQ", title: "Fable Animals: Kalydon", views: 5 },
  { id: "-6x3huqel8E", title: "The Altor Codex - Chapter 2A - The Misty Island", views: 5 },
  { id: "SkHa9w8liis", title: "The Altor Codex - Chapter 1 - The Secret of Skeleton Village", views: 5 },
  { id: "Rk7xhv-emb0", title: "Fable Animals: Murder Vulture", views: 5 },
  { id: "SYTi8E0O5ZQ", title: "Stonekin: Titan", views: 5 },
  { id: "wF72i-Fc3ts", title: "Animal Humanoids: Reptileman", views: 5 },
  { id: "2ehrufKRZ8I", title: "Fable Animals: Ambiorm", views: 5 },
  { id: "L4O9Fougqq4", title: "Fable Animals: Gargoyle", views: 5 },
  { id: "85DMkHF8u6A", title: "Elves: Light Elf", views: 5 },
  { id: "FDw6WWgfkPA", title: "Sylvans: Oread", views: 5 },
  { id: "ZyPwEK4FPRU", title: "Elves: Sea Elf", views: 5 },
  { id: "KCHzUfFU73U", title: "History The Age of Empires: Slimpaku", views: 5 },
  { id: "BMUSdN-1Ewc", title: "Dark Folks: Goblin", views: 5 },
  { id: "vmNVHOUOMDk", title: "Stonekin: Giant", views: 4 },
  { id: "Tkv20QyU7lI", title: "Animal Humanoids: Catpeople", views: 4 },
  { id: "O4xsmVhCZ5c", title: "Stonekin: Stone Biter", views: 4 },
  { id: "t-22spYxxO4", title: "Fable Animals: Death Owl", views: 4 },
  { id: "xxeflmXLP-E", title: "Elves: Blood Elf", views: 4 },
  { id: "o4giy_NXols", title: "Corporeal Undead: Death Knight", views: 4 },
  { id: "JQVKHSnCWOM", title: "Wraiths & Wights: Death Wraith", views: 4 },
  { id: "gza1ejlZsfQ", title: "Dark Folks: Cave Troll", views: 4 },
  { id: "1aZdqqZI9ZE", title: "Fable Animals: Hippogriff", views: 4 },
  { id: "MOhlOZQHq88", title: "Fable Animals: Unicorn", views: 4 },
  { id: "wyPrX5LWKY8", title: "Sylvans: Fire Pixie", views: 4 },
  { id: "StM9yaPoFfA", title: "Dark Folks: Orc", views: 4 },
  { id: "xbuIdo0QHoE", title: "Wraiths & Wights: Dark Wraith", views: 4 },
  { id: "DZLBbbxDuAQ", title: "Stonekin: Gargant", views: 4 },
  { id: "42MuMU6zpNQ", title: "Dark Folks: Forest Troll", views: 3 },
  { id: "3Is6_Adlhts", title: "Magical Undead: Nightwolf", views: 3 },
  { id: "OBu-CcTxJjI", title: "Corporeal Undead: Severed Head", views: 3 },
  { id: "MTeQSBnM3ns", title: "Magical Undead: Skeleton", views: 3 },
  { id: "E5SXyZrGG3o", title: "Magical Undead: Mummy", views: 3 },
  { id: "bLQpSuqIYuo", title: "Stonekin: Troglodyte", views: 3 },
  { id: "dBSUFzoY_r4", title: "Corporeal Undead: Corpse Eaters", views: 3 },
  { id: "8aLVRZ3xieE", title: "Demonic Creatures: Cold Beast", views: 3 },
  { id: "0et3Dqh6H68", title: "Fable Animals: Grey Mareskunk", views: 3 },
  { id: "I0MVrJhFtPk", title: "Fable Animals: Phoenix", views: 3 },
  { id: "WexEvdurnSA", title: "Fable Animals: Harpy", views: 3 },
  { id: "HP75__d4_NI", title: "Magical Undead: Zombie", views: 3 },
  { id: "sodDoo3LugI", title: "Fable Animals: Basilisk", views: 3 },
  { id: "kkbUpwo5GwY", title: "Fable Animals: Hydra", views: 3 },
  { id: "xvL1YwV_sGk", title: "Fable Animals: Griffin", views: 3 },
  { id: "BAUZVfWuYRk", title: "Wraiths & Wights: Phantom", views: 3 },
  { id: "ysmU5pD_ZzM", title: "Dark Folks: Ogre", views: 3 },
  { id: "bkRNOOpK6KA", title: "Demonic Creatures: Black Unicorn", views: 3 },
  { id: "X3lCwFVHSIA", title: "Corporeal Undead: Hell Steed", views: 2 },
  { id: "oyCnsAC5lag", title: "Demonic Creatures: Black Avenger", views: 2 },
  { id: "G3T6f7JI9DU", title: "Sylvans: Satyr", views: 2 },
  { id: "cjGfbtcPYpU", title: "Sylvans: Hag", views: 2 },
  { id: "cVrGWmE5MZE", title: "Demonic Creatures: Vampire Butterfly", views: 2 },
  { id: "DgR1qzxBklM", title: "Magical Undead: Living Dead", views: 2 },
  { id: "mD0O4y158nI", title: "Sylvans: Dryad", views: 2 },
  { id: "ZtrSHqoJwh0", title: "Sylvans: Faerie", views: 2 },
  { id: "PRrKhpnIdFg", title: "Dark Folks: Boggart", views: 2 },
  { id: "za-ZR10tS0k", title: "Corporeal Undead: Deadmans Hand", views: 2 },
  { id: "oIfZEktDif4", title: "Magical Undead: Baneman", views: 2 },
  { id: "MHBR0okQCso", title: "Sylvans: Peerie", views: 2 },
  { id: "O1fY__gjLX4", title: "Stonekin: Cyclop", views: 2 },
  { id: "T0KF37hwAYM", title: "Wraiths & Wights: Barrow Wight", views: 1 },
  { id: "lhEAWjCEZjQ", title: "Corporeal Undead: Mara", views: 1 },
  { id: "MRa9ERgbzZw", title: "Corporeal Undead: Vampire", views: 1 },
  { id: "l4Qhd8TmyzU", title: "Sylvans: Hob", views: 1 },
  // Newer shorts (Mar–Apr 2026 uploads). View counts are from the latest
  // reporting period; titles normalized to the existing "Category Group: Name" scheme.
  { id: "ZekDwW6f-D4", title: "Factions: Deathdancers", views: 6 },
  { id: "-6xRYHUI71Q", title: "Religions: Inashtar", views: 4 },
  { id: "Y8bObKzyMJA", title: "Factions: Treeshapers", views: 4 },
  { id: "L9GOPwtFap8", title: "Factions: Lunorgh Kah", views: 3 },
  { id: "DtWxUp5GMEk", title: "Factions: Brothers of Darkness", views: 3 },
  { id: "SPxoPRwTtDY", title: "Elves: Cities beneath ground", views: 2 },
  { id: "QA00fO4mqNU", title: "Elves: Floating Islands", views: 2 },
  { id: "pf3G1J3vqWI", title: "Elves: White Towers", views: 2 },
  { id: "qmsuI9xPeJ8", title: "Countries: Mereld", views: 2 },
  { id: "6JVP0Wpgd20", title: "Elves: Fortress", views: 2 },
  { id: "eBEsZSzhUXA", title: "Religions: Shamash", views: 2 },
  { id: "CiDrS5KhZdU", title: "Religions: Church of Sbintor", views: 1 },
  { id: "Iv8lu99cndA", title: "Factions: Urgh Grobb", views: 1 },
  { id: "2zu0EkzUrwE", title: "Factions: Mistali", views: 1 },
  { id: "qtpWTQSOoJA", title: "Factions: Deathbringers", views: 1 },
  { id: "eQMv0UtUvkc", title: "Factions: Ylkor kha oggra", views: 1 },
  { id: "VvN2fABOSic", title: "Factions: Rulgh Borgnag", views: 1 },
  { id: "unoYZDN9oDI", title: "Countries Trakorien: Palamux", views: 1 },
  { id: "EwOASKSHPAQ", title: "Religions: Kashim", views: 1 },
  { id: "bjfL1Q3Zx9o", title: "Religions: Imária", views: 1 },
  { id: "YtbKtxdAXaw", title: "Religions: Wegil", views: 0 },
  { id: "KTYDdEp1TVU", title: "Dark Folks: Raukk", views: 0 },
  { id: "fHpDb9q-cHs", title: "Countries Montures: Mokylider", views: 0 },
  { id: "XQz7E5amhRo", title: "Countries Montures: Gideon Canyon", views: 0 },
  { id: "5Hn5hYjbgRM", title: "Factions: Gylk Lobbnack", views: 0 },
  { id: "c8YUGN3a584", title: "Factions: Grogol Gribb", views: 0 },
  { id: "fxbalheg_7s", title: "Factions: RhobdoRana", views: 0 },
  { id: "TC-mYynQyhI", title: "Factions: Dekkadorel Gnubbt", views: 0 },
  { id: "Kh10kmtfGqg", title: "Region: Goiana", views: 0 },
  { id: "-KFjJMOgv8A", title: "Countries Trakorien: Saphyna", views: 0 },
  { id: "objR6mJ86IU", title: "Factions: Kallakadak Yldrokk", views: 0 },
  { id: "pg3WrOPPGTA", title: "Countries Zorakin: Pendon", views: 0 },
];

// Category → section mapping
const SECTION_MAP = {
  History:            "history",
  Geography:          "geography",
  Countries:          "countries",
  Magic:              "magic",
  Animals:            "creatures",
  Dragons:            "creatures",
  "Fable Animals":    "creatures",
  Elementals:         "creatures",
  Spirits:            "creatures",
  "Lesser Demons":    "creatures",
  Shapeshifters:      "creatures",
  Plants:             "creatures",
  "Corporeal Undead": "creatures",
  "Magical Undead":   "creatures",
  "Wraiths & Wights": "creatures",
  "Demonic Creatures":"creatures",
  Elves:              "peoples",
  "Animal Humanoids": "peoples",
  "Animals Humanoids":"peoples",
  Stonekin:           "peoples",
  Sylvans:            "peoples",
  "Dark Folks":       "peoples",
  Conflicts:          "conflicts",
  Characters:         "characters",
  Religions:          "lore",
  Lore:               "lore",
  Factions:           "lore",
  Region:             "geography",
};

// For these sections the matched category key itself IS the group label
// e.g. "Dragons", "Fable Animals", "Elves" — not a sub-prefix
const CATEGORY_IS_GROUP = new Set(["creatures", "peoples", "characters", "magic", "lore"]);

// Parse a raw title → { section, group, name }
function parse(title) {
  if (title.startsWith("The Altor Codex") || title === "White Silence" || title === "The Hollow Back") {
    const name = title.replace(/^The Altor Codex\s*-?\s*/, "").trim() || title;
    return { section: "episodes", group: null, name: name || title };
  }

  const colonIdx = title.indexOf(":");
  const dashIdx  = title.indexOf(" - ");

  let prefix, name;
  if (colonIdx !== -1) {
    prefix = title.substring(0, colonIdx).trim();
    name   = title.substring(colonIdx + 1).trim();
  } else if (dashIdx !== -1) {
    prefix = title.substring(0, dashIdx).trim();
    name   = title.substring(dashIdx + 3).trim();
  } else {
    return { section: "lore", group: null, name: title };
  }

  const parts        = prefix.split(" ");
  const baseCategory = parts[0];
  const subPrefix    = parts.length > 1 ? parts.slice(1).join(" ") : null;

  let matchedKey = null;
  let section    = null;
  for (const [key, val] of Object.entries(SECTION_MAP)) {
    if (prefix === key || prefix.startsWith(key + " ")) {
      matchedKey = key; section = val; break;
    }
    if (baseCategory === key) {
      matchedKey = key; section = val; break;
    }
  }

  // For creatures/peoples the category key is the group; for history/geography/countries
  // the sub-prefix is the group (e.g. "The Age of Armies", "Samkarna")
  const group = CATEGORY_IS_GROUP.has(section) ? matchedKey : subPrefix;

  return { section: section ?? "lore", group: group ?? null, name };
}

// Explicit group overrides for otherwise-ungrouped geography entries
const GROUP_OVERRIDES = {
  "hyuDaw-DdOo": "Ereb",         // Geography: Ereb Altor
  "kk4HXgQHIqQ": "Golwynda Sea", // Geography: Golwynda Sea
  "2ufVYb13bQ0": "Cosmology",    // Lore: The Polar Regions → grouped with the cosmology pages
  // Magic schools → the "Schools" sub-section (otherwise they parse to the
  // redundant "Magic" group). Their .md lives under Magic/Schools/.
  "HaLYjl6tiJI": "Schools",      // Magic: Witchcraft
  "pUr5p9d5vis": "Schools",      // Magic: Necromancy
  "YecsaEgivSM": "Schools",      // Magic: Animism
  "lERRxI7m5K8": "Schools",      // Magic: Mentalism
  "ogDV_W-G6uU": "Schools",      // Magic: Elemental
};

// Build the enriched video list
export const videos = rawVideos.map((v) => {
  const parsed = parse(v.title);
  if (GROUP_OVERRIDES[v.id]) parsed.group = GROUP_OVERRIDES[v.id];
  return { ...v, ...parsed };
});

// IDs already shown in the Chronicles section — exclude from Compendium
const CHRONICLE_IDS = new Set(["6LBJzNV1ELE", "uwAW1TD2hi4", "SkHa9w8liis", "-6x3huqel8E", "b5zJNvqF5n8"]);

// Videos surfaced only as "Related Videos" on another entry's page (e.g. an elf
// sub-topic on the Cave Elf page). They stay in `videos` (resolvable by id for
// those links) but are hidden from the standalone Compendium nav — no own page.
export const CONNECTED_ONLY_IDS = new Set([
  "SPxoPRwTtDY", // Cities beneath ground → Cave Elf
  "QA00fO4mqNU", // Floating Islands     → Grey Elf
  "pf3G1J3vqWI", // White Towers         → High Elf
  "6JVP0Wpgd20", // Fortress             → Dark Elf
]);

// Build { sectionId → [ { group: string|null, videos[] }, ... ] }
// Ungrouped entries (group===null) come first, then named groups sorted alphabetically
const _bySection = videos
  .filter((v) => !CHRONICLE_IDS.has(v.id) && !CONNECTED_ONLY_IDS.has(v.id))
  .reduce((acc, v) => {
  if (!acc[v.section]) acc[v.section] = {};
  const key = v.group ?? "__none__";
  (acc[v.section][key] = acc[v.section][key] || []).push(v);
  return acc;
}, {});

const _historyById = Object.fromEntries(
  videos
    .filter((v) => v.section === "history" && !CHRONICLE_IDS.has(v.id))
    .map((v) => [v.id, v])
);

const _historyByTimeline = eras
  .map((era) => ({
    group: era.label,
    videos: era.videoIds.map((id) => _historyById[id]).filter(Boolean),
  }))
  .filter((g) => g.videos.length > 0);

export const videosBySection = Object.fromEntries(
  Object.entries(_bySection).map(([sec, map]) => {
    if (sec === "history") return [sec, _historyByTimeline];
    const ungrouped = (map["__none__"] || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    const named = Object.entries(map)
      .filter(([k]) => k !== "__none__")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, videos]) => ({
        group,
        videos: videos.slice().sort((a, b) => a.name.localeCompare(b.name)),
      }));
    return [sec, [
      ...(ungrouped.length ? [{ group: null, videos: ungrouped }] : []),
      ...named,
    ]];
  })
);

// Markdown-only peoples: humanoid races from the Monster Book that have no
// chronicle video. They surface in the Peoples nav and load their own .md via
// the entry path; EntryDetail hides the "Watch" button when an entry has noVideo.
const EXTRA_PEOPLES = [
  { group: "Animal Humanoids", name: "Brown Duck" },
  { group: "Animal Humanoids", name: "Shark-Man" },
  { group: "Animal Humanoids", name: "White Duck" },
  { group: "Animal Humanoids", name: "Hengeyokai" },
  { group: "Animal Humanoids", name: "Kojin" },
  { group: "Dark Folks", name: "Shikome" },
  { group: "Elves", name: "Wood Elf" },
  { group: "Elves", name: "Water Elf" },
  { group: "Elves", name: "Elves" },
  { group: "Humans", name: "Pamperna" },
  { group: "Humans", name: "Jih-mono" },
  { group: "Humans", name: "Ainu" },
  { group: "Humans", name: "Hedemi" },
  { group: "Other Humanoids", name: "Dyler" },
  { group: "Other Humanoids", name: "Half-elf" },
  { group: "Other Humanoids", name: "Half-orc" },
  { group: "Other Humanoids", name: "Halfling" },
  { group: "Other Humanoids", name: "Highman" },
  { group: "Other Humanoids", name: "Lindskiarn" },
  { group: "Other Humanoids", name: "Magir" },
  { group: "Other Humanoids", name: "Raggman" },
  { group: "Other Humanoids", name: "Sharg" },
  { group: "Other Humanoids", name: "Wolf-Rider" },
  { group: "Other Humanoids", name: "Woodman" },
  { group: "Other Humanoids", name: "Alegar" },
  { group: "Beasts", name: "Talking Animals" },
  { group: "Dark Folks", name: "Troll" },
  { group: "Dark Folks", name: "Olog-hai" },
  { group: "Sylvans", name: "Gnome" },
].map((p, i) => ({
  id: `x-people-${i}`,
  title: `Peoples ${p.group}: ${p.name}`,
  section: "peoples",
  group: p.group,
  name: p.name,
  noVideo: true,
}));

{
  const sec = videosBySection.peoples ?? (videosBySection.peoples = []);
  for (const entry of EXTRA_PEOPLES) {
    let grp = sec.find((g) => g.group === entry.group);
    if (!grp) {
      grp = { group: entry.group, videos: [] };
      sec.push(grp);
    }
    grp.videos.push(entry);
  }
  // Ungrouped first, then groups alphabetically; entries within a group by name.
  sec.sort((a, b) =>
    a.group === null ? -1 : b.group === null ? 1 : a.group.localeCompare(b.group)
  );
  for (const g of sec) g.videos.sort((a, b) => a.name.localeCompare(b.name));
}

// Markdown-only creatures from Monster Book III (Chaos) that have no chronicle
// video. Same treatment as the extra peoples: they surface in the Creatures nav
// and load their own .md, with the "Watch" button hidden by EntryDetail.
const EXTRA_CREATURES = [
  { group: "Animals", name: "Gorilla" },
  { group: "Animals", name: "Yeti" },
  { group: "Animals", name: "Polar Bear" },
  { group: "Fable Animals", name: "Tarantellid" },
  { group: "Plants", name: "Mushroom-Man" },
  { group: "Dragons", name: "Dragon" },
  { group: "Corporeal Undead", name: "Revenant" },
  { group: "Fable Animals", name: "Megas" },
  { group: "Spirits", name: "Poltergeist" },
  { group: "Demonic Creatures", name: "Death Cherub" },
  { group: "Demonic Creatures", name: "Death Angel" },
  { group: "Demonic Creatures", name: "Servant" },
  { group: "Demons", name: "Greater Demon" },
  { group: "Demons", name: "Demon Noble" },
  { group: "Demons", name: "Demon Prince" },
  { group: "Demons", name: "Urbaug the Insane" },
  { group: "Demons", name: "Echram Schroedel" },
  { group: "Chaos Warriors", name: "Chaos Cardinal" },
  { group: "Chaos Warriors", name: "Chaos Knight" },
  { group: "Chaos Warriors", name: "Chaos Corporal" },
  { group: "Chaos Warriors", name: "Slayer" },
  { group: "Chaos Warriors", name: "Ravager" },
  { group: "Elemental Creatures", name: "Shadow Beast" },
  { group: "Elemental Creatures", name: "Fire Horse" },
  { group: "Elemental Creatures", name: "Light Bird" },
  { group: "Elemental Creatures", name: "Earth Beetle" },
  { group: "Elemental Creatures", name: "Frost Wolf" },
  { group: "Elemental Creatures", name: "Djinn" },
  { group: "Elemental Creatures", name: "Water Wave" },
  { group: "Elemental Creatures", name: "Vulkanti" },
  { group: "Elemental Lords", name: "Cyclone" },
  { group: "Elemental Lords", name: "Magmani" },
  { group: "Elemental Lords", name: "Matter Queen" },
  { group: "Elemental Lords", name: "Sea King" },
  { group: "Elemental Lords", name: "Black Sultan" },
  { group: "Elemental Lords", name: "White Pasha" },
  { group: "Elemental Lords", name: "Ice Lord" },
  { group: "Elemental Lords", name: "Desert Lord" },
  { group: "Magical Creatures", name: "Golem" },
  { group: "Magical Creatures", name: "Guludur Abomination" },
  { group: "Magical Creatures", name: "Guardian" },
  { group: "Magical Creatures", name: "Dragon Warrior" },
  { group: "Magical Creatures", name: "Warden" },
  { group: "Magical Undead", name: "Imariot" },
  { group: "Fable Animals", name: "Drinnen" },
  { group: "Fable Animals", name: "Forgyor" },
  { group: "Fable Animals", name: "Ghertûm" },
  { group: "Fable Animals", name: "Brook Bear" },
  { group: "Fable Animals", name: "Elefantine" },
  { group: "Fable Animals", name: "Elephant Bird" },
  { group: "Fable Animals", name: "Harebir" },
  { group: "Fable Animals", name: "Giant Octopus" },
  { group: "Fable Animals", name: "Insectoid" },
  { group: "Fable Animals", name: "Rock Lizard" },
  { group: "Fable Animals", name: "Shranck" },
  { group: "Fable Animals", name: "Silver Shark" },
  { group: "Fable Animals", name: "Ziplodit" },
  { group: "Fable Animals", name: "Dwarf Horse" },
  { group: "Plants", name: "Tree Master" },
  { group: "Plants", name: "Nargur Giant Oak" },
  { group: "Shapeshifters", name: "Shapeshifter" },
  { group: "Demons of Demonicum", name: "Azoth" },
  { group: "Demons of Demonicum", name: "Karnack" },
  { group: "Demons of Demonicum", name: "Nerocq" },
  { group: "Demons of Demonicum", name: "Darubah" },
  { group: "Demons of Demonicum", name: "Feot" },
  { group: "Demons of Demonicum", name: "Khurún" },
  { group: "Demons of Demonicum", name: "Fire Demon" },
  { group: "Demons of Demonicum", name: "Ice Demon" },
  { group: "Demons of Demonicum", name: "Knowledge Demon" },
  { group: "Heralds of the Apocalypse", name: "Stilakor" },
  { group: "Heralds of the Apocalypse", name: "Evolakasa" },
  { group: "Heralds of the Apocalypse", name: "Aryxamast" },
  { group: "Heralds of the Apocalypse", name: "Kalembri" },
  { group: "Jih-Pun", name: "Tatsu" },
  { group: "Jih-Pun", name: "Kappa" },
  { group: "Jih-Pun", name: "Rokurokubi" },
  { group: "Jih-Pun", name: "Shutendoji" },
  { group: "Jih-Pun", name: "Kumo" },
  { group: "Jih-Pun", name: "Uba" },
  { group: "Jih-Pun", name: "Orochi" },
  { group: "Jih-Pun", name: "Gaki" },
  { group: "Jih-Pun", name: "Mi" },
  { group: "Jih-Pun", name: "Mukade" },
  { group: "Jih-Pun", name: "Nymph" },
  { group: "Jih-Pun", name: "Shishi" },
  { group: "Jih-Pun", name: "Shura" },
  { group: "Jih-Pun", name: "Tako" },
  { group: "Jih-Pun", name: "Oni" },
].map((p, i) => ({
  id: `x-creature-${i}`,
  title: `Creatures ${p.group}: ${p.name}`,
  section: "creatures",
  group: p.group,
  name: p.name,
  noVideo: true,
}));

{
  const sec = videosBySection.creatures ?? (videosBySection.creatures = []);
  for (const entry of EXTRA_CREATURES) {
    let grp = sec.find((g) => g.group === entry.group);
    if (!grp) {
      grp = { group: entry.group, videos: [] };
      sec.push(grp);
    }
    grp.videos.push(entry);
  }
  sec.sort((a, b) =>
    a.group === null ? -1 : b.group === null ? 1 : a.group.localeCompare(b.group)
  );
  for (const g of sec) g.videos.sort((a, b) => a.name.localeCompare(b.name));
}

// Markdown-only Lore pages from the Campaign Book: the cosmology topics are
// grouped under "Cosmology" (alongside The Polar Regions); the world-reference
// topics are ungrouped. They surface in the Lore nav and load their own .md via
// the entry path, with the "Watch" button hidden by EntryDetail.
const EXTRA_LORE = [
  { group: "Cosmology", name: "The World of Altor" },
  { group: "Cosmology", name: "The Gods" },
  { group: "Cosmology", name: "The Heavenly Bodies" },
  { group: "Cosmology", name: "Constellations" },
  { group: "Cosmology", name: "Tiamat" },
  { group: "Cosmology", name: "The Rainbow" },
  { group: "Cosmology", name: "The Exalted" },
  { group: "Factions", name: "Burned Earth Clan" },
  { group: "Factions", name: "Grokashak Oggra" },
  { group: "Factions", name: "Kharynos" },
  { group: "Factions", name: "Sybiall" },
  { group: "Factions", name: "The Blood-spattered Feather" },
  { group: "Factions", name: "Ordo Magica" },
  { group: "Factions", name: "Ordo Nova" },
  { group: "Factions", name: "House Festglade" },
  { group: "Factions", name: "The Brotherhood of the Eternally Shining Star" },
  { group: "Factions", name: "The Brotherhood of the Red Fish" },
  { group: "Religions", name: "The Oktagon" },
  { group: "Religions", name: "Kabrinzi" },
  { group: "Religions", name: "Sbintor" },
  { group: "Religions", name: "Mokylider" },
  { group: "Religions", name: "Eledain" },
  { group: "Religions", name: "Slergolis" },
  { group: "Religions", name: "Kastyke" },
  { group: "Religions", name: "Trocuspa" },
  { group: "Religions", name: "Remuntra" },
  { group: "Religions", name: "Enki" },
  { group: "Religions", name: "Anxalis" },
  { group: "Religions", name: "Marduk" },
  { group: "Religions", name: "Luvena" },
  { group: "Religions", name: "Ereshkigal" },
  { group: "Religions", name: "Valliman and Drigel" },
  { group: "Religions", name: "Tigwalvan" },
  { group: "Magical Phenomena", name: "The Black Water" },
  { group: "Magical Phenomena", name: "Meh-Zadria's Pillar" },
  { group: "Magical Phenomena", name: "The Devil's Palace" },
  { group: "Magical Phenomena", name: "The Bane Storm" },
  { group: "Magical Phenomena", name: "The City of Angels" },
  { group: "Magical Phenomena", name: "Ley Lines and Magic-Dead Lands" },
  { group: "Magical Phenomena", name: "Magic Nodes and Storms" },
  { group: "Magical Phenomena", name: "Khab-Hemi" },
  { group: "The Multiverse", name: "The Multiverse" },
  { group: "The Multiverse", name: "The Grey Halls" },
  { group: "The Multiverse", name: "Demonicum" },
  { group: "The Multiverse", name: "Inferno" },
  { group: "The Multiverse", name: "Dimension Travel" },
  { group: "The Multiverse", name: "Nehcrom" },
  { group: "The Multiverse", name: "Bemoth" },
  { group: "The Multiverse", name: "Caliban" },
  { group: null, name: "Climate" },
  { group: null, name: "The Calendar" },
  { group: null, name: "Trade" },
  { group: null, name: "Coins and Measures" },
  { group: null, name: "Craft Guilds" },
  { group: null, name: "Dwarven Architecture" },
  { group: null, name: "Drinks of Ereb" },
  { group: null, name: "Herbs of Jih-pun" },
  { group: null, name: "The Ways of Magicians" },
  { group: null, name: "Divination" },
  { group: null, name: "The Catacombs of Nohstril" },
  { group: null, name: "The Dragon-Masters" },
  { group: null, name: "Languages" },
  { group: null, name: "Weapon Academies" },
  { group: null, name: "The Underworld Guilds" },
  { group: null, name: "Crime and Punishment" },
  { group: null, name: "Heroes" },
  { group: null, name: "The Aspects of Magic" },
  { group: null, name: "Magical Symbols" },
  { group: null, name: "The Shaul Deck" },
  { group: null, name: "Familiars" },
  { group: null, name: "Galvorn" },
  { group: null, name: "Metals" },
].map((p, i) => ({
  id: `x-lore-${i}`,
  title: `Lore${p.group ? " " + p.group : ""}: ${p.name}`,
  section: "lore",
  group: p.group,
  name: p.name,
  noVideo: true,
}));

{
  const sec = videosBySection.lore ?? (videosBySection.lore = []);
  for (const entry of EXTRA_LORE) {
    let grp = sec.find((g) => g.group === entry.group);
    if (!grp) { grp = { group: entry.group, videos: [] }; sec.push(grp); }
    grp.videos.push(entry);
  }
  sec.sort((a, b) =>
    a.group === null ? -1 : b.group === null ? 1 : a.group.localeCompare(b.group)
  );
  for (const g of sec) g.videos.sort((a, b) => a.name.localeCompare(b.name));
}

// Markdown-only Magic page from the Campaign Book.
const EXTRA_MAGIC = [
  { group: "Schools", name: "Dark Magic" },
  { group: "Schools", name: "Demonology" },
  { group: "Schools", name: "Alchemy" },
  { group: "Schools", name: "Harmonism" },
  { group: "Schools", name: "Illusionism" },
  { group: "Schools", name: "Spiritism" },
  { group: "Schools", name: "Staff Magic" },
  { group: "Schools", name: "Symbolism" },
  { group: "Schools", name: "Voice Magic" },
  { group: "Schools", name: "Dragon Magic" },
  { group: "Items", name: "Demonic Artifacts" },
  { group: "Items", name: "Notable Magic Items" },
  { group: "Items", name: "Soul-Bound Weapons" },
  { group: "Items", name: "The White Staff" },
  { group: "Items", name: "The Demon Sledge" },
  { group: "Items", name: "The Queen of the Sea" },
  { group: "Items", name: "The Hynsolge Weapons" },
  { group: "Items", name: "The Crown Jewels" },
  { group: "Items", name: "Neverind's Magic Sack" },
  { group: "Items", name: "Qhriz" },
  { group: "Items", name: "The Kabrinzi Artifacts" },
  { group: "Items", name: "The Staff of Mokylider" },
  { group: "Items", name: "The Hammer of Eshwan Theard" },
].map((p, i) => ({
  id: `x-magic-${i}`,
  title: `Magic: ${p.name}`,
  section: "magic",
  group: p.group,
  name: p.name,
  noVideo: true,
}));

{
  const sec = videosBySection.magic ?? (videosBySection.magic = []);
  for (const entry of EXTRA_MAGIC) {
    let grp = sec.find((g) => g.group === entry.group);
    if (!grp) { grp = { group: entry.group, videos: [] }; sec.push(grp); }
    grp.videos.push(entry);
  }
  for (const g of sec) g.videos.sort((a, b) => a.name.localeCompare(b.name));
}

// Markdown-only Characters with no chronicle video (e.g. notable NPCs drawn
// from the source material). Same treatment as the other EXTRA pages: they
// surface in the Characters nav and load their own .md, with the "Watch"
// button hidden by EntryDetail.
const EXTRA_CHARACTERS = [
  { group: null, name: "Baron Piet Steeljaw" },
  { group: null, name: "Houd Istimam" },
  { group: null, name: "The Man on the Mountain" },
  { group: null, name: "Serek the Dark" },
  { group: null, name: "Tamanrasset" },
  { group: null, name: "Tara" },
  { group: null, name: "The Three Wolves" },
  { group: null, name: "Karaleia" },
  { group: null, name: "The Hunter" },
  { group: null, name: "Arn Dunkelbrink" },
  { group: null, name: "Kenvadsin Lao'Geraftjan" },
  { group: null, name: "Naurudun" },
  { group: null, name: "Ozuno" },
  { group: null, name: "Sebastian Marol" },
  { group: null, name: "Gadirm" },
].map((p, i) => ({
  id: `x-character-${i}`,
  title: `Characters: ${p.name}`,
  section: "characters",
  group: p.group,
  name: p.name,
  noVideo: true,
}));

{
  const sec = videosBySection.characters ?? (videosBySection.characters = []);
  for (const entry of EXTRA_CHARACTERS) {
    let grp = sec.find((g) => g.group === entry.group);
    if (!grp) { grp = { group: entry.group, videos: [] }; sec.push(grp); }
    grp.videos.push(entry);
  }
  sec.sort((a, b) =>
    a.group === null ? -1 : b.group === null ? 1 : a.group.localeCompare(b.group)
  );
  for (const g of sec) g.videos.sort((a, b) => a.name.localeCompare(b.name));
}

// Markdown-only Geography pages with no chronicle video and no fixed map pin
// (e.g. Caranor, the silver elves' drifting flying island). Grouped by
// continent so they surface under it in the Geography nav, the same way the
// other EXTRA pages do, with the "Watch" button hidden by EntryDetail.
const EXTRA_GEO = [
  { group: "Ereb", name: "Caranor" },
].map((p, i) => ({
  id: `x-geo-${i}`,
  title: `Geography ${p.group}: ${p.name}`,
  section: "geography",
  group: p.group,
  name: p.name,
  noVideo: true,
}));

{
  const sec = videosBySection.geography ?? (videosBySection.geography = []);
  for (const entry of EXTRA_GEO) {
    let grp = sec.find((g) => g.group === entry.group);
    if (!grp) { grp = { group: entry.group, videos: [] }; sec.push(grp); }
    grp.videos.push(entry);
  }
  sec.sort((a, b) =>
    a.group === null ? -1 : b.group === null ? 1 : a.group.localeCompare(b.group)
  );
  for (const g of sec) g.videos.sort((a, b) => a.name.localeCompare(b.name));
}

// Flat list of every entry shown in the compendium (real videos + the
// markdown-only EXTRA pages), used by the global search index and the
// cross-reference resolver so the noVideo pages are reachable too.
export const allEntries = Object.values(videosBySection)
  .flat()
  .flatMap((g) => g.videos);

export const SECTIONS = [
  { id: "characters", label: "Characters", sigil: "◇" },
  { id: "conflicts",  label: "Conflicts",  sigil: "⚡" },
  { id: "countries",  label: "Countries",  sigil: "⬡" },
  { id: "creatures",  label: "Creatures",  sigil: "⊕" },
  { id: "episodes",   label: "Episodes",   sigil: "▶" },
  { id: "geography",  label: "Geography",  sigil: "◈" },
  { id: "history",    label: "History",    sigil: "⚔" },
  { id: "lore",       label: "Lore",       sigil: "⌘" },
  { id: "magic",      label: "Magic",      sigil: "✦" },
  { id: "peoples",    label: "Peoples",    sigil: "◉" },
];
