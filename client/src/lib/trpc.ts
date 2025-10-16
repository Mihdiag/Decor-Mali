// src/lib/trpc.ts
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

function getTrpcUrl() {
  // En production (Netlify), on appelle la Function "api"
  // => /.netlify/functions/api/trpc
  if (import.meta.env.PROD) return "/.netlify/functions/api/trpc";
  // Si jamais tu testes un preview local un jour:
  return "http://localhost:8888/.netlify/functions/api/trpc";
}

export const trpcClientOptions = {
  transformer: superjson,
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
      fetch(url, opts) {
        // credentials facultatif selon ton auth ; garde-le si tu utilises des cookies
        return fetch(url, { ...opts, credentials: "include" });
      },
    }),
  ],
} as const;
