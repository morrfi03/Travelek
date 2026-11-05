/* Сверяет собранный JavaScript с TypeScript. В репозиторий не пишет.
   Layero отдаёт уже лежащие .js и сборку не запускает. */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tsc = process.argv[2];
const cacheV = "51";
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

const repoFiles = [];
walk(join(root, "src"), repoFiles);
let bad = 0;
for (const file of repoFiles) {
  const rel = relative(join(root, "src"), file);
  const emitted = join(dir, "src", rel);
  let fresh = "";
  try { fresh = stamp(readFileSync(emitted, "utf8")); }
  catch (e) { console.error("нет сборки", rel); bad++; continue; }
  const have = readFileSync(file, "utf8");
  if (have !== fresh) {
    console.error("js разошёлся с ts:", rel);
    bad++;
  }
}
const repoSet = new Set(repoFiles.map(function (file) { return relative(join(root, "src"), file); }));
const emitted = [];
walk(join(dir, "src"), emitted);
for (const file of emitted) {
  const rel = relative(join(dir, "src"), file);
  if (!repoSet.has(rel)) {
    console.error("сборка дала файл, которого нет в репозитории:", rel);
    bad++;
  }
}
rmSync(dir, { recursive: true, force: true });
if (bad) process.exit(1);
console.log("js совпадает с ts");
