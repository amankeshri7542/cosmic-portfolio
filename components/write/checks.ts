import type { PostBody } from "@/lib/post-types";
import { validSlug } from "@/lib/post-types";

export type Check = { ok: boolean; label: string; fix?: string };

/** Mirrors the server's publish validation so problems show before you press Publish. */
export function publishChecks(d: PostBody): Check[] {
  const imgs = [...d.content.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)];
  const missingAlt = imgs.filter((m) => !m[1].trim()).length;
  return [
    { ok: d.title.trim().length >= 3 && d.title.length <= 140, label: "Title", fix: "Between 3 and 140 characters." },
    { ok: validSlug(d.slug), label: "Address", fix: "Lowercase letters, numbers and single hyphens, like aws-database-guide." },
    { ok: d.excerpt.trim().length >= 20 && d.excerpt.length <= 320, label: "Summary", fix: "20–320 characters. It appears in search results, the blog list and link previews." },
    { ok: d.content.trim().length >= 20, label: "Article text", fix: "Write at least a paragraph." },
    { ok: !d.cover || !!d.coverAlt?.trim(), label: "Cover description", fix: "Describe the cover image for people who can't see it." },
    { ok: missingAlt === 0, label: imgs.length ? `Image descriptions (${imgs.length - missingAlt}/${imgs.length})` : "Image descriptions", fix: "Every image needs alt text: ![what the image shows](url)." },
  ];
}
