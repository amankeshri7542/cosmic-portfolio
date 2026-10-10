import Image from "next/image";
import Link from "next/link";
import type { PostBody } from "@/lib/post-types";
import { formatDate, toMeta } from "@/lib/post-types";
import type { Rendered } from "@/lib/markdown";
import { PaperToggle } from "./PaperToggle";
import styles from "./Article.module.css";

/** The reading view. Used for published articles and for private draft previews alike. */
export function Article({ post, rendered, banner, extra }: { post: PostBody; rendered: Rendered; banner?: React.ReactNode; extra?: React.ReactNode }) {
  const meta = toMeta(post);
  const toc = rendered.toc.filter((t) => t.depth === 2);
  return (
    <article className={`shell ${styles.article}`} aria-labelledby="article-title">
      {banner}
      <header className={styles.head}>
        <p className="label">
          <Link href="/blogs">Blog</Link> · {formatDate(post.dateISO)}
          {post.modifiedISO && post.modifiedISO.slice(0, 10) !== post.dateISO.slice(0, 10) && <> · updated {formatDate(post.modifiedISO)}</>}
          {" "}· {meta.readingMinutes} min read
          {post.sample && <> · illustrated study</>}
        </p>
        <h1 id="article-title">{post.title}</h1>
        <p className={styles.excerpt}>{post.excerpt}</p>
        {post.tags && post.tags.length > 0 && (
          <ul role="list" className={styles.tags} aria-label="Tags">{post.tags.map((t) => <li key={t} className="label">{t}</li>)}</ul>
        )}
        <PaperToggle />
      </header>
      {post.cover && (
        <figure className={styles.cover}>
          {post.coverWidth && post.coverHeight ? (
            <Image src={post.cover} alt={post.coverAlt ?? ""} width={post.coverWidth} height={post.coverHeight} sizes="(max-width: 900px) 100vw, 900px" priority />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover} alt={post.coverAlt ?? ""} />
          )}
        </figure>
      )}
      <div className={styles.layout}>
        {toc.length > 2 && (
          <nav className={styles.toc} aria-label="On this page">
            <p className="label label--caps">On this page</p>
            <ol role="list">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol>
          </nav>
        )}
        <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: rendered.html }} />
      </div>
      {extra}
      <footer className={styles.foot}>
        <p className="label">Written by Aman Kumar, full-stack engineer in Bengaluru.</p>
        <p><Link href="/blogs">← All writing</Link> · <Link href="/contact">Reply by email</Link></p>
      </footer>
    </article>
  );
}
