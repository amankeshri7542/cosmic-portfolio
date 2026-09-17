/* Author-supplied image URLs load in the browser, avoiding server-side fetches of arbitrary URLs. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import BlogIllustration from "@/components/BlogIllustration";
import type { BlogMeta } from "@/lib/blog";

export default function BlogFeature({ blog, home = false }: { blog: BlogMeta; home?: boolean }) {
  const Heading = home ? "h3" : "h2";
  return (
    <article className="blog-feature">
      {blog.sample && ["one-sale-three-records","when-a-recipient-goes-offline","patterns-between-patterns"].includes(blog.slug) ? <BlogIllustration slug={blog.slug} /> : <Link href={`/blogs/${blog.slug}`} className="blog-cover" aria-label={`Read ${blog.title}`} tabIndex={-1} aria-hidden="true">
        {blog.cover ? <img src={blog.cover} alt={blog.coverAlt || ""} loading="lazy" referrerPolicy="no-referrer" /> : blog.slug === "aws-db" ? <>
          <span className="micro">A field guide to data</span>
          <svg viewBox="0 0 420 235" fill="none">
            <path d="M86 106v72h240v-72M210 72v106" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 5" />
            <g className="database-sketch"><path d="M49 64v55c0 19 74 19 74 0V64M49 88c0 19 74 19 74 0" /><ellipse cx="86" cy="64" rx="37" ry="13" /></g>
            <g className="keyvalue-sketch"><path d="M174 35h73v66h-73zM174 57h73m-73 22h73m-42-44v66" /><path d="M182 45h9m-9 23h9m-9 22h9m24-44h21m-21 23h21m-21 22h21" /></g>
            <g className="graph-sketch"><path d="m309 59 34 29-27 29m-7-58 7 58m27-29 28-38" /><circle cx="309" cy="59" r="7" /><circle cx="343" cy="88" r="7" /><circle cx="316" cy="117" r="7" /><circle cx="371" cy="50" r="7" /></g>
            <text x="86" y="212" textAnchor="middle">ROWS</text><text x="210" y="212" textAnchor="middle">KEYS</text><text x="334" y="212" textAnchor="middle">RELATIONSHIPS</text>
          </svg>
          <span className="handwritten">The shape of the data<br />changes the answer.</span>
        </> : <span className="handwritten">Notes from<br />the workbench.</span>}
      </Link>}
      <div className="blog-feature-copy">
        <p className="blog-meta"><span className="micro">{blog.sample ? "Sample essay" : "Field notes"}</span><time dateTime={blog.dateISO}>{blog.date}</time></p>
        <Heading><Link href={`/blogs/${blog.slug}`}>{blog.title}</Link></Heading>
        <p>{blog.excerpt}</p>
        <Link className="text-link" href={`/blogs/${blog.slug}`}>Read the article <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
