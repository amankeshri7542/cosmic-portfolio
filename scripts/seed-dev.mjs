#!/usr/bin/env node
// Loads the production content snapshot into a LOCAL database. Never touches production.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { connectionOptions, describeTarget, isProduction, targetUrl } from "./_guard.mjs";

const url = targetUrl();
if (!url) {
  console.error("No DATABASE_URL_UNPOOLED or DATABASE_URL set.");
  process.exit(1);
}
console.log(`Target: ${describeTarget(url)}`);
if (isProduction(url)) {
  console.error("Refusing to seed production.");
  process.exit(1);
}

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content-snapshot", "portfolio_posts-2026-10-10.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const sql = postgres(url, connectionOptions(url));
let failed = false;

try {
  let inserted = 0;
  for (const row of rows) {
    const result = await sql`
      INSERT INTO portfolio_posts (slug, draft, published, version, updated_at)
      VALUES (${row.slug}, ${JSON.stringify(row.draft)}::text::jsonb, ${row.published ? JSON.stringify(row.published) : null}::text::jsonb, ${row.version}, ${row.updated_at})
      ON CONFLICT (slug) DO NOTHING`;
    inserted += result.count;
  }
  await sql`
    UPDATE portfolio_posts SET first_published_at = (published->>'dateISO')::timestamptz
    WHERE first_published_at IS NULL AND published->>'dateISO' IS NOT NULL`;
  console.log(`Seeded ${inserted} of ${rows.length} posts (existing slugs left untouched).`);
} catch (error) {
  failed = true;
  console.error(`Seed failed: ${error.message}`);
} finally {
  await sql.end({ timeout: 5 });
}
process.exit(failed ? 1 : 0);
