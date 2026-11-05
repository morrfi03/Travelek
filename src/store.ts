import type { Account, CloudVault, DiaryPack } from "./model.js";

const VLAD_HASH = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";

export function jsonList(raw: unknown): unknown[] {
  try {
    const parsed = JSON.parse(typeof raw === "string" ? raw : "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function readDiary(pack: DiaryPack | null | undefined) {
  const bag = pack || {};
  return {
    routes: jsonList(bag["travelek-extra"]),
    deleted: jsonList(bag["travelek-del"]),
    trips: jsonList(bag["travelek-trips"]),
    countries: jsonList(bag["travelek-countries"]),
    regions: jsonList(bag["travelek-regions"])
  };
}

function packRev(pack: DiaryPack | null | undefined): number {
  const n = parseInt(String(pack && pack["travelek-rev"] || ""), 10);
  return isNaN(n) ? 0 : n;
}

function markCount(pack: DiaryPack | null | undefined): number {
  return jsonList(pack && pack["travelek-countries"]).length
    + jsonList(pack && pack["travelek-regions"]).length
    + jsonList(pack && pack["travelek-extra"]).length;
}

export function preferPack<T extends DiaryPack | null | undefined>(a: T, b: T): T | null {
  if (!a) return b || null;
  if (!b) return a;
  const ar = packRev(a);
  const br = packRev(b);
  if (ar !== br) return ar > br ? a : b;
  return markCount(a) >= markCount(b) ? a : b;
}

export function nickIsAdmin(user: Account | null | undefined): boolean {
  if (!user) return false;
  const login = String(user.login || user.email || "").toLowerCase().replace(/@travelek\.app$/, "").trim();
  return login === "admin";
}

export function copyUser(user: Account): Account {
  const login = String(user.login || user.email || "").replace(/@travelek\.app$/, "").trim();
  return {
    id: user.id,
    login: login,
    name: user.name || login,
    password: user.password,
    role: nickIsAdmin(user) ? "admin" : "user",
    mustChange: !!user.mustChange,
    rev: user.rev || 0,
    vladReset: user.vladReset || ""
  };
}

export function repairVlad(list: Account[] | null | undefined): boolean {
  let changed = false;
  for (let i = 0; i < (list || []).length; i++) {
    const user = list[i];
    if (!user || String(user.login || "").toLowerCase() !== "vlad100" || user.vladReset === "1") continue;
    user.password = VLAD_HASH;
    user.mustChange = false;
    user.role = "user";
    user.rev = Date.now();
    user.vladReset = "1";
    changed = true;
  }
  return changed;
}

export function mergeUsers(remoteUsers: Account[] | null | undefined, remoteDeleted: string[] | null | undefined, localUsers: Account[] | null | undefined) {
  const gone: Record<string, 1> = {};
  const out: Account[] = [];
  const by: Record<string, Account> = {};
  (remoteDeleted || []).forEach(function (id) { if (id) gone[id] = 1; });
  function addRemote(user: Account) {
    if (!user || !user.id || gone[user.id]) return;
    const copy = copyUser(user);
    by[copy.id] = copy;
    out.push(copy);
  }
  (remoteUsers || []).forEach(addRemote);
  const local = localUsers || [];
  for (let i = 0; i < local.length; i++) {
    const user = local[i];
    if (!user || !user.id || gone[user.id]) continue;
    if (!by[user.id]) {
      const copy = copyUser(user);
      by[copy.id] = copy;
      out.push(copy);
      continue;
    }
    if ((user.rev || 0) > (by[user.id].rev || 0)) {
      const kept = by[user.id];
      if (user.login) kept.login = user.login;
      if (user.name) kept.name = user.name;
      if (user.password) kept.password = user.password;
      kept.role = nickIsAdmin(user) ? "admin" : "user";
      kept.mustChange = !!user.mustChange;
      kept.rev = user.rev;
      if (user.vladReset) kept.vladReset = user.vladReset;
    }
  }
  return { users: out, deleted: Object.keys(gone) };
}

export function readStoreDocument(data: unknown): { users: Account[]; deleted: string[]; vault: CloudVault } | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const doc = data as { users?: unknown; deleted?: unknown; vault?: unknown };
  if (!Array.isArray(doc.users)) return null;
  const deleted = Array.isArray(doc.deleted) ? doc.deleted.slice() : [];
  const vault = doc.vault && typeof doc.vault === "object" && !Array.isArray(doc.vault) ? doc.vault as CloudVault : {};
  return { users: doc.users as Account[], deleted: deleted as string[], vault: vault };
}
