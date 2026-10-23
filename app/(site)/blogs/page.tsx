import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/post-types";
import { JsonLd, pageMetadata, personId } from "@/lib/seo";
import { SITE_URL } from "@/content/profile";
import { Ambient } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";
import styles from "./blogs.module.css";

export const metadata: Metadata = pageMetadata(
  "/blogs",
  "Blog — notes on software, data and the cloud",
  "Articles by Aman Kumar on databases, transactions, serverless systems on AWS and the decisions behind working software.",
);

export default async function BlogIndex() {
  const posts = await getPublishedPosts();
  const articles = posts.filter((p) => !p.sample);
  const studies = posts.filter((p) => p.sample);
  return (
    <div className="lab">
    <Ambient />
    <div className={`shell ${styles.page}`}>
      <PageHead
        kicker="BLOG ✺ NOTES & ARTICLES"
        title="Notes from the *workbench.*"
        lede="Databases, transactions, serverless systems and the decisions behind software that keeps working. Written to be useful a year from now."
      >
        <p className="label"><a href="/blogs/rss.xml">Subscribe with RSS</a></p>
      </PageHead>

      <section aria-labelledby="articles-title">
        <h2 id="articles-title" className="label label--caps">Articles</h2>
        <ol role="list" className={styles.list}>
          {articles.map((p) => (
            <li key={p.slug} className={styles.item}>
              <p className="label">{formatDate(p.dateISO)} · {p.readingMinutes} min read{p.tags?.length ? ` · ${p.tags.join(", ")}` : ""}</p>
              <h3><Link href={`/blogs/${p.slug}`}>{p.title}</Link></h3>
              <p className={styles.excerpt}>{p.excerpt}</p>
            </li>
          ))}
        </ol>
      </section>

      {studies.length > 0 && (
        <section aria-labelledby="studies-title" className={styles.studies}>
          <h2 id="studies-title" className="label label--caps">Illustrated studies</h2>
          <p className={styles.note}>Short visual explanations that accompany the work on this site.</p>
          <ul role="list" className={styles.small}>
            {studies.map((p) => (
              <li key={p.slug}>
                <Link href={`/blogs/${p.slug}`}>{p.title}</Link>
                <span className="label">{p.readingMinutes} min</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": `${SITE_URL}/blogs#blog`,
          url: `${SITE_URL}/blogs`,
          name: "Aman Kumar — Blog",
          author: { "@id": personId },
          blogPost: articles.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/blogs/${p.slug}`,
            datePublished: p.dateISO,
            dateModified: p.modifiedISO ?? p.dateISO,
          })),
        }}
      />
    </div>
    </div>
  );
}
