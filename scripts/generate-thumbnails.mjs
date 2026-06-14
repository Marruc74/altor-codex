// Generate card thumbnails for every image under public/codex and
// public/compendium. Each image gets a downscaled copy in a sibling
// `Thumbnails/` folder with the same filename, which the cards load instead of
// the full-size image (the full one loads only on click / on the detail page).
//
//   node scripts/generate-thumbnails.mjs           # create missing thumbnails
//   node scripts/generate-thumbnails.mjs --force    # rebuild every thumbnail
//
// Thumbnails are capped at MAX_EDGE px on the long side - crisp at the card's
// ~220px display width (retina) while staying a fraction of the original size.

import sharp from "sharp";
import { readdirSync, statSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ROOTS = ["public/codex", "public/compendium"];
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_EDGE = 480;
const JPEG_QUALITY = 78;
const force = process.argv.includes("--force");

function* walkImages(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "Thumbnails") continue; // never thumbnail the thumbnails
      yield* walkImages(full);
    } else if (EXT.has(path.extname(name).toLowerCase())) {
      yield full;
    }
  }
}

let made = 0,
  skipped = 0,
  failed = 0;

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const src of walkImages(root)) {
    const dir = path.dirname(src);
    const thumbDir = path.join(dir, "Thumbnails");
    const out = path.join(thumbDir, path.basename(src));

    if (!force && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) {
      skipped++;
      continue;
    }
    mkdirSync(thumbDir, { recursive: true });

    const ext = path.extname(src).toLowerCase();
    let pipe = sharp(src).resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true });
    if (ext === ".png") pipe = pipe.png({ compressionLevel: 9 });
    else if (ext === ".webp") pipe = pipe.webp({ quality: JPEG_QUALITY });
    else pipe = pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    try {
      await pipe.toFile(out);
      made++;
    } catch (err) {
      failed++;
      console.warn(`! failed: ${src} - ${err.message}`);
    }
  }
}

console.log(`Thumbnails: ${made} created, ${skipped} up-to-date${failed ? `, ${failed} failed` : ""}.`);
