import type { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getAllBlogs()).filter(post => !post.sample);
  return [...["","/about","/work","/blogs","/contact"].map(path => ({url:`${SITE_URL}${path}`})),...posts.map(post => ({url:`${SITE_URL}/blogs/${post.slug}`,lastModified:post.modifiedISO || post.dateISO}))];
}
