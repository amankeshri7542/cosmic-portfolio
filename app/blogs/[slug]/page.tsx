/* Author-supplied image URLs load in the browser, avoiding server-side fetches of arbitrary URLs. */
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import BlogIllustration from "@/components/BlogIllustration";
import DeliveryStudy from "@/components/observatory/DeliveryStudy";
import InterferenceStudy from "@/components/observatory/InterferenceStudy";
import MarkdownArticle from "@/components/MarkdownArticle";
import { pageMetadata, SITE_URL, JsonLd } from "@/lib/seo";
import { getBlogBySlug } from "@/lib/blog";
interface Props {
  params: Promise<{ slug: string }>;
}
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return {title:"Note not found",robots:{index:false,follow:false}};
  const metadata = pageMetadata(`/blogs/${slug}`,blog.title,blog.excerpt);
  const image = `${SITE_URL}/blogs/${slug}/opengraph-image`;
  return {...metadata,robots:blog.sample ? {index:false,follow:true} : {index:true,follow:true},openGraph:{...metadata.openGraph,type:"article",publishedTime:blog.dateISO,modifiedTime:blog.modifiedISO || blog.dateISO,authors:[`${SITE_URL}/about`],images:[{url:image,width:1200,height:630,alt:blog.title}]},twitter:{card:"summary_large_image",title:blog.title,description:blog.excerpt,images:[image]}};

}
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();
  return (
    <main id="main-content" className="reading-page section-shell article-page">
      <JsonLd data={{"@context":"https://schema.org","@graph":[{"@type":"BlogPosting",headline:blog.title,description:blog.excerpt,datePublished:blog.dateISO,dateModified:blog.modifiedISO || blog.dateISO,mainEntityOfPage:`${SITE_URL}/blogs/${slug}`,image:`${SITE_URL}/blogs/${slug}/opengraph-image`,author:{"@type":"Person","@id":`${SITE_URL}/#person`,name:"Aman Kumar",url:`${SITE_URL}/about`},inLanguage:"en"},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:SITE_URL},{"@type":"ListItem",position:2,name:"Blog",item:`${SITE_URL}/blogs`},{"@type":"ListItem",position:3,name:blog.title,item:`${SITE_URL}/blogs/${slug}`}]}]}} />
      <Link className="text-link" href="/blogs">
        ← All field notes
      </Link>
      <header className="page-heading">
        <p className="eyebrow">{blog.sample && "Sample essay · "}{blog.date}</p>
        <h1>{blog.title}</h1>
      </header>
      {blog.cover && <img className="article-cover" src={blog.cover} alt={blog.coverAlt || ""} referrerPolicy="no-referrer" />}
      {blog.sample && ["one-sale-three-records","when-a-recipient-goes-offline","patterns-between-patterns"].includes(slug) && <BlogIllustration slug={blog.slug} />}
      <article><MarkdownArticle content={blog.content} /></article>
      {slug === "when-a-recipient-goes-offline" && <section className="article-experiment"><p className="eyebrow">Try the delivery sketch</p><h2>Take one recipient offline.</h2><DeliveryStudy /></section>}
      {slug === "patterns-between-patterns" && <section className="article-optical"><InterferenceStudy /></section>}
      <Link className="text-link" href="/blogs">
        ← Back to field notes
      </Link>
    </main>
  );
}
