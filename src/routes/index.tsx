import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import markup from "../travel/markup.html?raw";
import "leaflet/dist/leaflet.css";
import { authClient } from "@/lib/auth/client";
import { signOut } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminDiary, createAccount, loadMine, renameMe, saveDiary, adminOverview, prepareAuth } from "@/lib/diary.functions";
import { createPortal } from "react-dom";

export const Route = createFileRoute("/")({
  component: Home,
});

const KEYS = [
  "travelek-extra",
  "travelek-del",
  "travelek-app-settings",
  "travelek-mapprefs",
  "travelek-theme",
  "travelek-theme-pref",
  "travelek-countries",
  "travelek-countries-off",
  "travelek-regions",
  "travelek-regions-off",
];

function asEmail(login: string) {
  const t = login.trim().toLowerCase();
  if (!t) return "";
  return t.includes("@") ? t : `${t}@travelek.app`;
}

function applyPack(data: Record<string, string | null> | undefined) {
  for (const key of KEYS) {
    const value = data?.[key];
    if (typeof value === "string") localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  }
}

type CloudWindow = Window & {
  __TRAVELEK_PRIVATE?: boolean;
  __TRAVELEK_SEED?: boolean;
  __TRAVELEK_READONLY?: boolean;
  __TRAVELEK_VIEW_NAME?: string;
  __TRAVELEK_ME?: { id: string; email: string; name: string; role: string };
  __cloudPush?: (data: Record<string, string | null>) => void;
  __cloudAdmin?: () => Promise<unknown>;
  __cloudCreate?: (login: string, password: string, name: string) => Promise<unknown>;
  __cloudRename?: (name: string) => Promise<unknown>;
  __openDiary?: (userId: string) => void;
  __exitView?: () => void;
  __signOut?: () => void;
  __changePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
};

let bootKey = "";

function Home() {
  const { user, isPending } = useCurrentUserState();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [ready, setReady] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!user) {
      bootKey = "";
      setReady(false);
      return;
    }
    const view = sessionStorage.getItem("travelek-view") || "";
    const key = user.id + ":" + view;
    if (bootKey === key) return;
    bootKey = key;
    let cancel = false;
    const w = window as CloudWindow;
    (async () => {
      const mine = await loadMine();
      if (cancel) return;
      let pack = mine;
      let readonly = false;
      if (view && mine.role === "admin" && view !== user.id) {
        pack = await adminDiary({ data: view });
        readonly = true;
      }
      if (cancel) return;
      applyPack(pack.data);
      w.__TRAVELEK_PRIVATE = true;
      w.__TRAVELEK_SEED = false;
      w.__TRAVELEK_READONLY = readonly;
      w.__TRAVELEK_VIEW_NAME = readonly ? pack.name || pack.email : "";
      w.__TRAVELEK_ME = {
        id: user.id,
        email: mine.email || user.primaryEmail || "",
        name: mine.name || user.displayName || "",
        role: mine.role,
      };
      w.__cloudPush = (data) => {
        if (w.__TRAVELEK_READONLY) return;
        void saveDiary({ data }).catch(() => {});
      };
      w.__cloudAdmin = () => adminOverview();
      w.__cloudCreate = (loginName, pass, name) => createAccount({ data: { login: loginName, password: pass, name } });
      w.__cloudRename = (name) => renameMe({ data: name });
      w.__openDiary = (userId) => {
        sessionStorage.setItem("travelek-view", userId);
        bootKey = "";
        window.location.reload();
      };
      w.__exitView = () => {
        sessionStorage.removeItem("travelek-view");
        bootKey = "";
        window.location.reload();
      };
      w.__signOut = () => {
        sessionStorage.removeItem("travelek-view");
        for (const k of KEYS) localStorage.removeItem(k);
        void signOut("/");
      };
      w.__changePassword = async (currentPassword, newPassword) => {
        const { error } = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });
        if (error) throw new Error(error.message || "Не удалось сменить пароль");
      };
      if (document.querySelector("script[data-travelek]")) {
        window.location.reload();
        return;
      }
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "/vendor/leaflet.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("leaflet"));
        document.body.appendChild(s);
      });
      if (cancel) return;
      const app = document.createElement("script");
      app.src = "/travelek.js?v=18";
      app.async = true;
      app.dataset.travelek = "1";
      document.body.appendChild(app);
      setReady(true);
    })().catch(() => {
      if (!cancel) setErr("Не удалось открыть дневник");
    });
    return () => {
      cancel = true;
    };
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      setSlot(document.getElementById("account-userbtn"));
    }, 400);
    setSlot(document.getElementById("account-userbtn"));
    return () => window.clearInterval(id);
  }, [ready]);

  if (isPending) {
    return <main className="login-screen"><p className="login-wait">Открываем дневник…</p></main>;
  }

  if (!user) {
    return (
      <main className="login-screen">
        <form
          className="login-card"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            try { await prepareAuth(); } catch { /* вход сам покажет ошибку */ }
            const email = asEmail(login);
            const { error } = await authClient.signIn.email(
              { email, password },
              {
                onSuccess(ctx) {
                  const token = ctx.response.headers.get("set-auth-token");
                  if (token) {
                    try { sessionStorage.setItem("grok-auth.bearer-token", token); } catch { /* ignore */ }
                  }
                },
              },
            );
            setBusy(false);
            if (error) {
              const msg = String(error.message || "");
              setErr(/origin|forbidden/i.test(msg) ? "Сервер не принял адрес страницы. Обновите её и попробуйте ещё раз." : "Неверный логин или пароль");
            } else window.location.reload();
          }}
        >
          <h1>ТравелЕк</h1>
          <p>Каждый видит только свой дневник. Новый аккаунт может создать только администратор.</p>
          <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" autoComplete="username" />
          <div className="passline">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type={showPass ? "text" : "password"} autoComplete="current-password" />
            <button type="button" className="eye" onClick={() => setShowPass((v) => !v)}>{showPass ? "Скрыть" : "Показать"}</button>
          </div>
          {err ? <div className="login-err">{err}</div> : null}
          <button type="submit" disabled={busy}>{busy ? "Входим…" : "Войти"}</button>
        </form>
      </main>
    );
  }

  return (
    <>
      <div className="travelek-host" dangerouslySetInnerHTML={{ __html: markup }} />
      {slot ? createPortal(<UserButton />, slot) : null}
    </>
  );
}
