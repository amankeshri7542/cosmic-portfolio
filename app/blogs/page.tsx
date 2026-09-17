import { pageMetadata } from "@/lib/seo";
import { getAllBlogs } from '@/lib/blog';
import BlogsContent from './BlogsContent';

export const metadata = pageMetadata("/blogs", "Blog & field notes", "Technical writing by Aman Kumar on software engineering, databases, cloud infrastructure and visual experiments.");
export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await getAllBlogs();
  return <BlogsContent blogs={blogs} />;
}
