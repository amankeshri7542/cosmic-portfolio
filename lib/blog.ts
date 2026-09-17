import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { sql } from "@vercel/postgres";
import { cache } from "react";
import type { BlogMeta, BlogPost } from "./blog-types";
export type { BlogMeta, BlogPost } from "./blog-types";

function filePosts(): BlogPost[] {
  const dir = path.join(process.cwd(), "app/blogs");
  return fs.readdirSync(dir).filter(name => name.endsWith(".md")).map(name => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, name), "utf8"));
    const dateISO = data.date ? new Date(data.date).toISOString() : "";
    return { slug:name.slice(0,-3), title:String(data.title || "Untitled"), excerpt:String(data.excerpt || ""), sample:data.sample === true, dateISO, date:dateISO ? new Date(dateISO).toLocaleDateString("en-US", {year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}) : "No date", content };
  });
}
export const getAllBlogs = cache(async (): Promise<BlogMeta[]> => {
  const posts: BlogPost[] = process.env.POSTGRES_URL
    ? (await sql`SELECT published FROM portfolio_posts WHERE published IS NOT NULL ORDER BY published->>'dateISO' DESC`).rows.map(row => row.published)
    : filePosts();
  return posts.map(post => { const { content, ...meta } = post; void content; return meta; }).sort((a,b) => b.dateISO.localeCompare(a.dateISO));
});
export const getBlogBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
  if (!process.env.POSTGRES_URL) return filePosts().find(post => post.slug === slug) ?? null;
  const result = await sql`SELECT published FROM portfolio_posts WHERE slug = ${slug} AND published IS NOT NULL`;
  return result.rows[0]?.published ?? null;
});
