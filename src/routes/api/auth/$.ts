import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => {
        const url = new URL(request.url);
        if (url.pathname.includes("/sign-up")) {
          return new Response(
            JSON.stringify({ message: "Регистрация закрыта. Аккаунт создаёт администратор." }),
            { status: 403, headers: { "content-type": "application/json" } },
          );
        }
        return auth.handler(request);
      },
    },
  },
});
