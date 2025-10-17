// netlify/functions/api.ts
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { appRouter } from "../../server/routers"; // <— CHEMIN CORRIGÉ

// Contexte minimal : suffisant pour les procédures publiques (pricing, quotes.create)
type Ctx = { user?: { id: string; role: "admin" | "user" } | null };

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: async (): Promise<Ctx> => ({ user: null }),
});
