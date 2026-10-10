#!/usr/bin/env node
// Applies db/migrations/*.sql in order, one transaction each, serialised by an advisory lock.
//   node scripts/migrate.mjs [--dry-run] [--production]
// Production needs --production AND CONFIRM_PRODUCTION_MIGRATION=yes.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { connectionOptions, describeTarget, isProduction, targetUrl } from "./_guard.mjs";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

const url = targetUrl();
if (!url) {
  console.error("No DATABASE_URL_UNPOOLED or DATABASE_URL set.");
  process.exit(1);
}
console.log(`Target: ${describeTarget(url)}`);

if (isProduction(url) && !(args.has("--production") && process.env.CONFIRM_PRODUCTION_MIGRATION === "yes")) {
  console.error("Refusing to migrate production. Pass --production and set CONFIRM_PRODUCTION_MIGRATION=yes if you mean it.");
  process.exit(1);
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
const sql = postgres(url, connectionOptions(url));
let failed = false;

try {
  await sql`SELECT pg_advisory_lock(7479)`;
  const [{ exists }] = await sql`SELECT to_regclass('public.schema_migrations') IS NOT NULL AS exists`;
  if (!exists && !dryRun) await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  const applied = new Set(exists || !dryRun ? (await sql`SELECT name FROM schema_migrations`).map((r) => r.name) : []);
  const pending = files.filter((f) => !applied.has(f));

  if (dryRun) {
    console.log(pending.length ? `Pending:\n${pending.map((f) => `  ${f}`).join("\n")}` : "No pending migrations.");
  } else {
    for (const file of pending) {
      const body = await readFile(path.join(dir, file), "utf8");
      await sql.begin(async (tx) => {
        await tx.unsafe(body);
        await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
      });
      console.log(`Applied ${file}`);
    }
    if (!pending.length) console.log("Already up to date.");
  }
} catch (error) {
  failed = true;
  console.error(`Migration failed: ${error.message}`);
} finally {
  await sql`SELECT pg_advisory_unlock(7479)`.catch(() => {});
  await sql.end({ timeout: 5 });
}
process.exit(failed ? 1 : 0);
