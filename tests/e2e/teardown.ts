import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Remove articles the publishing workflow created — only ever against a local database.
export default function teardown() {
  let url = process.env.DATABASE_URL ?? "";
  if (!url) {
    try { url = /^DATABASE_URL=(.*)$/m.exec(readFileSync(".env.local", "utf8"))?.[1] ?? ""; } catch {}
  }
  if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) return;
  const like = "slug like 'field-test-%' or slug like 'deleted-%'";
  execFileSync("psql", [url, "-qAtc", [
    `delete from portfolio_post_revisions where post_id in (select id from portfolio_posts where ${like})`,
    `delete from portfolio_post_previews where post_id in (select id from portfolio_posts where ${like})`,
    "delete from portfolio_slug_redirects where from_slug like 'field-test-%'",
    `delete from portfolio_posts where ${like}`,
  ].join("; ")]);
}
