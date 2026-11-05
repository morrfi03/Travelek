/* Preview-only probe. Not login, not a diary, not durable storage. */
"use strict";

const http = require("node:http");
const crypto = require("node:crypto");

const COOKIE = "travelek_preview";
const TTL_MS = 10 * 60 * 1000;
const sessions = new Map();

function prune(now) {
  for (const [id, exp] of sessions) {
    if (exp <= now) sessions.delete(id);
  }
}

function cookies(header) {
  const out = Object.create(null);
  if (!header) return out;
  for (const part of String(header).split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const key = part.slice(0, i).trim();
    if (key) out[key] = part.slice(i + 1).trim();
  }
  return out;
}

function routePath(pathname) {
  let path = pathname || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path === "/api") return "/";
  if (path.startsWith("/api/")) return path.slice(4);
  return path;
}

function send(res, status, body, headers) {
  const payload = JSON.stringify(body);
  res.writeHead(status, Object.assign({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  }, headers));
  res.end(payload);
}

function sessionId(raw) {
  return /^[a-f0-9]{64}$/.test(raw || "") ? raw : "";
}

const server = http.createServer((req, res) => {
  req.resume();
  let url;
  try {
    url = new URL(req.url || "/", "http://127.0.0.1");
  } catch {
    send(res, 400, { ok: false, error: "bad_url" });
    return;
  }
  const path = routePath(url.pathname);
  const method = req.method || "GET";
  const now = Date.now();
  prune(now);
  const sid = sessionId(cookies(req.headers.cookie)[COOKIE]);
  const valid = !!(sid && sessions.get(sid) > now);

  if (method === "GET" && path === "/health") {
    send(res, 200, { ok: true, service: "travelek-api" });
    return;
  }
  if (method === "POST" && path === "/preview/session") {
    const id = crypto.randomBytes(32).toString("hex");
    sessions.set(id, now + TTL_MS);
    send(res, 200, { ok: true, set: true }, {
      "set-cookie": COOKIE + "=" + id + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600"
    });
    return;
  }
  if (method === "GET" && path === "/preview/session") {
    send(res, 200, { ok: true, present: !!sid, valid: valid });
    return;
  }
  if (method === "POST" && path === "/preview/session/logout") {
    if (sid) sessions.delete(sid);
    send(res, 200, { ok: true, cleared: true }, {
      "set-cookie": COOKIE + "=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    });
    return;
  }
  send(res, 404, { ok: false, error: "not_found" });
});

const port = Number(process.env.PORT || 8787);
server.listen(port, "0.0.0.0");
