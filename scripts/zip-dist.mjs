import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const out = join(root, "tab-memory-extension.zip");

if (!existsSync(dist)) {
  console.error("Run npm run build first.");
  process.exit(1);
}

execSync(`rm -f "${out}" && cd "${dist}" && zip -r "${out}" .`, {
  stdio: "inherit",
});

console.log(`Created ${out}`);
