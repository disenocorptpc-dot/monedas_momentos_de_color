import { getRequestContext } from "@cloudflare/next-on-pages";

export function getD1(): D1Database | null {
  try {
    const ctx = getRequestContext();
    if (ctx && ctx.env && (ctx.env as any).DB) {
      return (ctx.env as any).DB as D1Database;
    }
  } catch {
    // getRequestContext may throw outside of an edge request context
  }

  // Fallbacks
  if (typeof (globalThis as any).DB !== "undefined") {
    return (globalThis as any).DB as D1Database;
  }
  if (typeof (process.env as any)?.DB !== "undefined") {
    return (process.env as any).DB as D1Database;
  }

  return null;
}
