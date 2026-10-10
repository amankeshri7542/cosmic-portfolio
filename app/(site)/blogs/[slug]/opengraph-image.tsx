import { getPost } from "@/lib/posts";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "Article by Aman Kumar";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return ogImage({ eyebrow: "Aman Kumar · Blog", title: post?.title ?? "Notes from the workbench", footer: `amankeshri.com/blogs/${slug}` });
}
