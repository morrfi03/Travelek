import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

var dir = resolve("src/parts");
var names = readdirSync(dir).filter(function (n) { return n.endsWith(".js"); }).sort();
var body = names.map(function (n) { return readFileSync(resolve(dir, n), "utf8"); }).join("");
writeFileSync(resolve("src/travelek.js"), body);
console.log("src/travelek.js", names.join(" "), body.length);
