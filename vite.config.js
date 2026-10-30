import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

var COPY = ["src", "geo", "vendor", "art", "preview", "favicon.svg", "og.jpg"];
var REQUIRED = [
  "index.html",
  "src/travelek.js",
  "src/atlas.js",
  "src/accounts.js",
  "src/gate.js",
  "geo/places.json",
  "geo/countries.json",
  "geo/atlas-data.js",
  "geo/roads.js",
  "geo/rails.js",
  "vendor/leaflet.js",
  "art/logo.jpg"
];

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    modulePreload: false,
    assetsInlineLimit: 0
  },
  plugins: [
    {
      name: "copy-runtime",
      closeBundle: function () {
        var out = resolve("dist");
        var i, item, file;
        mkdirSync(out, { recursive: true });
        for (i = 0; i < COPY.length; i++) {
          item = COPY[i];
          cpSync(resolve(item), resolve(out, item), { recursive: true });
        }
        for (i = 0; i < REQUIRED.length; i++) {
          file = resolve(out, REQUIRED[i]);
          if (!existsSync(file)) throw new Error("В сборке нет " + REQUIRED[i]);
        }
      }
    }
  ]
});
