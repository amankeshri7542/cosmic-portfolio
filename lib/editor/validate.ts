import { validSlug, type PostBody } from "../post-types";

export const LIMITS = { title: [3, 140], excerpt: [20, 320], content: [20, 150_000], coverAlt: [3, 300] } as const;

export type MarkdownImage = { alt: string; url: string };

function stripCode(markdown: string) {
  const out: string[] = [];
  let fence = "";
  for (const line of markdown.split("\n")) {
    const m = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = "";
    } else if (m) fence = m[1];
    else out.push(line);
  }
  return out.join("\n").replace(/`[^`\n]*`/g, "");
}

/** Images written as `![alt](url)`, ignoring anything inside code fences or inline code. */
export function markdownImages(markdown: string): MarkdownImage[] {
  const images: MarkdownImage[] = [];
  for (const m of stripCode(markdown).matchAll(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g)) images.push({ alt: m[1].trim(), url: m[2] });
  return images;
}

export function validImageUrl(url: string) {
  if (url.startsWith("//") || url.length > 2000) return false;
  if (url.startsWith("/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}

/** The publish checklist. Empty means the draft may go live. */
export function validateForPublish(draft: PostBody): string[] {
  const errors: string[] = [];
  const title = draft.title?.trim() ?? "";
  const excerpt = draft.excerpt?.trim() ?? "";
  const content = draft.content?.trim() ?? "";
  if (title.length < LIMITS.title[0] || title.length > LIMITS.title[1]) errors.push(`Title must be ${LIMITS.title[0]}–${LIMITS.title[1]} characters.`);
  if (excerpt.length < LIMITS.excerpt[0] || excerpt.length > LIMITS.excerpt[1]) errors.push(`Excerpt must be ${LIMITS.excerpt[0]}–${LIMITS.excerpt[1]} characters.`);
  if (content.length < LIMITS.content[0]) errors.push(`The article needs at least ${LIMITS.content[0]} characters of content.`);
  if (draft.content.length > LIMITS.content[1]) errors.push(`The article is longer than ${LIMITS.content[1].toLocaleString("en-US")} characters.`);
  if (!validSlug(draft.slug ?? "")) errors.push("URL must use lowercase letters, numbers and single hyphens (up to 100 characters).");
  if (draft.cover) {
    if (!validImageUrl(draft.cover)) errors.push("Cover image must be an https:// URL or a path starting with /.");
    if ((draft.coverAlt?.trim().length ?? 0) < 1) errors.push("Cover image needs alt text.");
  }
  const missing = markdownImages(draft.content).filter((i) => i.alt === "").length;
  if (missing) errors.push(`${missing} ${missing === 1 ? "image in the text is" : "images in the text are"} missing alt text.`);
  const unsafe = markdownImages(draft.content).filter((i) => !validImageUrl(i.url)).length;
  if (unsafe) errors.push(`${unsafe} ${unsafe === 1 ? "image uses" : "images use"} an unsupported URL (use https:// or a / path).`);
  return errors;
}

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : undefined);

/** Coerce untrusted JSON into a partial draft: right types, sane lengths, nothing unknown. */
export function sanitizeDraft(input: unknown): { draft: Partial<PostBody> } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "draft must be an object" };
  const raw = input as Record<string, unknown>;
  const draft: Partial<PostBody> = {};
  const strings = { title: 500, excerpt: 2000, content: 200_000, cover: 2000, coverAlt: 500 } as const;
  for (const [key, max] of Object.entries(strings) as [keyof typeof strings, number][]) {
    if (raw[key] === undefined) continue;
    const value = clip(raw[key], max);
    if (value === undefined) return { error: `${key} must be a string` };
    draft[key] = value;
  }
  if (raw.slug !== undefined) {
    if (typeof raw.slug !== "string" || !validSlug(raw.slug)) return { error: "slug must use lowercase letters, numbers and single hyphens" };
    draft.slug = raw.slug;
  }
  if (raw.sample !== undefined) draft.sample = raw.sample === true;
  if (raw.tags !== undefined) {
    if (!Array.isArray(raw.tags)) return { error: "tags must be an array" };
    draft.tags = [...new Set(raw.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 40)).filter(Boolean))].slice(0, 12);
  }
  for (const key of ["coverWidth", "coverHeight"] as const) {
    if (raw[key] === undefined) continue;
    if (typeof raw[key] !== "number" || !Number.isInteger(raw[key]) || raw[key] < 1 || raw[key] > 20_000) return { error: `${key} must be a positive integer` };
    draft[key] = raw[key];
  }
  return { draft };
}

const FIELDS = ["slug", "title", "excerpt", "content", "cover", "coverAlt"] as const;

/** True when a draft differs from what is live in anything an author controls (dates are server-owned). */
export function draftDiffers(draft: Partial<PostBody>, published: Partial<PostBody>) {
  if (FIELDS.some((k) => (draft[k] ?? "") !== (published[k] ?? ""))) return true;
  if (!!draft.sample !== !!published.sample) return true;
  return (draft.tags ?? []).join("\u0000") !== (published.tags ?? []).join("\u0000");
}

export type PostStatus = "draft" | "published" | "changed";
export function derivePostStatus(draft: Partial<PostBody>, published: Partial<PostBody> | null): PostStatus {
  if (!published) return "draft";
  return draftDiffers(draft, published) ? "changed" : "published";
}
