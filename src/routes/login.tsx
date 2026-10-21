import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function asEmail(login: string) {
  const t = login.trim().toLowerCase();
  if (!t) return "";
  return t.includes("@") ? t : `${t}@travelek.app`;
}

function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="login-screen">
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
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
            setErr("Неверный логин или пароль");
            return;
          }
          window.location.href = "/";
        }}
      >
        <h1>ТравелЕк</h1>
        <p>Вход в дневник. Новые аккаунты создаёт только администратор.</p>
        <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" autoComplete="username" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password" autoComplete="current-password" />
        {err ? <div className="login-err">{err}</div> : null}
        <button type="submit" disabled={busy}>{busy ? "Входим…" : "Войти"}</button>
      </form>
    </main>
  );
}
