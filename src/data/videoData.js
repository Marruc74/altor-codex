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
  { id: "eoVRxFnDAHU", title: "Character - Kaelene Fenholt", views: 932 },
  { id: "ZGw0DTNjLyY", title: "Geography The Eastern Seas: The Glass Sea", views: 928 },
  { id: "CMF5BhF-Iv8", title: "Geography Samkarna: Geardon's Gap", views: 894 },
  { id: "TcCuHAxIXFg", title: "Geography Serpent Lake: Nivral Isles", views: 858 },
  { id: "8F5Mb3Ammuw", title: "Character: Bram Kestrel", views: 841 },
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
  { id: "N9PElcEaMhE", title: "Lesser Demon: Pazuzu", views: 547 },
  { id: "owgalEc7obg", title: "History: Grey Elves", views: 527 },
  { id: "r6Jx06ba1LY", title: "Shapeshifters: Werewolf", views: 521 },
  { id: "kk4HXgQHIqQ", title: "Geography: Golwynda Sea", views: 517 },
  { id: "rR5II1ZzIws", title: "Geography Samkarna: Dragonback", views: 505 },
  { id: "WhdOfB3csG0", title: "History Colonial Era: Krun Expanded", views: 445 },
  { id: "bxNYVfp6TQ4", title: "Dragons: Gold Dragon", views: 439 },
  { id: "qX2xnkHsZro", title: "Countries: Klomellien", views: 430 },
  { id: "DFh81Ma7rZY", title: "History The Age of Armies: Krun vs Hynsolge", views: 398 },
  { id: "3EodRTuZblQ", title: "Geography Samkarna: Maminira me Delema", views: 379 },
  { id: "7SY6JsLZ02U", title: "Religion: The Shining Way", views: 378 },
  { id: "O6i54fc3d3c", title: "Countries: Kardien", views: 331 },
  { id: "VFBIJSXuq1I", title: "Dragons: Sea Dragon", views: 303 },
  { id: "WK3S2d5KXMM", title: "Countries Soluna: Efaro", views: 297 },
  { id: "9tWidV5wg6E", title: "Fable Animals: Aries", views: 292 },
  { id: "nWd1kfojPac", title: "Countries: Berendien", views: 284 },
  { id: "2JLA1pQBmNg", title: "Elves: Injir", views: 276 },
  { id: "2vEaAf-sMgU", title: "Dragons: Lindworm", views: 273 },
  { id: "ALidc3KBcMM", title: "History Colonial Era: Furgia Invasion", views: 269 },
  { id: "cZIE9gyEBto", title: "Lesser Demon: Belmon", views: 268 },
  { id: "i-ydrEYHeCk", title: "Character: Aelthira Moonveil", views: 258 },
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
  { id: "ZKkrChk6mH0", title: "Lesser Demon: Uzorak", views: 93 },
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
  { id: "YbZdnklAJD4", title: "Lesser Demon: Grazur", views: 26 },
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
  { id: "m9m510nJTAw", title: "Sylvan: Najad", views: 6 },
  { id: "I238uC9pxLQ", title: "Fable Animals: Kalydon", views: 5 },
  { id: "-6x3huqel8E", title: "The Altor Codex - Chapter 2A - The Misty Island", views: 5 },
  { id: "SkHa9w8liis", title: "The Altor Codex - Chapter 1 - The Secret of Skeleton Village", views: 5 },
  { id: "Rk7xhv-emb0", title: "Fable Animals: Murder Vulture", views: 5 },
  { id: "SYTi8E0O5ZQ", title: "Stonekin: Titan", views: 5 },
  { id: "wF72i-Fc3ts", title: "Animal Humanoids: Reptileman", views: 5 },
  { id: "2ehrufKRZ8I", title: "Fable Animals: Ambiorm", views: 5 },
  { id: "L4O9Fougqq4", title: "Fable Animals: Gargoyle", views: 5 },
  { id: "85DMkHF8u6A", title: "Elves: Light Elf", views: 5 },
  { id: "FDw6WWgfkPA", title: "Sylvan: Oread", views: 5 },
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
  { id: "wyPrX5LWKY8", title: "Sylvan: Fire Pixie", views: 4 },
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
  { id: "G3T6f7JI9DU", title: "Sylvan: Satyr", views: 2 },
  { id: "cjGfbtcPYpU", title: "Sylvan: Hag", views: 2 },
  { id: "cVrGWmE5MZE", title: "Demonic Creatures: Vampire Butterfly", views: 2 },
  { id: "DgR1qzxBklM", title: "Magical Undead: Living Dead", views: 2 },
  { id: "mD0O4y158nI", title: "Sylvan: Dryad", views: 2 },
  { id: "ZtrSHqoJwh0", title: "Sylvan: Faerie", views: 2 },
  { id: "PRrKhpnIdFg", title: "Dark Folks: Boggart", views: 2 },
  { id: "za-ZR10tS0k", title: "Corporeal Undead: Deadmans Hand", views: 2 },
  { id: "oIfZEktDif4", title: "Magical Undead: Baneman", views: 2 },
  { id: "MHBR0okQCso", title: "Sylvan: Peerie", views: 2 },
  { id: "O1fY__gjLX4", title: "Stonekin: Cyclop", views: 2 },
  { id: "T0KF37hwAYM", title: "Wraiths & Wights: Barrow Wight", views: 1 },
  { id: "lhEAWjCEZjQ", title: "Corporeal Undead: Mara", views: 1 },
  { id: "MRa9ERgbzZw", title: "Corporeal Undead: Vampire", views: 1 },
  { id: "l4Qhd8TmyzU", title: "Sylvan: Hob", views: 1 },
];

// Category → section mapping
const SECTION_MAP = {
  History:            "history",
  Geography:          "geography",
  Countries:          "countries",
  Magic:              "magic",
  Dragons:            "creatures",
  "Fable Animals":    "creatures",
  Elementals:         "creatures",
  Spirits:            "creatures",
  "Lesser Demon":     "creatures",
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
  Sylvan:             "peoples",
  "Dark Folks":       "peoples",
  Conflicts:          "conflicts",
  Character:          "characters",
  Religion:           "lore",
  Lore:               "lore",
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

// Build the enriched video list
export const videos = rawVideos.map((v) => ({ ...v, ...parse(v.title) }));

// IDs already shown in the Chronicles section — exclude from Compendium
const CHRONICLE_IDS = new Set(["6LBJzNV1ELE", "uwAW1TD2hi4", "SkHa9w8liis", "-6x3huqel8E", "b5zJNvqF5n8"]);

// Build { sectionId → [ { group: string|null, videos[] }, ... ] }
// Ungrouped entries (group===null) come first, then named groups sorted alphabetically
const _bySection = videos.filter((v) => !CHRONICLE_IDS.has(v.id)).reduce((acc, v) => {
  if (!acc[v.section]) acc[v.section] = {};
  const key = v.group ?? "__none__";
  (acc[v.section][key] = acc[v.section][key] || []).push(v);
  return acc;
}, {});

export const videosBySection = Object.fromEntries(
  Object.entries(_bySection).map(([sec, map]) => {
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
