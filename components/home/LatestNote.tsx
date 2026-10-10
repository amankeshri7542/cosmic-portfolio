import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/post-types";
import styles from "./LatestNote.module.css";

export async function LatestNote() {
  const posts = await getPublishedPosts();
  const real = posts.filter((p) => !p.sample);
  const lead = real[0] ?? posts[0];
  if (!lead) return null;
  const more = posts.filter((p) => p.slug !== lead.slug).slice(0, 3);
  return (
    <section className={`section shell ${styles.wrap}`} aria-labelledby="notes-title">
      <header className={styles.head}>
        <p className="label label--caps">From the blog</p>
        <h2 id="notes-title" data-reveal>Notes from the workbench.</h2>
        <Link href="/blogs" className={styles.all}>All writing →</Link>
      </header>
      <article className={styles.lead}>
        <p className="label">{formatDate(lead.dateISO)} · {lead.readingMinutes} min read</p>
        <h3><Link href={`/blogs/${lead.slug}`}>{lead.title}</Link></h3>
        <p>{lead.excerpt}</p>
      </article>
      {more.length > 0 && (
        <ul role="list" className={styles.more}>
          {more.map((p) => (
            <li key={p.slug}>
              <Link href={`/blogs/${p.slug}`}>{p.title}</Link>
              <span className="label">{p.sample ? "Illustrated study" : formatDate(p.dateISO)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
