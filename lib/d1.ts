export function getD1(): D1Database | null {
  // 1. Direct Cloudflare Pages context lookup via Symbol
  try {
    const symbolKey = Symbol.for("__cloudflare-request-context__");
    const ctx = (globalThis as any)[symbolKey];
    if (ctx && ctx.env && ctx.env.DB) {
      return ctx.env.DB as D1Database;
    }
  } catch {}

  // 2. Global and process.env bindings
  if (typeof (globalThis as any).DB !== "undefined") {
    return (globalThis as any).DB as D1Database;
  }
  if (typeof (process.env as any)?.DB !== "undefined") {
    return (process.env as any).DB as D1Database;
  }

  return null;
}
