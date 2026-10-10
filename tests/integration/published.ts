import { sql } from "@/lib/db";

export async function getPublishedSlugs() {
  return (await sql()<{ slug: string }[]>`SELECT slug FROM portfolio_posts WHERE published IS NOT NULL ORDER BY slug`).map((r) => r.slug);
}
