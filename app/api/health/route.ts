import { connection } from "next/server";
import { hasDatabase, sql } from "@/lib/db";
import { json } from "@/lib/editor/http";

export async function GET() {
  await connection();
  let db: "ok" | "down" | "none" = "none";
  if (hasDatabase()) {
    try {
      await Promise.race([sql()`select 1`, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000))]);
      db = "ok";
    } catch {
      db = "down";
    }
  }
  return json({ status: db === "down" ? "degraded" : "ok", db, time: new Date().toISOString() }, db === "down" ? 503 : 200);
}
