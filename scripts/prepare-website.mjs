import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "icons");
const assetsDir = join(root, "assets");
const websiteDir = join(root, "website");
const logoSource = join(assetsDir, "tab_memory_icon.png");
const faviconSource = join(iconsDir, "icon-128.png");

mkdirSync(websiteDir, { recursive: true });

if (!existsSync(faviconSource)) {
  execSync("node scripts/generate-icons.mjs", { cwd: root, stdio: "inherit" });
}

copyFileSync(faviconSource, join(websiteDir, "icon.png"));

if (!existsSync(logoSource)) {
  console.error(`Missing ${logoSource}`);
  process.exit(1);
}

const square = join(assetsDir, "logo-square.png");
const { width, height } = getImageSize(logoSource);
const side = Math.min(width, height);
const offsetX = Math.floor((width - side) / 2);
const offsetY = Math.floor((height - side) / 2);

execSync(
  `sips -c ${side} ${side} --cropOffset ${offsetY} ${offsetX} "${logoSource}" --out "${square}"`,
  { stdio: "inherit" },
);
execSync(`sips -z 512 512 "${square}" --out "${join(websiteDir, "logo.png")}"`, {
  stdio: "inherit",
});

console.log("website/icon.png (favicon) and website/logo.png ready");

function getImageSize(path) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${path}"`, {
    encoding: "utf8",
  });
  const width = Number(out.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(out.match(/pixelHeight: (\d+)/)?.[1]);
  if (!width || !height) throw new Error(`Could not read size of ${path}`);
  return { width, height };
}
