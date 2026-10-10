import { describe, expect, it } from "vitest";
import type { PostBody } from "@/lib/post-types";
import { derivePostStatus, markdownImages, sanitizeDraft, validateForPublish } from "@/lib/editor/validate";

const base: PostBody = {
  slug: "a-post",
  title: "A perfectly good title",
  excerpt: "An excerpt that is long enough to pass the checklist.",
  content: "Some content that is comfortably over twenty characters.",
  date: "",
  dateISO: "",
};

describe("validateForPublish", () => {
  it("passes a complete draft", () => {
    expect(validateForPublish(base)).toEqual([]);
  });

  it("lists every problem at once", () => {
    const errors = validateForPublish({ ...base, title: "Hi", excerpt: "short", content: "tiny", slug: "Bad Slug" });
    expect(errors).toHaveLength(4);
    expect(errors.join(" ")).toMatch(/Title.*Excerpt.*content.*URL/s);
  });

  it("caps the content length", () => {
    expect(validateForPublish({ ...base, content: "x".repeat(150_001) })).toHaveLength(1);
    expect(validateForPublish({ ...base, content: "x".repeat(150_000) })).toEqual([]);
  });

  it("requires alt text for a cover image", () => {
    expect(validateForPublish({ ...base, cover: "https://x.public.blob.vercel-storage.com/a.png", coverAlt: "" })).toEqual(["Cover image needs alt text."]);
    expect(validateForPublish({ ...base, cover: "https://x.public.blob.vercel-storage.com/a.png", coverAlt: "A cat" })).toEqual([]);
    expect(validateForPublish({ ...base, cover: "javascript:alert(1)", coverAlt: "x" })[0]).toMatch(/Cover image must be/);
  });

  it("requires alt text on every Markdown image", () => {
    const errors = validateForPublish({ ...base, content: `${base.content}\n\n![](https://a.example/1.png)\n![ ](/two.png)\n![fine](/three.png)` });
    expect(errors).toEqual(["2 images in the text are missing alt text."]);
  });

  it("ignores image syntax inside code", () => {
    const content = `${base.content}\n\n\`\`\`md\n![](x.png)\n\`\`\`\n\nInline \`![](y.png)\` too.`;
    expect(validateForPublish({ ...base, content })).toEqual([]);
  });
});

describe("markdownImages", () => {
  it("extracts alt and url, with optional titles", () => {
    expect(markdownImages('![A cat](/c.png "Title") and ![](https://x.example/d.webp)')).toEqual([
      { alt: "A cat", url: "/c.png" },
      { alt: "", url: "https://x.example/d.webp" },
    ]);
  });
});

describe("sanitizeDraft", () => {
  it("keeps only known, well-typed fields", () => {
    const r = sanitizeDraft({ title: "T", sample: true, tags: ["a", " a ", "", 3, "b"], evil: 1, dateISO: "x" });
    expect(r).toEqual({ draft: { title: "T", sample: true, tags: ["a", "b"] } });
  });
  it("rejects wrong types and bad slugs", () => {
    expect(sanitizeDraft({ title: 5 })).toHaveProperty("error");
    expect(sanitizeDraft({ slug: "Not Valid" })).toHaveProperty("error");
    expect(sanitizeDraft([])).toHaveProperty("error");
  });
});

describe("derivePostStatus", () => {
  it("is draft without a published copy", () => expect(derivePostStatus(base, null)).toBe("draft"));
  it("is published when the author-controlled fields match", () => {
    expect(derivePostStatus(base, { ...base, dateISO: "2026-01-01T00:00:00.000Z", modifiedISO: "2026-01-02T00:00:00.000Z" })).toBe("published");
  });
  it("is changed when the draft differs", () => {
    expect(derivePostStatus({ ...base, title: "New title here" }, base)).toBe("changed");
    expect(derivePostStatus({ ...base, slug: "other" }, base)).toBe("changed");
    expect(derivePostStatus({ ...base, tags: ["x"] }, base)).toBe("changed");
  });
});
