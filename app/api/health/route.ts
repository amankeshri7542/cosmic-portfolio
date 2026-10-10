import { connection } from "next/server";
import { hasDatabase, sql } from "@/lib/db";
import { json } from "@/lib/editor/http";

// One real database check per 15 s per instance: hammering /api/health can't turn into database load.
let last: { at: number; db: "ok" | "down" | "none" } | null = null;

export async function GET() {
  await connection();
  const now = performance.timeOrigin + performance.now();
  let db: "ok" | "down" | "none" = last && now - last.at < 15_000 ? last.db : "none";
  if (!last || now - last.at >= 15_000) {
    if (hasDatabase()) {
      try {
        await Promise.race([sql()`select 1`, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000))]);
        db = "ok";
      } catch {
        db = "down";
      }
    }
    last = { at: now, db };
  }
  return json({ status: db === "down" ? "degraded" : "ok", db, time: new Date().toISOString() }, db === "down" ? 503 : 200);
}
