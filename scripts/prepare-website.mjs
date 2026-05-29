import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "icons");
const assetsDir = join(root, "assets");
const websiteDir = join(root, "website");

const logos = [
  { source: "tab_memory_icon.png", out: "logo-dark.png" },
  { source: "tab_memory_icon_light.png", out: "logo-light.png" },
];

mkdirSync(websiteDir, { recursive: true });

const faviconSource =
  [join(iconsDir, "icon-128.png"), join(assetsDir, "tab_memory_icon.png")].find(
    (path) => existsSync(path),
  ) ?? null;

if (!faviconSource) {
  console.error("Missing favicon source (icons/icon-128.png or assets/tab_memory_icon.png)");
  process.exit(1);
}

await exportSquareLogo(faviconSource, join(websiteDir, "icon.png"), 128);

for (const { source, out } of logos) {
  const input = join(assetsDir, source);
  if (!existsSync(input)) {
    console.error(`Missing ${input}`);
    process.exit(1);
  }
  await exportSquareLogo(input, join(websiteDir, out), 512);
}

console.log("website/icon.png, logo-dark.png, logo-light.png ready");

async function exportSquareLogo(input, output, size) {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read size of ${input}`);
  }

  const side = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - side) / 2);
  const top = Math.floor((meta.height - side) / 2);

  await sharp(input)
    .extract({ left, top, width: side, height: side })
    .resize(size, size)
    .png()
    .toFile(output);
}
