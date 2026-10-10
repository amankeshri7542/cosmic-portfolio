import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedPosts, getRedirect, getRenderedPost } from "@/lib/posts";
import { Article } from "@/components/blog/Article";
import dynamic from "next/dynamic";
import { JsonLd, pageMetadata, personId, websiteId } from "@/lib/seo";
import { SITE_URL } from "@/content/profile";
import styles from "./post.module.css";

type Props = { params: Promise<{ slug: string }> };

// Interactive companions for the illustrated studies — loaded only on the articles that use them.
const CommitSim = dynamic(() => import("@/components/sims/CommitSim").then((m) => m.CommitSim));
const FanoutSim = dynamic(() => import("@/components/sims/FanoutSim").then((m) => m.FanoutSim));
const companions: Record<string, React.ReactNode> = {
  "one-sale-three-records": <CommitSim />,
  "when-a-recipient-goes-offline": <FanoutSim />,
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "aws-db" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRenderedPost(slug);
  if (!data) return { title: "Not found", robots: { index: false } };
  const { post } = data;
  const base = pageMetadata(`/blogs/${slug}`, post.title, post.excerpt);
  return {
    ...base,
    robots: post.sample ? { index: false, follow: true } : undefined,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.dateISO,
      modifiedTime: post.modifiedISO ?? post.dateISO,
      authors: [`${SITE_URL}/about`],
      tags: post.tags,
    },
  };
}

// Block on the post lookup so a missing article returns a real 404 status, not a streamed "soft 404".
export const instant = false;

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await getRenderedPost(slug);
  if (!data) {
    const moved = await getRedirect(slug);
    if (moved) permanentRedirect(`/blogs/${moved}`);
    notFound();
  }
  const { post, rendered } = data;
  const url = `${SITE_URL}/blogs/${slug}`;
  const companion = companions[slug];
  return (
    <>
      <Article
        post={post}
        rendered={rendered}
        extra={companion ? (
          <section className={styles.companion} aria-label="Try it">
            <p className="label label--caps">Try it</p>
            <div className={styles.sheet}>{companion}</div>
          </section>
        ) : null}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              headline: post.title,
              description: post.excerpt,
              datePublished: post.dateISO,
              dateModified: post.modifiedISO ?? post.dateISO,
              author: { "@id": personId },
              publisher: { "@id": personId },
              isPartOf: { "@id": `${SITE_URL}/blogs#blog` },
              mainEntityOfPage: url,
              url,
              inLanguage: "en",
              wordCount: post.content.split(/\s+/).length,
              keywords: post.tags?.join(", "),
              image: post.cover ? new URL(post.cover, SITE_URL).toString() : `${url}/opengraph-image`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blogs` },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
            { "@type": "WebSite", "@id": websiteId },
          ],
        }}
      />
    </>
  );
}
