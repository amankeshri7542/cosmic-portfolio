export type PostBody = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string; // display date, kept for compatibility with existing rows
  dateISO: string; // first publication
  modifiedISO?: string;
  sample?: boolean; // illustrative essays: noindex, kept out of sitemap and feeds
  tags?: string[];
  cover?: string;
  coverAlt?: string;
  coverWidth?: number;
  coverHeight?: number;
};

export type PostMeta = Omit<PostBody, "content"> & { readingMinutes: number; words: number };

export function wordCount(md: string) {
  return md.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`\[\]()!-]/g, " ").split(/\s+/).filter(Boolean).length;
}

export function toMeta(p: PostBody): PostMeta {
  const { content, ...rest } = p;
  const words = wordCount(content);
  return { ...rest, words, readingMinutes: Math.max(1, Math.round(words / 230)) };
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validSlug(slug: string) {
  return slug.length > 0 && slug.length <= 100 && SLUG_RE.test(slug);
}
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}
