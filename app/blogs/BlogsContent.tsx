import type { BlogMeta } from "@/lib/blog";
import BlogFeature from "@/components/BlogFeature";
export default function BlogsContent({ blogs }: { blogs: BlogMeta[] }) {
  const featured = blogs.find(blog => !blog.sample) ?? blogs[0];
  return (
    <main id="main-content" className="reading-page section-shell notes-page">
      <header className="page-heading">
        <p className="eyebrow">Blog / Field notes</p>
        <h1>
          Notes from
          <br />
          <em>the workbench.</em>
        </h1>
        <p>
          Notes on cloud infrastructure, data and the decisions behind software.
        </p>
      </header>
      {featured && <BlogFeature blog={featured} />}
      <div className="notes-list">
        {blogs.filter(blog => blog !== featured).map(blog => <BlogFeature key={blog.slug} blog={blog} />)}
        {!blogs.length && <p className="muted">No notes published yet.</p>}
      </div>
    </main>
  );
}
