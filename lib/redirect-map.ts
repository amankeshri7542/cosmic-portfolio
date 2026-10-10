import "server-only";
import { hasDatabase, sql } from "./db";

// Renamed articles: old slug → new slug. Read in the proxy so a moved URL answers with a real 308
// before any rendering starts. Kept in memory for a few seconds per server instance.
const TTL_MS = 10_000;
let cached: { at: number; map: Map<string, string> } | null = null;
let loading: Promise<Map<string, string>> | null = null;

export async function slugRedirects(): Promise<Map<string, string>> {
  if (!hasDatabase()) return new Map();
  if (cached && Date.now() - cached.at < TTL_MS) return cached.map;
  loading ??= sql()<{ from_slug: string; to_slug: string }[]>`SELECT from_slug, to_slug FROM portfolio_slug_redirects`
    .then((rows) => {
      const map = new Map(rows.map((r) => [r.from_slug, r.to_slug]));
      cached = { at: Date.now(), map };
      return map;
    })
    .catch(() => cached?.map ?? new Map<string, string>())
    .finally(() => { loading = null; });
  return loading;
}
