import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { cachedOgPng, ogSize, pngResponse } from "@/lib/og";

export const alt = "Article by Aman Kumar";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // no image work for slugs that don't exist
  return pngResponse(await cachedOgPng({ eyebrow: "Aman Kumar · Blog", title: post.title, footer: `amankeshri.com/blogs/${slug}` }));
}
