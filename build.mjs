/* Проверка частей дневника. Сплошной travelek.js больше не собирается.
   Запуск: node build.mjs
   package.json нет специально: из-за него Layero уходит в режим Vite. */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const files = [
  "src/parts/01-catalog.js",
  "src/parts/02-cloud.js",
  "src/parts/03-roads.js",
  "src/parts/04-app.js",
  "src/atlas.js",
  "src/when.js",
  "src/main.js",
  "src/gate.js",
  "src/accounts.js",
  "src/places.worker.js"
];
let bad = 0;
for (const file of files) {
  const run = spawnSync(process.execPath, ["--check", join(root, file)], { encoding: "utf8" });
  if (run.status) {
    bad++;
    process.stderr.write(file + "\n" + (run.stderr || run.stdout || ""));
  } else {
    console.log("ok", file);
  }
}
if (bad) process.exit(1);
