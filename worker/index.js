function cors(res){
  var h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  h.set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  h.set("Cache-Control", "no-store");
  return new Response(res.body, { status: res.status, headers: h });
}
function json(data, status){
  return cors(new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  }));
}
function allowed(req, env){
  var key = env.WRITE_KEY || "";
  if(!key) return false;
  var auth = req.headers.get("Authorization") || "";
  return auth === "Bearer " + key;
}
async function readBin(env){
  var url = env.KEEPJSON_URL;
  if(!url) throw new Error("no bin");
  var r = await fetch(url, { cache: "no-store" });
  if(!r.ok) throw new Error("bin");
  return r.json();
}
async function writeBin(env, body){
  var r = await fetch(env.KEEPJSON_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + env.KEEPJSON_KEY
    },
    body: JSON.stringify(body)
  });
  if(!r.ok) throw new Error("bin");
}
async function ensureSchema(db){
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, body TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS diaries (user_id TEXT PRIMARY KEY, body TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS tombstones (id TEXT PRIMARY KEY)")
  ]);
}
async function d1Empty(db){
  var row = await db.prepare("SELECT COUNT(*) AS n FROM users").first();
  return !row || !row.n;
}
async function d1Read(db){
  var users = await db.prepare("SELECT body FROM users").all();
  var diaries = await db.prepare("SELECT user_id, body FROM diaries").all();
  var dead = await db.prepare("SELECT id FROM tombstones").all();
  var vault = {};
  (diaries.results || []).forEach(function(row){
    try{ vault[row.user_id] = JSON.parse(row.body); }catch(e){}
  });
  return {
    users: (users.results || []).map(function(row){ try{ return JSON.parse(row.body); }catch(e){ return null; } }).filter(Boolean),
    vault: vault,
    deleted: (dead.results || []).map(function(row){ return row.id; })
  };
}
async function d1Write(db, data){
  var stmts = [
    db.prepare("DELETE FROM users"),
    db.prepare("DELETE FROM diaries"),
    db.prepare("DELETE FROM tombstones")
  ];
  (data.users || []).forEach(function(u){
    if(!u || !u.id) return;
    stmts.push(db.prepare("INSERT INTO users (id, body) VALUES (?, ?)").bind(u.id, JSON.stringify(u)));
  });
  var vault = data.vault && typeof data.vault === "object" ? data.vault : {};
  Object.keys(vault).forEach(function(id){
    stmts.push(db.prepare("INSERT INTO diaries (user_id, body) VALUES (?, ?)").bind(id, JSON.stringify(vault[id])));
  });
  (data.deleted || []).forEach(function(id){
    if(id) stmts.push(db.prepare("INSERT INTO tombstones (id) VALUES (?)").bind(id));
  });
  await db.batch(stmts);
}
async function fromD1(env){
  await ensureSchema(env.DB);
  if(await d1Empty(env.DB) && env.KEEPJSON_URL){
    var seed = await readBin(env);
    await d1Write(env.DB, seed);
  }
  return d1Read(env.DB);
}

export default {
  async fetch(req, env){
    if(req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    var path = new URL(req.url).pathname;
    if(path !== "/" && path !== "/diary") return json({ error: "not found" }, 404);
    try{
      if(req.method === "GET"){
        if(env.DB) return json(await fromD1(env));
        return json(await readBin(env));
      }
      if(req.method === "PUT"){
        if(!allowed(req, env)) return json({ error: "forbidden" }, 401);
        var body = await req.json();
        if(!body || !Array.isArray(body.users)) return json({ error: "bad" }, 400);
        if(env.DB){
          await ensureSchema(env.DB);
          await d1Write(env.DB, body);
          return json({ ok: true });
        }
        await writeBin(env, { users: body.users, vault: body.vault || {}, deleted: body.deleted || [] });
        return json({ ok: true });
      }
      return json({ error: "method" }, 405);
    }catch(e){
      return json({ error: "store" }, 502);
    }
  }
};
