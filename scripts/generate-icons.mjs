import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { centerCropSquare, exportRoundedSquareIcon, CORNER_RATIO } from "./icon-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets");
const source = join(assetsDir, "tab_memory_icon.png");
const outDir = join(root, "icons");
const sizes = [16, 32, 48, 128];

if (!existsSync(source)) {
  console.error(`Missing ${source}. Add tab_memory_icon.png (logo) to assets/.`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const square = await centerCropSquare(source);

for (const size of sizes) {
  await exportRoundedSquareIcon(square, join(outDir, `icon-${size}.png`), size);
}

console.log(
  `Icons written to icons/ from tab_memory_icon.png (${CORNER_RATIO * 100}% corner radius)`,
);
