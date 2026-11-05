/* Проверка частей дневника. Сплошной travelek.js больше не собирается.
   Запуск: node build.mjs
   package.json нет специально: из-за него Layero уходит в режим Vite. */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const files = [
  "src/parts/01-catalog.js",
  "src/parts/02-cloud.js",
  "src/parts/03-roads.js",
  "src/parts/04-app.js",
  "src/atlas.js",
  "src/text.js",
  "src/world.js",
  "src/screen.js",
  "src/when.js",
  "src/diary.js",
  "src/model.js",
  "src/store.js",
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

const srcRoot = join(root, "src");
const modules = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".js")) modules.push(path);
  }
}
walk(srcRoot);
const graph = new Map();
const importRe = /(?:from\s+|import\s+)["']([^"']+)["']/g;
for (const file of modules) {
  const text = readFileSync(file, "utf8");
  const deps = [];
  let match;
  while ((match = importRe.exec(text))) {
    const spec = match[1].split("?")[0];
    if (!spec.startsWith(".")) continue;
    const target = normalize(join(dirname(file), spec));
    if (!existsSync(target)) {
      console.error("нет файла", spec, "из", file.slice(root.length + 1));
      bad++;
    }
    deps.push(target);
  }
  graph.set(file, deps);
}
const rel = (file) => file.slice(srcRoot.length + 1);
for (const [file, deps] of graph) {
  const from = rel(file);
  for (const dep of deps) {
    const to = rel(dep);
    const denied = (from === "parts/01-catalog.js" && (to.includes("02-cloud") || to.includes("04-app")))
      || ((from === "parts/02-cloud.js" || from === "parts/03-roads.js") && to.includes("04-app"));
    if (denied) {
      console.error("нельзя", from, "->", to);
      bad++;
    }
  }
}
const seen = new Set();
const stack = new Set();
function cycle(file) {
  if (stack.has(file)) return [file];
  if (seen.has(file)) return null;
  seen.add(file);
  stack.add(file);
  for (const dep of graph.get(file) || []) {
    const hit = cycle(dep);
    if (hit) return [file].concat(hit);
  }
  stack.delete(file);
  return null;
}
for (const file of graph.keys()) {
  const hit = cycle(file);
  if (hit) {
    console.error("круг", hit.map(rel).join(" -> "));
    bad++;
    break;
  }
}
if (bad) process.exit(1);
console.log("связи ok", modules.length);
