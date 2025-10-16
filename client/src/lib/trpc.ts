// src/lib/trpc.ts
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClientOptions = {
  transformer: superjson,
  links: [
    httpBatchLink({
      // En prod Netlify on passe par la Function "api" via /trpc (voir redir. ci-dessous)
      url: import.meta.env.PROD ? "/trpc" : "http://localhost:8888/trpc",
      fetch(url, opts) {
        return fetch(url, { ...opts, credentials: "include" });
      },
    }),
  ],
} as const;
