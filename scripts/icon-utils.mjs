import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/** Corner radius as a fraction of icon size (Chrome-style squircle). */
export const CORNER_RATIO = 0.2;

export async function centerCropSquare(input) {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read size of ${input}`);
  }

  const side = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - side) / 2);
  const top = Math.floor((meta.height - side) / 2);

  return sharp(input).extract({ left, top, width: side, height: side }).png().toBuffer();
}

export async function exportRoundedSquareIcon(input, output, size, cornerRatio = CORNER_RATIO) {
  const radius = Math.max(2, Math.round(size * cornerRatio));
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );

  await sharp(input)
    .resize(size, size)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(output);
}

export async function exportRoundedSquareFromFile(inputPath, outputPath, size, cornerRatio = CORNER_RATIO) {
  const square = await centerCropSquare(inputPath);
  await exportRoundedSquareIcon(square, outputPath, size, cornerRatio);
}
