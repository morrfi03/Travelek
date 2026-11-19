/* Runtime для Layero: статика сайта и поиск рейсов.
   Ключ только из переменной AERODATABOX_KEY, в файлы не пишется. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const logKeep = 3;
let logFile = "";
let logBytes = 0;

function logLimit() {
  const n = Number(process.env.TRAVELEK_LOG_MAX || 262144);
  return n >= 1024 ? n : 262144;
}

function rotatedLog(n) {
  if (logFile.endsWith(".log")) return logFile.slice(0, -4) + "." + n + ".log";
  return logFile + "." + n;
}

function openLog() {
  logFile = process.env.TRAVELEK_LOG || path.join(root, "data", "server.log");
  try {
    logBytes = fs.statSync(logFile).size;
  } catch (err) {
    logBytes = 0;
  }
}

function rotateLogs() {
  if (!logFile) return;
  for (let i = logKeep - 1; i >= 1; i--) {
    try { fs.renameSync(rotatedLog(i), rotatedLog(i + 1)); } catch (err) { /* старого файла может не быть */ }
  }
  try { fs.renameSync(logFile, rotatedLog(1)); } catch (err) { /* первый запуск */ }
  logBytes = 0;
}

let held = null;
let heldTimer = null;

function scrub(text) {
  let out = String(text || "");
  ["AERODATABOX_KEY", "AERODATABOX_KEY_2", "AERODATABOX_KEY_3"].forEach(function (name) {
    const secret = process.env[name];
    if (secret && secret.length > 4) out = out.split(secret).join("***");
  });
  return out;
}

function emit(line) {
  const text = JSON.stringify(line);
  console.error(text);
  if (!logFile) return;
  if (logBytes > 0 && logBytes + text.length + 1 > logLimit()) rotateLogs();
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, text + "\n");
    logBytes += text.length + 1;
  } catch (writeErr) {
    logFile = "";
    console.error(JSON.stringify({
      t: line.t,
      level: "error",
      where: "log",
      message: writeErr && writeErr.message ? writeErr.message : "не удалось записать журнал"
    }));
  }
}

function flushHeld() {
  if (heldTimer) clearTimeout(heldTimer);
  heldTimer = null;
  if (!held || held.count < 2) {
    held = null;
    return;
  }
  const line = Object.assign({}, held.line, { repeat: held.count });
  held = null;
  emit(line);
}

function logError(where, err, extra) {
  const status = err && err.status;
  const message = scrub(err && err.message ? String(err.message) : String(err || ""));
  const line = {
    t: new Date().toISOString(),
    level: (where === "client" || (status && status < 500) || /не задан|forbidden|исчерпан|долгий/.test(message)) ? "warn" : "error",
    where: where,
    message: message
  };
  if (status) line.status = status;
  if (err && err.ms) line.ms = err.ms;
  if (err && err.code) line.code = err.code;
  if (err && err.detail) line.detail = scrub(err.detail).slice(0, 180);
  if (extra) line.extra = scrub(extra).slice(0, 180);
  const key = line.level + "\n" + line.where + "\n" + line.message + "\n" + (line.status || "") + "\n" + (line.extra || "");
  if (held && held.key === key) {
    held.count++;
    held.line.t = line.t;
    return;
  }
  flushHeld();
  held = { key: key, line: line, count: 1 };
  emit(line);
  heldTimer = setTimeout(flushHeld, 60000);
  if (heldTimer.unref) heldTimer.unref();
}

function scheduleFile() {
  return process.env.TRAVELEK_SCHEDULES || path.join(root, "data", "schedules.json");
}

function readDb() {
  try {
    const db = JSON.parse(fs.readFileSync(scheduleFile(), "utf8"));
    return db && typeof db === "object" ? db : {};
  } catch (err) {
    if (!err || err.code !== "ENOENT") logError("schedules", err);
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
      airlineIata: airlineIata(row.airline),
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

function airlineIata(value) {
  if (!value || typeof value === "string") return "";
  const code = String(value.iata || value.iataCode || "").toUpperCase();
  return /^[A-Z0-9]{2}$/.test(code) ? code : "";
}

function runtimeKeys(extra) {
  const list = [];
  function add(value) {
    const key = String(value || "").trim();
    if (key && list.indexOf(key) < 0) list.push(key);
  }
  add(extra);
  ["AERODATABOX_KEY", "AERODATABOX_KEY_2", "AERODATABOX_KEY_3"].forEach(function (name) { add(process.env[name]); });
  return list;
}

async function loadBoard(from, to, date, key) {
  const windows = [[date + "T00:00", date + "T11:59"], [date + "T12:00", date + "T23:59"]];
  const settled = await Promise.allSettled(windows.map(function (span) {
    return board(from, span[0], span[1], key);
  }));
  const ok = settled.filter(function (item) { return item.status === "fulfilled"; });
  settled.forEach(function (item) {
    if (item.status === "rejected" && ok.length) logError("flights", item.reason, from + " " + to + " " + date + " half");
  });
  if (!ok.length) throw (settled[0] && settled[0].reason) || new Error("upstream");
  const seen = {};
  const flights = [];
  ok.forEach(function (item) {
    pickFlights(item.value, to).forEach(function (row) {
      if (seen[row.flight]) return;
      seen[row.flight] = 1;
      flights.push(row);
    });
  });
  flights.sort(function (a, b) { return a.time.localeCompare(b.time); });
  return flights;
}

function flightMessage(err) {
  const status = err && err.status;
  const detail = err && err.detail ? ": " + err.detail : "";
  if (status === 401 || status === 403) return "Ключ AeroDataBox не принят" + detail;
  return "Расписание не ответило" + (status ? " (" + status + ")" : "") + detail;
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
  const keys = Array.isArray(key) ? key.filter(Boolean) : (key ? [String(key).trim()] : []).filter(Boolean);
  const route = from + " " + to + " " + date;
  if (!keys.length) {
    logError("flights", new Error("AERODATABOX_KEY не задан"), route);
    return { status: 503, body: { error: "В Layero не задан ключ AERODATABOX_KEY" } };
  }
  if (!allowSearch()) {
    logError("flights", new Error("Лимит поисков на этот месяц исчерпан"), route);
    return { status: 429, body: { error: "Лимит поисков на этот месяц исчерпан" } };
  }
  const started = Date.now();
  let last = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      const flights = await loadBoard(from, to, date, keys[i]);
      const ms = Date.now() - started;
      if (ms > 8000) logError("flights", Object.assign(new Error("долгий ответ AeroDataBox"), { ms: ms }), route);
      let savedOk = true;
      try { writeSchedule(from, to, date, flights); }
      catch (err) {
        savedOk = false;
        logError("schedules", err, route);
      }
      return { status: 200, body: { flights: flights, saved: savedOk } };
    } catch (err) {
      last = err;
      if (err) err.ms = Date.now() - started;
      logError("flights", err, route + " ключ " + (i + 1));
      const status = err && err.status;
      if (status === 429 || status === 401 || status === 403 || status === 451) continue;
      break;
    }
  }
  return { status: 502, body: { error: flightMessage(last) } };
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

function pipeFile(req, res, full, gzip) {
  const stream = fs.createReadStream(full);
  stream.on("error", function (err) {
    logError("file", err, req.url);
    if (res.headersSent) res.destroy();
    else {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("error");
    }
  });
  if (!gzip) {
    stream.pipe(res);
    return;
  }
  const zip = zlib.createGzip({ level: 6 });
  zip.on("error", function (err) {
    logError("file", err, req.url);
    res.destroy();
  });
  stream.pipe(zip).pipe(res);
}

function serveFile(req, res) {
  const full = filePath(req.url || "/");
  if (!full) {
    logError("file", new Error("forbidden"), req.url);
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  fs.stat(full, function (err, stat) {
    if (err || !stat.isFile()) {
      if (err && err.code !== "ENOENT") logError("file", err, req.url);
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const type = types[path.extname(full).toLowerCase()] || "application/octet-stream";
    const ext = path.extname(full).toLowerCase();
    const headers = { "content-type": type };
    headers["cache-control"] = ext === ".html" ? "no-cache" : "public, max-age=604800";
    const accept = String(req.headers["accept-encoding"] || "");
    const text = ext === ".html" || ext === ".js" || ext === ".json" || ext === ".svg" || ext === ".css";
    if (text && stat.size > 2048 && /\bgzip\b/.test(accept)) {
      headers["content-encoding"] = "gzip";
      headers.vary = "Accept-Encoding";
      res.writeHead(200, headers);
      pipeFile(req, res, full, true);
      return;
    }
    res.writeHead(200, headers);
    pipeFile(req, res, full, false);
  });
}

const clientHits = new Map();
function allowClientLog() {
  const minute = Math.floor(Date.now() / 60000);
  const used = clientHits.get(minute) || 0;
  if (used >= 30) return false;
  clientHits.set(minute, used + 1);
  return true;
}

function readClientLog(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    let size = 0;
    req.on("data", function (chunk) {
      size += chunk.length;
      if (size > 800) {
        reject(new Error("слишком большой"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

export function createServer() {
  const server = http.createServer(function (req, res) {
    const url = new URL(req.url || "/", "http://localhost");
    res.on("error", function (err) { logError("response", err, req.url); });
    if (url.pathname === "/api/aero-key") {
      sendJson(res, 200, { ready: runtimeKeys().length > 0 });
      return;
    }
    if (url.pathname === "/api/client-log" && req.method === "POST") {
      readClientLog(req).then(function (data) {
        if (!allowClientLog()) {
          sendJson(res, 429, { error: "много сообщений" });
          return;
        }
        const where = String(data.where || "browser").replace(/[^\w.-]/g, "").slice(0, 24) || "browser";
        const message = String(data.message || "").replace(/\s+/g, " ").trim().slice(0, 180);
        if (message) logError("browser", new Error(where + ": " + message));
        res.writeHead(204);
        res.end();
      }).catch(function () {
        sendJson(res, 400, { error: "плохой журнал" });
      });
      return;
    }
    if (url.pathname === "/api/flights") {
      searchFlights(url.searchParams, runtimeKeys(req.headers["x-aero-key"])).then(function (result) {
        sendJson(res, result.status || 200, result.body || {});
      }).catch(function (err) {
        logError("flights", err, url.search);
        sendJson(res, 500, { error: "Ошибка сервера" });
      });
      return;
    }
    if (url.pathname === "/favicon.ico") req.url = "/favicon.svg";
    serveFile(req, res);
  });
  server.on("clientError", function (err, socket) {
    logError("client", err);
    if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
  });
  server.on("error", function (err) { logError("listen", err); });
  return server;
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked || process.env.TRAVELEK_LOG) openLog();
if (invoked) {
  process.on("beforeExit", flushHeld);
  process.on("SIGTERM", function () { flushHeld(); process.exit(0); });
  process.on("SIGINT", function () { flushHeld(); process.exit(0); });
  process.on("uncaughtException", function (err) {
    logError("uncaught", err);
    process.exit(1);
  });
  process.on("unhandledRejection", function (err) {
    logError("rejection", err);
  });
  createServer().listen(port, "0.0.0.0", function () {
    console.log("travelek " + port);
  });
}
