import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets");
const source = join(assetsDir, "icon-source.png");
const outDir = join(root, "icons");
const sizes = [16, 32, 48, 128];

/** Corner radius as a fraction of icon size (Chrome-style squircle). */
const CORNER_RATIO = 0.2;

if (!existsSync(source)) {
  console.error(`Missing ${source}. Add icon-source.png (wide logo) to assets/.`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const meta = await sharp(source).metadata();
if (!meta.width || !meta.height) {
  throw new Error(`Could not read size of ${source}`);
}

const side = Math.min(meta.width, meta.height);
const left = Math.floor((meta.width - side) / 2);
const top = Math.floor((meta.height - side) / 2);

const square = await sharp(source)
  .extract({ left, top, width: side, height: side })
  .png()
  .toBuffer();

for (const size of sizes) {
  const out = join(outDir, `icon-${size}.png`);
  await exportRoundedIcon(square, out, size);
}

console.log(`Icons written to icons/ (${side}×${side} crop, ${CORNER_RATIO * 100}% corner radius)`);

async function exportRoundedIcon(input, output, size) {
  const radius = Math.max(2, Math.round(size * CORNER_RATIO));
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );

  await sharp(input)
    .resize(size, size)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(output);
}
