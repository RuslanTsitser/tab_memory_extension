import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets");
const source = join(assetsDir, "icon-source.png");
const square = join(assetsDir, "icon-square.png");
const outDir = join(root, "icons");
const sizes = [16, 32, 48, 128];

if (!existsSync(source)) {
  console.error(`Missing ${source}. Add icon-source.png (wide logo) to assets/.`);
  process.exit(1);
}

mkdirSync(assetsDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

// Center crop sides → square (height × height)
const { width, height } = getImageSize(source);
const side = Math.min(width, height);
const offsetX = Math.floor((width - side) / 2);
const offsetY = Math.floor((height - side) / 2);

execSync(
  `sips -c ${side} ${side} --cropOffset ${offsetY} ${offsetX} "${source}" --out "${square}"`,
  { stdio: "inherit" },
);

for (const size of sizes) {
  const out = join(outDir, `icon-${size}.png`);
  execSync(`sips -z ${size} ${size} "${square}" --out "${out}"`, { stdio: "inherit" });
}

console.log(`Icons written to icons/ (from ${side}×${side} center crop)`);

function getImageSize(path) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${path}"`, {
    encoding: "utf8",
  });
  const width = Number(out.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(out.match(/pixelHeight: (\d+)/)?.[1]);
  if (!width || !height) throw new Error(`Could not read size of ${path}`);
  return { width, height };
}
