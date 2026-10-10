import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Article } from "@/components/blog/Article";
import { renderMarkdown } from "@/lib/markdown";
import { getPreviewPost } from "@/lib/editor/posts";
import { imageInfoMap } from "@/lib/editor/media";

export const metadata: Metadata = { title: "Private preview", robots: { index: false, follow: false, nocache: true } };

type Props = { params: Promise<{ token: string }> };

export const instant = false;

export default async function PreviewPage({ params }: Props) {
  await connection(); // always fresh: drafts are never cached
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) notFound();
  const post = await getPreviewPost(token);
  if (!post) notFound();
  const urls = [...post.content.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]);
  const images = urls.length ? await imageInfoMap(urls).catch(() => ({})) : {};
  const rendered = await renderMarkdown(post.content, { images, siteHost: "amankeshri.com" });
  return (
    <Article
      post={{ ...post, dateISO: post.dateISO || new Date().toISOString() }}
      rendered={rendered}
      banner={
        <p className="label" role="note" style={{ border: "1px solid var(--ferric)", color: "var(--ferric)", padding: "0.6rem 0.8rem" }}>
          Private preview of an unpublished draft. Don’t share this link publicly — it expires automatically.
        </p>
      }
    />
  );
}
