import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogBySlug, getAllBlogs } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogs().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);
  if (!blog) return { title: 'Blog Not Found' };
  return {
    title: blog.title,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);
  if (!blog) notFound();

  return (
    <main className="relative z-10 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-white/50 hover:text-cyan-300 text-sm font-medium mb-10 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-4">
          <Calendar size={14} />
          <span>{blog.date}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white text-glow-white mb-12 leading-tight">
          {blog.title}
        </h1>

        {/* Markdown content */}
        <article className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
          prose-p:text-white/85 prose-p:leading-relaxed prose-p:font-medium
          prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white prose-strong:font-bold
          prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-[rgba(10,10,20,0.8)] prose-pre:border prose-pre:border-purple-500/20 prose-pre:rounded-xl
          prose-li:text-white/85 prose-li:font-medium
          prose-hr:border-purple-500/20
          prose-blockquote:border-l-purple-400 prose-blockquote:text-white/70
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blog.content}
          </ReactMarkdown>
        </article>

        {/* Bottom back link */}
        <div className="mt-16 pt-8 border-t border-purple-500/20">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-white/50 hover:text-cyan-300 text-sm font-medium transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to all posts
          </Link>
        </div>
      </div>
    </main>
  );
}
