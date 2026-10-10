import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL } from "@/content/profile";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getPublishedPosts()).filter((p) => !p.sample);
  const latest = posts[0]?.modifiedISO ?? posts[0]?.dateISO;
  return [
    { url: SITE_URL, lastModified: "2026-10-10" },
    { url: `${SITE_URL}/work`, lastModified: "2026-10-10" },
    { url: `${SITE_URL}/about`, lastModified: "2026-10-10" },
    { url: `${SITE_URL}/blogs`, lastModified: latest },
    { url: `${SITE_URL}/contact`, lastModified: "2026-10-10" },
    ...posts.map((p) => ({ url: `${SITE_URL}/blogs/${p.slug}`, lastModified: p.modifiedISO ?? p.dateISO })),
  ];
}
