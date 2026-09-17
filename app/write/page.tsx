import type { Metadata } from "next";
import { sql } from "@vercel/postgres";
import { editorSession } from "@/lib/editor";
import type { EditorPost } from "@/lib/blog-types";
import Writer from "./Writer";

export const metadata: Metadata = { title:"Writer’s desk", robots:{index:false,follow:false} };
export const dynamic = "force-dynamic";
export default async function WritePage() {
  const authenticated = await editorSession();
  const posts: EditorPost[] = authenticated ? (await sql`SELECT slug, draft, published, version FROM portfolio_posts ORDER BY updated_at DESC`).rows as EditorPost[] : [];
  return <main id="main-content" className="reading-page section-shell writer-page"><Writer authenticated={authenticated} initialPosts={posts} /></main>;
}
