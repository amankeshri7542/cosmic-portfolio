import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/blog";
import SocialImage from "@/components/SocialImage";
export const alt = "Aman Kumar — Field notes";
export const size = {width:1200,height:630};
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export default async function Image({ params }: { params: Promise<{slug:string}> }) {
  const post = await getBlogBySlug((await params).slug);
  if (!post) notFound();
  return new ImageResponse(<SocialImage title={post.title} article />,size);
}
