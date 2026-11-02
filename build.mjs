/* Склеивает части дневника в один статический файл. Запуск: node build.mjs
   package.json нет специально: из-за него Layero уходит в режим Vite и сайт не открывается. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const parts = ["01-catalog.js", "02-cloud.js", "03-roads.js", "04-app.js"];
const body = parts.map(function(name){
  return readFileSync(join(root, "src/parts", name), "utf8").replace(/\s+$/, "");
}).join("\n\n");
const out = join(root, "src/travelek.js");
writeFileSync(out, body + "\n");
console.log("wrote", out, Buffer.byteLength(body));
