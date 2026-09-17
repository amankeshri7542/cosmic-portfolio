import { sql } from "@vercel/postgres";
import fs from "node:fs";
import matter from "gray-matter";
await sql`CREATE TABLE IF NOT EXISTS portfolio_posts (slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), draft jsonb NOT NULL, published jsonb, version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS portfolio_editor_sessions (token_hash text PRIMARY KEY, expires_at timestamptz NOT NULL)`;
await sql`CREATE TABLE IF NOT EXISTS portfolio_editor_attempts (key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL)`;
for (const name of fs.readdirSync("app/blogs").filter(name => name.endsWith(".md"))) {
  const { data, content } = matter(fs.readFileSync(`app/blogs/${name}`, "utf8"));
  const dateISO = new Date(data.date).toISOString();
  const post = { slug:name.slice(0,-3), title:data.title, excerpt:data.excerpt, sample:data.sample === true, content, dateISO, date:new Date(dateISO).toLocaleDateString("en-US", {year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}), cover:"", coverAlt:"" };
  await sql`INSERT INTO portfolio_posts (slug, draft, published) VALUES (${post.slug}, ${JSON.stringify(post)}::jsonb, ${JSON.stringify(post)}::jsonb) ON CONFLICT (slug) DO NOTHING`;
}
console.log("Editor tables ready; existing articles preserved and imported without overwriting edits.");
await sql.end();
