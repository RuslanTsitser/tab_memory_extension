import sharp from "sharp";

/** Corner radius as a fraction of icon size (Chrome-style squircle). */
export const CORNER_RATIO = 0.2;

/** Extra space around detected logo content (fraction of content size, each side). */
export const CONTENT_PADDING_RATIO = 0.1;

export async function detectContentBounds(input) {
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });

  const corners = [
    samplePixel(data, info, 0, 0),
    samplePixel(data, info, info.width - 1, 0),
    samplePixel(data, info, 0, info.height - 1),
    samplePixel(data, info, info.width - 1, info.height - 1),
  ];
  const cornerLum = corners.map((c) => luminance(c.r, c.g, c.b));
  const darkBackground = cornerLum.reduce((a, b) => a + b, 0) / cornerLum.length < 128;

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const { r, g, b } = samplePixel(data, info, x, y);
      const lum = luminance(r, g, b);
      const isContent = darkBackground ? lum > 200 : lum < 80;
      if (!isContent) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX <= minX || maxY <= minY) {
    throw new Error("Could not detect logo bounds in image");
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    background: averageColor(corners),
  };
}

export async function tightCropSquare(input, paddingRatio = CONTENT_PADDING_RATIO) {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read size of image buffer`);
  }

  const bounds = await detectContentBounds(input);
  const pad = Math.round(Math.max(bounds.width, bounds.height) * paddingRatio);
  const side = Math.max(bounds.width, bounds.height) + pad * 2;
  const centerX = Math.floor((bounds.minX + bounds.maxX) / 2);
  const centerY = Math.floor((bounds.minY + bounds.maxY) / 2);

  let left = Math.floor(centerX - side / 2);
  let top = Math.floor(centerY - side / 2);
  let extractWidth = side;
  let extractHeight = side;

  const padLeft = Math.max(0, -left);
  const padTop = Math.max(0, -top);
  left = Math.max(0, left);
  top = Math.max(0, top);
  extractWidth = Math.min(side, meta.width - left);
  extractHeight = Math.min(side, meta.height - top);

  let image = sharp(input).extract({ left, top, width: extractWidth, height: extractHeight });

  if (padLeft || padTop || extractWidth < side || extractHeight < side) {
    image = image.extend({
      top: padTop,
      bottom: Math.max(0, side - extractHeight - padTop),
      left: padLeft,
      right: Math.max(0, side - extractWidth - padLeft),
      background: bounds.background,
    });
  }

  return image.resize(side, side).png().toBuffer();
}

/** @deprecated Use tightCropSquare for extension/website icons. */
export async function centerCropSquare(input) {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read size of image buffer`);
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
  const square = await tightCropSquare(inputPath);
  await exportRoundedSquareIcon(square, outputPath, size, cornerRatio);
}

function samplePixel(data, info, x, y) {
  const i = (y * info.width + x) * info.channels;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function averageColor(colors) {
  const n = colors.length;
  return {
    r: Math.round(colors.reduce((sum, c) => sum + c.r, 0) / n),
    g: Math.round(colors.reduce((sum, c) => sum + c.g, 0) / n),
    b: Math.round(colors.reduce((sum, c) => sum + c.b, 0) / n),
  };
}
