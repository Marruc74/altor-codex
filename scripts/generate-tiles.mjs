/**
 * Generates map tiles for public/tiles/{z}/{x}/{y}.png
 *
 * File zoom levels (z in filename) map to Leaflet zoom levels via zoomOffset=2:
 *   File z=0  →  Leaflet zoom -2  (image scaled to 1536×1024,  6× 4 tiles)
 *   File z=1  →  Leaflet zoom -1  (image scaled to 3072×2048, 12× 8 tiles)
 *   File z=2  →  Leaflet zoom  0  (image at full 6144×4096,   24×16 tiles)
 *
 * Also writes public/tiles/thumb.jpg for the minimap overlay.
 */

import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const IMG_W       = 6144;
const IMG_H       = 4096;
const TILE_SIZE   = 256;
const MAX_FILE_Z  = 2;   // file zoom at native resolution (Leaflet zoom 0)
const INPUT       = "public/World/Altor Map.png";
const OUTPUT      = "public/tiles";

mkdirSync(OUTPUT, { recursive: true });

// ── Thumbnail for minimap ────────────────────────────────────────────────────
const thumbW = 640;
const thumbH = Math.round(thumbW * IMG_H / IMG_W);
console.log(`Generating thumbnail ${thumbW}×${thumbH}…`);
await sharp(INPUT)
  .resize(thumbW, thumbH, { fit: "fill", kernel: "lanczos3" })
  .jpeg({ quality: 80 })
  .toFile(join(OUTPUT, "thumb.jpg"));
console.log("  ✓ thumb.jpg");

// ── Tiles ────────────────────────────────────────────────────────────────────
for (let fz = 0; fz <= MAX_FILE_Z; fz++) {
  const scale   = 1 << (MAX_FILE_Z - fz);   // 4, 2, 1
  const scaledW = Math.ceil(IMG_W / scale);
  const scaledH = Math.ceil(IMG_H / scale);
  const tilesX  = Math.ceil(scaledW / TILE_SIZE);
  const tilesY  = Math.ceil(scaledH / TILE_SIZE);

  console.log(
    `Zoom ${fz} (Leaflet ${fz - 2}): ${scaledW}×${scaledH}` +
    ` → ${tilesX}×${tilesY} = ${tilesX * tilesY} tiles`
  );

  // Resize once into memory, then slice
  const buf = await sharp(INPUT)
    .resize(scaledW, scaledH, { fit: "fill", kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = buf;

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const left = tx * TILE_SIZE;
      const top  = ty * TILE_SIZE;
      const w    = Math.min(TILE_SIZE, scaledW - left);
      const h    = Math.min(TILE_SIZE, scaledH - top);

      const dir = join(OUTPUT, String(fz), String(tx));
      mkdirSync(dir, { recursive: true });
      const outPath = join(dir, `${ty}.png`);

      let pipeline = sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels },
      }).extract({ left, top, width: w, height: h });

      if (w < TILE_SIZE || h < TILE_SIZE) {
        pipeline = pipeline.extend({
          right:      TILE_SIZE - w,
          bottom:     TILE_SIZE - h,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        });
      }

      await pipeline.png({ compressionLevel: 6 }).toFile(outPath);
    }
  }

  console.log(`  ✓ zoom ${fz} done`);
}

console.log("\nAll tiles generated.");
