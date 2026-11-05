/* Собирает .js рядом с .ts и ставит ?v=53 на импорты.
   Layero этот скрипт не запускает: в репозиторий кладётся уже собранный JavaScript. */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tsc = process.argv[2];
const cacheV = "53";
if (!tsc) {
  console.error("нужен путь к tsc");
  process.exit(1);
}
function stamp(text) {
  return text.replace(/(from\s+|import\s+)(["'])(\.\.?\/[^"']+?\.js)(?:\?v=\d+)?\2/g, function (_, lead, q, spec) {
    return lead + q + spec + "?v=" + cacheV + q;
  });
}
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".js")) out.push(path);
  }
}
const dir = mkdtempSync(join(tmpdir(), "travelek-emit-"));
function run(args) {
  const hit = spawnSync(tsc, args, { cwd: root, encoding: "utf8" });
  if (hit.status) {
    process.stderr.write(hit.stdout || "");
    process.stderr.write(hit.stderr || "");
    process.exit(hit.status || 1);
  }
}
run(["-p", "tsconfig.json", "--outDir", dir, "--rootDir", "."]);
run(["-p", "tsconfig.worker.json", "--outDir", join(dir, "src"), "--rootDir", "src"]);
const files = [];
walk(join(dir, "src"), files);
for (const file of files) {
  const rel = relative(join(dir, "src"), file);
  writeFileSync(join(root, "src", rel), stamp(readFileSync(file, "utf8")));
  console.log("ok", rel);
}
rmSync(dir, { recursive: true, force: true });
