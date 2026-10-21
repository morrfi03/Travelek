import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

const ADMIN_EMAIL = "admin@travelek.app";
const ADMIN_PASSWORD = "Travelek#Admin89";
const ADMIN_NAME = "Администратор";

export type DiaryPack = {
  data: Record<string, string | null>;
  role: "admin" | "user";
  name: string;
  email: string;
  empty: boolean;
};

export type AccountStat = {
  userId: string;
  email: string;
  name: string;
  role: string;
  routes: number;
  countries: number;
  regions: number;
  kmPlane: number;
  kmTrain: number;
  kmCar: number;
};

function asEmail(login: string) {
  const t = login.trim().toLowerCase();
  if (!t) return "";
  return t.includes("@") ? t : `${t}@travelek.app`;
}

function numFrom(raw: string | null | undefined) {
  try {
    const list = JSON.parse(raw || "[]");
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

function kmOf(text: unknown) {
  const m = String(text || "").replace(/\s/g, "").match(/([\d.]+)км/i);
  return m ? Number(m[1]) || 0 : 0;
}

function summarize(raw: string | null): Omit<AccountStat, "userId" | "email" | "name" | "role"> {
  let routes: Array<{ mode?: string; duration?: string }> = [];
  try {
    const data = JSON.parse(raw || "{}") as Record<string, string | null>;
    routes = JSON.parse(data["travelek-extra"] || "[]");
    if (!Array.isArray(routes)) routes = [];
    const deleted = new Set<string>(JSON.parse(data["travelek-del"] || "[]"));
    routes = routes.filter((r) => r && !deleted.has(String((r as { id?: string }).id || "")));
    let kmPlane = 0, kmTrain = 0, kmCar = 0;
    for (const r of routes) {
      const km = kmOf(r.duration);
      if (r.mode === "plane") kmPlane += km;
      else if (r.mode === "train") kmTrain += km;
      else if (r.mode === "car") kmCar += km;
    }
    return {
      routes: routes.length,
      countries: numFrom(data["travelek-countries"]),
      regions: numFrom(data["travelek-regions"]),
      kmPlane: Math.round(kmPlane),
      kmTrain: Math.round(kmTrain),
      kmCar: Math.round(kmCar),
    };
  } catch {
    return { routes: 0, countries: 0, regions: 0, kmPlane: 0, kmTrain: 0, kmCar: 0 };
  }
}

let ready: Promise<void> | null = null;

async function ensureAdmin() {
  if (!ready) {
    ready = seedAdmin().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

async function seedAdmin() {
  const { getSql } = await import("@/lib/db");
  const { auth } = await import("@/lib/auth/server");
  const sql = await getSql();
  const have = await sql<{ user_id: string }>`select user_id from profiles where role = 'admin' limit 1`;
  if (have.length) return;
  let id = "";
  try {
    const res = await auth.api.signUpEmail({
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME },
      headers: new Headers({ origin: "http://127.0.0.1:8080" }),
    });
    id = res?.user?.id || "";
  } catch {
    const rows = await sql<{ id: string }>`select id from "user" where email = ${ADMIN_EMAIL} limit 1`;
    id = rows[0]?.id || "";
  }
  if (!id) return;
  await sql`
    insert into profiles (user_id, email, display_name, role)
    values (${id}, ${ADMIN_EMAIL}, ${ADMIN_NAME}, 'admin')
    on conflict (user_id) do update set role = 'admin', display_name = ${ADMIN_NAME}
  `;
}

async function wipeDiariesOnce() {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`create table if not exists app_meta (k text primary key, v text not null)`;
  const rows = await sql<{ v: string }>`select v from app_meta where k = 'wipe'`;
  if (rows[0]?.v === "2") return;
  await sql`delete from diaries`;
  await sql`
    insert into app_meta (k, v) values ('wipe', '2')
    on conflict (k) do update set v = '2'
  `;
}

async function profileOf(userId: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ role: string; display_name: string; email: string }>`
    select role, display_name, email from profiles where user_id = ${userId} limit 1
  `;
  return rows[0] || null;
}

export const prepareAuth = createServerFn({ method: "POST" }).handler(async () => {
  await ensureAdmin();
  return { ok: true as const };
});

export const loadMine = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DiaryPack> => {
    await ensureAdmin();
    await wipeDiariesOnce();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await profileOf(context.userId);
    const rows = await sql<{ data: string }>`select data from diaries where user_id = ${context.userId} limit 1`;
    let data: Record<string, string | null> = {};
    try {
      data = JSON.parse(rows[0]?.data || "{}");
    } catch {
      data = {};
    }
    return {
      data,
      role: me?.role === "admin" ? "admin" : "user",
      name: me?.display_name || "",
      email: me?.email || "",
      empty: !data["travelek-extra"],
    };
  });

export const saveDiary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: Record<string, string | null>) => {
    if (!data || typeof data !== "object") return {};
    const out: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(data)) {
      if (!k.startsWith("travelek-")) continue;
      out[k] = v == null ? null : String(v).slice(0, 2_000_000);
    }
    return out;
  })
  .handler(async ({ context, data }) => {
    await ensureAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const payload = JSON.stringify(data);
    await sql`
      insert into diaries (user_id, data, updated_at)
      values (${context.userId}, ${payload}, now())
      on conflict (user_id) do update set data = ${payload}, updated_at = now()
    `;
    return { ok: true };
  });

export const renameMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((name: string) => {
    const n = String(name || "").trim().slice(0, 80);
    if (!n) throw new Error("Введите имя");
    return n;
  })
  .handler(async ({ context, data: name }) => {
    const { getSql } = await import("@/lib/db");
    const { auth } = await import("@/lib/auth/server");
    const sql = await getSql();
    await sql`update profiles set display_name = ${name} where user_id = ${context.userId}`;
    try {
      await auth.api.updateUser({ body: { name }, headers: new Headers() });
    } catch {
      /* profile row is the name the diary shows */
    }
    return { ok: true, name };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccountStat[]> => {
    await ensureAdmin();
    const me = await profileOf(context.userId);
    if (me?.role !== "admin") throw new Error("Только администратор");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ user_id: string; email: string; display_name: string; role: string; data: string | null }>`
      select p.user_id, p.email, p.display_name, p.role, d.data
      from profiles p
      left join diaries d on d.user_id = p.user_id
      order by p.role desc, p.display_name
    `;
    return rows.map((r) => ({
      userId: r.user_id,
      email: r.email,
      name: r.display_name,
      role: r.role,
      ...summarize(r.data),
    }));
  });

export const adminDiary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((userId: string) => {
    const id = String(userId || "").trim();
    if (!id) throw new Error("Нет пользователя");
    return id;
  })
  .handler(async ({ context, data: userId }): Promise<DiaryPack> => {
    await ensureAdmin();
    const me = await profileOf(context.userId);
    if (me?.role !== "admin") throw new Error("Только администратор");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const who = await profileOf(userId);
    if (!who) throw new Error("Пользователь не найден");
    const rows = await sql<{ data: string }>`select data from diaries where user_id = ${userId} limit 1`;
    let data: Record<string, string | null> = {};
    try { data = JSON.parse(rows[0]?.data || "{}"); } catch { data = {}; }
    return {
      data,
      role: who.role === "admin" ? "admin" : "user",
      name: who.display_name,
      email: who.email,
      empty: !data["travelek-extra"],
    };
  });

export const createAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { login: string; password: string; name: string }) => {
    const login = String(input?.login || "").trim();
    const password = String(input?.password || "");
    const name = String(input?.name || "").trim().slice(0, 80);
    if (login.length < 2) throw new Error("Логин слишком короткий");
    if (password.length < 8) throw new Error("Пароль короче 8 символов");
    if (!name) throw new Error("Нужно имя");
    return { login, password, name };
  })
  .handler(async ({ context, data }) => {
    await ensureAdmin();
    const me = await profileOf(context.userId);
    if (me?.role !== "admin") throw new Error("Только администратор может создавать аккаунты");
    const email = asEmail(data.login);
    const { auth } = await import("@/lib/auth/server");
    const { getSql } = await import("@/lib/db");
    let id = "";
    try {
      const res = await auth.api.signUpEmail({
        body: { email, password: data.password, name: data.name },
        headers: new Headers({ origin: "http://127.0.0.1:8080" }),
      });
      id = res?.user?.id || "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/exist/i.test(msg)) throw new Error("Такой логин уже есть");
      throw new Error("Не удалось создать аккаунт");
    }
    if (!id) throw new Error("Не удалось создать аккаунт");
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, email, display_name, role)
      values (${id}, ${email}, ${data.name}, 'user')
      on conflict (user_id) do nothing
    `;
    return { ok: true, email };
  });
