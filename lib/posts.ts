import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { hasDatabase, sql } from "./db";
import { toMeta, validSlug, type PostBody, type PostMeta } from "./post-types";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

/** Seed essays in the repository — used when no database is configured (local design work, CI). */
async function filePosts(): Promise<PostBody[]> {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (f) => {
      const { data, content } = matter(await readFile(path.join(POSTS_DIR, f), "utf8"));
      const iso = new Date(data.date).toISOString();
      return {
        slug: f.replace(/\.md$/, ""),
        title: String(data.title),
        excerpt: String(data.excerpt ?? ""),
        content: content.trim(),
        date: String(data.date),
        dateISO: iso,
        sample: data.sample === true,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      };
    }),
  );
}

async function dbPublished(): Promise<PostBody[]> {
  const rows = (await sql()<{ published: PostBody }[]>`SELECT published FROM portfolio_posts WHERE published IS NOT NULL`);
  return rows.map((r) => r.published);
}

async function allPublished(): Promise<PostBody[]> {
  const posts = hasDatabase() ? await dbPublished() : await filePosts();
  return posts.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  "use cache";
  cacheTag("posts");
  cacheLife("hours");
  return (await allPublished()).map(toMeta);
}

export async function getPost(slug: string): Promise<PostBody | null> {
  "use cache";
  cacheTag("posts", `post:${slug}`);
  cacheLife("hours");
  if (!validSlug(slug)) return null;
  if (!hasDatabase()) return (await filePosts()).find((p) => p.slug === slug) ?? null;
  const rows = (await sql()<{ published: PostBody }[]>`SELECT published FROM portfolio_posts WHERE slug = ${slug} AND published IS NOT NULL`);
  return rows[0]?.published ?? null;
}

/** Where a renamed post moved to, if anywhere (308 from the old URL). */
export async function getRedirect(slug: string): Promise<string | null> {
  "use cache";
  cacheTag("posts", `redirect:${slug}`);
  cacheLife("hours");
  if (!hasDatabase() || !validSlug(slug)) return null;
  try {
    const rows = (await sql()<{ to_slug: string }[]>`SELECT to_slug FROM portfolio_slug_redirects WHERE from_slug = ${slug}`);
    return rows[0]?.to_slug ?? null;
  } catch {
    return null; // table not migrated yet
  }
}

/** A published post with its Markdown rendered once and cached alongside it. */
export async function getRenderedPost(slug: string) {
  "use cache";
  cacheTag("posts", `post:${slug}`);
  cacheLife("hours");
  const post = await getPost(slug);
  if (!post) return null;
  const { renderMarkdown } = await import("./markdown");
  const rendered = await renderMarkdown(post.content, { siteHost: "amankeshri.com" });
  return { post, rendered };
}
