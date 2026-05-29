import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "icons");
const assetsDir = join(root, "assets");
const websiteDir = join(root, "website");
const faviconSource = join(iconsDir, "icon-128.png");

const logos = [
  { source: "tab_memory_icon.png", out: "logo-dark.png" },
  { source: "tab_memory_icon_light.png", out: "logo-light.png" },
];

mkdirSync(websiteDir, { recursive: true });

if (!existsSync(faviconSource)) {
  execSync("node scripts/generate-icons.mjs", { cwd: root, stdio: "inherit" });
}

copyFileSync(faviconSource, join(websiteDir, "icon.png"));

for (const { source, out } of logos) {
  const input = join(assetsDir, source);
  if (!existsSync(input)) {
    console.error(`Missing ${input}`);
    process.exit(1);
  }
  exportSquareLogo(input, join(websiteDir, out));
}

console.log("website/icon.png, logo-dark.png, logo-light.png ready");

function exportSquareLogo(input, output) {
  const { width, height } = getImageSize(input);
  const side = Math.min(width, height);
  const offsetX = Math.floor((width - side) / 2);
  const offsetY = Math.floor((height - side) / 2);
  const tmp = `${output}.tmp.png`;

  execSync(
    `sips -c ${side} ${side} --cropOffset ${offsetY} ${offsetX} "${input}" --out "${tmp}"`,
    { stdio: "inherit" },
  );
  execSync(`sips -z 512 512 "${tmp}" --out "${output}"`, { stdio: "inherit" });
  execSync(`rm -f "${tmp}"`);
}

function getImageSize(path) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${path}"`, {
    encoding: "utf8",
  });
  const width = Number(out.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(out.match(/pixelHeight: (\d+)/)?.[1]);
  if (!width || !height) throw new Error(`Could not read size of ${path}`);
  return { width, height };
}
