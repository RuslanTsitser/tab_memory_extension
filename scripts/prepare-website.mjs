import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "icons");
const websiteDir = join(root, "website");

mkdirSync(websiteDir, { recursive: true });

if (!existsSync(join(iconsDir, "icon-128.png"))) {
  execSync("node scripts/generate-icons.mjs", { cwd: root, stdio: "inherit" });
}

copyFileSync(join(iconsDir, "icon-128.png"), join(websiteDir, "icon.png"));
console.log("website/icon.png ready");
