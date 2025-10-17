// netlify/functions/server.ts
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, path: event.path, method: event.httpMethod }),
  };
};
