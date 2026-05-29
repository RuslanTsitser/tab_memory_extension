import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportRoundedSquareFromFile } from "./icon-utils.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(root, "assets");
const websiteDir = join(root, "website");

const logos = [
  { source: "tab_memory_icon.png", out: "logo-dark.png", size: 512 },
  { source: "tab_memory_icon_light.png", out: "logo-light.png", size: 512 },
];

const favicons = [
  { source: "tab_memory_icon_light.png", out: "favicon-light.png", size: 32 },
  { source: "tab_memory_icon.png", out: "favicon-dark.png", size: 32 },
  { source: "tab_memory_icon_light.png", out: "apple-touch-icon.png", size: 180 },
];

mkdirSync(websiteDir, { recursive: true });

for (const { source, out, size } of [...logos, ...favicons]) {
  const input = join(assetsDir, source);
  if (!existsSync(input)) {
    console.error(`Missing ${input}`);
    process.exit(1);
  }
  await exportRoundedSquareFromFile(input, join(websiteDir, out), size);
}

await exportRoundedSquareFromFile(
  join(assetsDir, "tab_memory_icon_light.png"),
  join(websiteDir, "icon.png"),
  32,
);

console.log("website favicons and logos ready (rounded corners)");
