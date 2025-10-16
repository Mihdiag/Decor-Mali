// netlify/functions/api.ts
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { appRouter } from "../../src/server/routers";               // adapte le chemin si besoin
import type { TrpcContext } from "../../src/server/_core/context";   // adapte le chemin
import { createContext } from "../../src/server/_core/context";      // si tu as déjà createContext

// Si tu n'as pas de createContext exporté, décommente ce fallback minimal :
// const createContext = async (): Promise<TrpcContext> => ({ user: null } as any);

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: async (event, context): Promise<TrpcContext> => {
    // Passe tout ce dont ton createContext a besoin (headers, cookies...)
    return createContext({ event, context, headers: event.headers as any } as any);
  },
});
