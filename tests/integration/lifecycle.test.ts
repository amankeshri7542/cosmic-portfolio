import { beforeEach, describe, expect, it } from "vitest";
import { sql } from "@/lib/db";
import {
  createPost, createPreview, deletePost, getPostById, getPreviewPost, listPosts, listRevisions, publish, restoreRevision, revokePreviews, saveDraft, unpublish, withStatus,
} from "@/lib/editor/posts";
import { getPublishedSlugs } from "./published";
import { revalidated } from "../mocks/next-cache";
import { resetDb, validPost, VALID } from "../helpers";

beforeEach(resetDb);

const redirects = async () =>
  Object.fromEntries((await sql()<{ from_slug: string; to_slug: string }[]>`SELECT from_slug, to_slug FROM portfolio_slug_redirects`).map((r) => [r.from_slug, r.to_slug]));

describe("create and save", () => {
  it("creates unique untitled slugs", async () => {
    const a = await createPost();
    const b = await createPost();
    expect([a.slug, b.slug]).toEqual(["untitled-1", "untitled-2"]);
    expect((await createPost({ title: "My First Post" })).slug).toBe("my-first-post");
    expect((await createPost({ title: "My First Post" })).slug).toBe("my-first-post-2");
    expect((await listPosts()).map((p) => p.status)).toEqual(["draft", "draft", "draft", "draft"]);
  });

  it("bumps the version and reports a conflict with the current record", async () => {
    const post = await createPost({ title: "Hello" });
    const first = await saveDraft(post.id, { content: "one" }, post.version);
    expect(first).toMatchObject({ ok: true, post: { version: post.version + 1 } });
    const stale = await saveDraft(post.id, { content: "stale" }, post.version);
    expect(stale).toMatchObject({ ok: false, conflict: true, current: { version: post.version + 1, draft: { content: "one" } } });
    expect((await getPostById(post.id))?.draft.content).toBe("one");
  });

  it("only writes a revision for checkpoints", async () => {
    const post = await createPost({ title: "Hello" });
    const a = await saveDraft(post.id, { content: "a" }, post.version);
    if (!a.ok) throw new Error();
    await saveDraft(post.id, { content: "b" }, a.post.version, { checkpoint: true });
    const revisions = await listRevisions(post.id);
    expect(revisions).toHaveLength(1);
    expect(revisions[0]).toMatchObject({ reason: "checkpoint", version: post.version + 2 });
  });

  it("renames an unpublished post's slug, and reports a taken one distinctly from a conflict", async () => {
    const a = await createPost({ title: "Alpha" });
    const b = await createPost({ title: "Beta" });
    const renamed = await saveDraft(a.id, { slug: "alpha-two" }, a.version);
    expect(renamed).toMatchObject({ ok: true, post: { slug: "alpha-two" } });
    expect(await saveDraft(b.id, { slug: "alpha-two" }, b.version)).toEqual({ ok: false, error: "slug_taken" });
    expect((await getPostById(b.id))?.version).toBe(b.version);
  });

  it("keeps a published post's URL until publish", async () => {
    const post = await validPost();
    const live = await publish(post.id, post.version);
    if (!live.ok) throw new Error("publish failed");
    const saved = await saveDraft(post.id, { slug: "elsewhere" }, live.post.version);
    expect(saved).toMatchObject({ ok: true, post: { slug: post.slug, draft: { slug: "elsewhere" } } });
    expect(await getPublishedSlugs()).toEqual([post.slug]);
  });
});

describe("publish", () => {
  it("returns a checklist and leaves the post untouched", async () => {
    const post = await createPost({ title: "x" });
    const result = await publish(post.id, post.version);
    expect(result).toMatchObject({ ok: false, errors: expect.arrayContaining([expect.stringMatching(/Title/), expect.stringMatching(/Excerpt/)]) });
    expect((await getPostById(post.id))?.published).toBeNull();
  });

  it("sets dates and first_published_at, then keeps dateISO on republish", async () => {
    const post = await validPost();
    const first = await publish(post.id, post.version);
    if (!first.ok) throw new Error("publish failed");
    const { published, firstPublishedAt } = first.post;
    expect(firstPublishedAt).not.toBeNull();
    expect(published).toMatchObject({ slug: post.slug, dateISO: firstPublishedAt, title: VALID.title });
    expect(published?.modifiedISO).toBeDefined();
    expect(withStatus(first.post).status).toBe("published");
    expect(revalidated).toEqual(expect.arrayContaining(["posts", `post:${post.slug}`]));

    const edited = await saveDraft(post.id, { content: `${VALID.content}\n\nMore words.` }, first.post.version);
    if (!edited.ok) throw new Error();
    expect(withStatus(edited.post).status).toBe("changed");
    expect(edited.post.published?.content).toBe(VALID.content);

    const second = await publish(post.id, edited.post.version);
    if (!second.ok) throw new Error("republish failed");
    expect(second.post.published?.dateISO).toBe(published?.dateISO);
    expect(second.post.firstPublishedAt).toBe(firstPublishedAt);
    expect(second.post.published?.content).toContain("More words.");
    expect((second.post.published?.modifiedISO ?? "") >= (published?.modifiedISO ?? "")).toBe(true);
  });

  it("rejects a stale version", async () => {
    const post = await validPost();
    expect(await publish(post.id, post.version - 1)).toMatchObject({ ok: false, conflict: true });
  });

  it("refuses a slug used by another post", async () => {
    const other = await validPost({ title: "Other post here" });
    const post = await validPost();
    expect(await saveDraft(post.id, { slug: other.slug }, post.version)).toEqual({ ok: false, error: "slug_taken" });

    const live = await publish(post.id, post.version);
    if (!live.ok) throw new Error();
    const clash = await saveDraft(post.id, { slug: other.slug }, live.post.version);
    if (!clash.ok) throw new Error("a published post may draft any slug");
    expect(await publish(post.id, clash.post.version)).toMatchObject({ ok: false, errors: [expect.stringMatching(/already used/)] });
  });

  it("renaming a published slug redirects the old URL and collapses chains", async () => {
    const post = await validPost();
    const a = post.slug;
    let version = (await publish(post.id, post.version).then((r) => (r.ok ? r.post : Promise.reject(r)))).version;

    const rename = async (slug: string) => {
      const saved = await saveDraft(post.id, { slug }, version);
      if (!saved.ok) throw new Error(JSON.stringify(saved));
      const live = await publish(post.id, saved.post.version);
      if (!live.ok) throw new Error(JSON.stringify(live));
      version = live.post.version;
      return live.post;
    };

    revalidated.length = 0;
    const b = await rename("second-name");
    expect(b.slug).toBe("second-name");
    expect(await redirects()).toEqual({ [a]: "second-name" });
    expect(revalidated).toEqual(expect.arrayContaining(["posts", `post:${a}`, "post:second-name", `redirect:${a}`, "redirect:second-name"]));
    expect(await getPublishedSlugs()).toEqual(["second-name"]);

    await rename("third-name");
    expect(await redirects()).toEqual({ [a]: "third-name", "second-name": "third-name" });

    await rename(a);
    expect(await redirects()).toEqual({ "second-name": a, "third-name": a });
    expect((await getPostById(post.id))?.slug).toBe(a);
  });

  it("stores the cover dimensions known to the media library", async () => {
    await sql()`INSERT INTO portfolio_media (url, width, height) VALUES ('https://x.public.blob.vercel-storage.com/c.png', 1200, 630)`;
    const post = await validPost({ cover: "https://x.public.blob.vercel-storage.com/c.png", coverAlt: "A cover" });
    const live = await publish(post.id, post.version);
    expect(live).toMatchObject({ ok: true, post: { published: { coverWidth: 1200, coverHeight: 630 } } });
  });
});

describe("unpublish and delete", () => {
  it("unpublish removes the live copy but never touches the draft", async () => {
    const post = await validPost();
    const live = await publish(post.id, post.version);
    if (!live.ok) throw new Error();
    const edited = await saveDraft(post.id, { title: "Half-finished" }, live.post.version);
    if (!edited.ok) throw new Error();
    const off = await unpublish(post.id, edited.post.version);
    expect(off).toMatchObject({ ok: true, post: { published: null, draft: { title: "Half-finished" } } });
    expect(await getPublishedSlugs()).toEqual([]);
    expect(await unpublish(post.id, off.ok ? off.post.version : 0)).toEqual({ ok: false, error: "not_published" });
    expect((await listRevisions(post.id)).map((r) => r.reason)).toContain("unpublish");
  });

  it("refuses to delete a post that was ever published, allows drafts, and frees the slug", async () => {
    const once = await validPost();
    const live = await publish(once.id, once.version);
    if (!live.ok) throw new Error();
    expect(await deletePost(once.id)).toEqual({ ok: false, error: "was_published" });
    await unpublish(once.id, live.post.version);
    expect(await deletePost(once.id)).toEqual({ ok: false, error: "was_published" });

    const draft = await createPost({ title: "Throwaway" });
    expect(await deletePost(draft.id)).toEqual({ ok: true });
    expect(await getPostById(draft.id)).toBeNull();
    expect(await deletePost(draft.id)).toEqual({ ok: false, error: "not_found" });
    expect(await saveDraft(draft.id, { title: "x" }, draft.version)).toEqual({ ok: false, error: "not_found" });
    expect((await createPost({ title: "Throwaway" })).slug).toBe("throwaway");
    expect((await listPosts()).map((p) => p.id)).not.toContain(draft.id);
  });
});

describe("revisions", () => {
  it("restores text, keeps URL and dates, and checkpoints what it replaced", async () => {
    const post = await validPost();
    const v1 = await saveDraft(post.id, { content: "First version of the article body." }, post.version, { checkpoint: true });
    if (!v1.ok) throw new Error();
    const v2 = await saveDraft(post.id, { content: "Second version of the article body." }, v1.post.version);
    if (!v2.ok) throw new Error();
    const [rev] = await listRevisions(post.id);
    expect(rev.reason).toBe("checkpoint");

    expect(await restoreRevision(post.id, rev.id, v1.post.version)).toMatchObject({ ok: false, conflict: true });
    const restored = await restoreRevision(post.id, rev.id, v2.post.version);
    expect(restored).toMatchObject({ ok: true, post: { slug: post.slug, draft: { content: "First version of the article body." } } });
    expect((await listRevisions(post.id)).map((r) => r.reason)).toEqual(["restore", "checkpoint", "checkpoint"]);
    expect(await restoreRevision(post.id, 999999, v2.post.version + 5)).toMatchObject({ ok: false });
  });
});

describe("preview links", () => {
  it("serves the draft while valid, then not once expired, revoked or deleted", async () => {
    const post = await validPost();
    const preview = await createPreview(post.id);
    if (!preview) throw new Error();
    const body = await getPreviewPost(preview.token);
    expect(body).toMatchObject({ title: VALID.title });
    expect(body?.dateISO).toBeTruthy();
    expect(new Date(preview.expiresAt).getTime() - Date.now()).toBeGreaterThan(6.9 * 86_400_000);

    expect(await getPreviewPost("A".repeat(32))).toBeNull();
    expect(await getPreviewPost("short")).toBeNull();

    await sql()`UPDATE portfolio_post_previews SET expires_at = now() - interval '1 second'`;
    expect(await getPreviewPost(preview.token)).toBeNull();

    const fresh = (await createPreview(post.id))!;
    expect(await getPreviewPost(fresh.token)).not.toBeNull();
    expect(await revokePreviews(post.id)).toBeGreaterThan(0);
    expect(await getPreviewPost(fresh.token)).toBeNull();

    const draft = await createPost({ title: "Gone soon" });
    const last = (await createPreview(draft.id))!;
    await deletePost(draft.id);
    expect(await getPreviewPost(last.token)).toBeNull();
    expect(await createPreview(draft.id)).toBeNull();
  });

  it("stores only a hash of the token", async () => {
    const post = await validPost();
    const preview = (await createPreview(post.id))!;
    const rows = await sql()<{ token_hash: string }[]>`SELECT token_hash FROM portfolio_post_previews`;
    expect(rows[0].token_hash).not.toBe(preview.token);
    expect(rows[0].token_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
