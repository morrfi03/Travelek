/* Runtime для Layero: статика сайта и поиск рейсов.
   Ключ только из переменной AERODATABOX_KEY, в файлы не пишется. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

function scheduleFile() {
  return process.env.TRAVELEK_SCHEDULES || path.join(root, "data", "schedules.json");
}

function readDb() {
  try {
    const db = JSON.parse(fs.readFileSync(scheduleFile(), "utf8"));
    return db && typeof db === "object" ? db : {};
  } catch (err) {
    return {};
  }
}

export function readSchedule(from, to, date) {
  const row = readDb()[from + "|" + to + "|" + date];
  return Array.isArray(row) ? row : null;
}

export function writeSchedule(from, to, date, flights) {
  const db = readDb();
  db[from + "|" + to + "|" + date] = flights;
  const file = scheduleFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db));
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".css": "text/css; charset=utf-8"
};

export function localClock(value) {
  const text = timeText(value);
  const match = text.match(/(\d{2}):(\d{2})/);
  return match ? match[1] + ":" + match[2] : "";
}

export function airMinutes(dep, arr) {
  const a = Date.parse(iso(dep));
  const b = Date.parse(iso(arr));
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.round((b - a) / 60000);
}

function timeText(value) {
  if (!value) return "";
  if (typeof value === "object") return String(value.local || value.utc || "");
  return String(value);
}

function iso(value) {
  let text = timeText(value).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text)) text = text.replace(" ", "T");
  return text;
}

function iataOf(side) {
  if (!side) return "";
  const airport = side.airport || side;
  return String(airport.iata || airport.iataCode || side.iata || "").toUpperCase();
}

function labelOf(value, field) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value[field] || value.name || value.model || "");
}

function flightNo(row) {
  const flight = row.flight || {};
  return String(row.number || flight.iataNumber || flight.number || "").trim();
}

function scheduled(side) {
  if (!side) return "";
  return side.scheduledTime || side.scheduledTimeLocal || side.revisedTime || side.time || "";
}

export function pickFlights(payload, toCode) {
  const want = String(toCode || "").toUpperCase();
  const rows = [].concat((payload && payload.departures) || [], (payload && payload.flights) || []);
  const seen = {};
  const out = [];
  rows.forEach(function (row) {
    if (!row || typeof row !== "object") return;
    const arrival = row.arrival || null;
    const departure = row.departure || null;
    const arrIata = iataOf(arrival);
    if (!arrIata || arrIata !== want) return;
    const flight = flightNo(row);
    if (!flight || seen[flight]) return;
    seen[flight] = 1;
    const depTime = scheduled(departure);
    const arrTime = scheduled(arrival);
    out.push({
      flight: flight,
      airline: labelOf(row.airline, "name"),
      aircraft: labelOf(row.aircraft, "model"),
      time: localClock(depTime),
      airMin: airMinutes(depTime, arrTime),
      from: iataOf(departure),
      to: arrIata
    });
  });
  out.sort(function (a, b) { return a.time.localeCompare(b.time); });
  return out;
}

function sendJson(res, code, body) {
  const raw = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(raw);
}

const monthHits = new Map();
function allowSearch() {
  const month = new Date().toISOString().slice(0, 7);
  const used = monthHits.get(month) || 0;
  if (used >= 90) return false;
  monthHits.set(month, used + 1);
  return true;
}

async function board(iata, fromLocal, toLocal, key) {
  const url = "https://aerodatabox.p.rapidapi.com/flights/airports/iata/"
    + iata + "/" + fromLocal + "/" + toLocal
    + "?withLeg=true&direction=Departure&withCancelled=false";
  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
    },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    const raw = await response.text();
    let detail = "";
    try {
      const body = JSON.parse(raw);
      detail = String((body && (body.message || body.error || body.details)) || "");
    } catch (err) {
      detail = raw;
    }
    detail = detail.replace(/\s+/g, " ").trim().slice(0, 180);
    const failure = new Error("upstream");
    failure.status = response.status;
    failure.detail = detail;
    throw failure;
  }
  return response.json();
}

export async function searchFlights(query, key) {
  const from = String(query.get("from") || "").toUpperCase();
  const to = String(query.get("to") || "").toUpperCase();
  const date = String(query.get("date") || "");
  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { status: 400, body: { error: "Нужны аэропорты и дата" } };
  }
  const saved = readSchedule(from, to, date);
  if (saved) return { status: 200, body: { flights: saved, saved: true } };
  if (!key) return { status: 503, body: { error: "В Layero не задан ключ AERODATABOX_KEY" } };
  if (!allowSearch()) return { status: 429, body: { error: "Лимит поисков на этот месяц исчерпан" } };
  const windows = [[date + "T00:00", date + "T11:59"], [date + "T12:00", date + "T23:59"]];
  const merged = [];
  try {
    const settled = await Promise.allSettled(windows.map(function (span) {
      return board(from, span[0], span[1], key);
    }));
    const ok = settled.filter(function (item) { return item.status === "fulfilled"; });
    if (!ok.length) throw settled[0].reason;
    ok.forEach(function (item) {
      pickFlights(item.value, to).forEach(function (row) { merged.push(row); });
    });
  } catch (err) {
    const status = err && err.status;
    const detail = err && err.detail ? ": " + err.detail : "";
    const message = status === 401 || status === 403
      ? "Ключ AeroDataBox не принят" + detail
      : "Расписание не ответило" + (status ? " (" + status + ")" : "") + detail;
    return { status: 502, body: { error: message } };
  }
  const seen = {};
  const flights = merged.filter(function (row) {
    if (seen[row.flight]) return false;
    seen[row.flight] = 1;
    return true;
  }).sort(function (a, b) { return a.time.localeCompare(b.time); });
  try { writeSchedule(from, to, date, flights); } catch (err) {}
  return { status: 200, body: { flights: flights, saved: false } };
}

function filePath(urlPath) {
  let rel = decodeURIComponent(String(urlPath || "/").split("?")[0]);
  if (rel === "/") rel = "/index.html";
  if (!rel.startsWith("/") || rel.includes("\0") || rel.includes("\\")) return null;
  rel = path.posix.normalize(rel);
  const parts = rel.split("/").filter(Boolean);
  if (!parts.length || parts.some(function (part) { return part === ".." || part.startsWith("."); })) return null;
  if (parts[0] === "data") return null;
  const resolved = path.resolve(root, parts.join("/"));
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

function serveFile(req, res) {
  const full = filePath(req.url || "/");
  if (!full) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  fs.stat(full, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const type = types[path.extname(full).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    fs.createReadStream(full).pipe(res);
  });
}

export function createServer() {
  return http.createServer(function (req, res) {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname === "/api/aero-key") {
      sendJson(res, 200, { key: process.env.AERODATABOX_KEY || "" });
      return;
    }
    if (url.pathname === "/api/flights") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      if (typeof res.flushHeaders === "function") res.flushHeaders();
      searchFlights(url.searchParams, process.env.AERODATABOX_KEY || "").then(function (result) {
        res.end(JSON.stringify(result.body));
      }).catch(function () {
        res.end(JSON.stringify({ error: "Ошибка сервера" }));
      });
      return;
    }
    serveFile(req, res);
  });
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) {
  createServer().listen(port, "0.0.0.0", function () {
    console.log("travelek " + port);
  });
}
