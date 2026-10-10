import "server-only";
import { revalidateTag } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import type postgres from "postgres";
import { sql } from "../db";
import { slugify, validSlug, type PostBody } from "../post-types";
import { isUuid } from "./http";
import { collapseRedirects } from "./redirects";
import { derivePostStatus, validateForPublish, type PostStatus } from "./validate";

export type PostRecord = {
  id: string;
  slug: string;
  draft: PostBody;
  published: PostBody | null;
  version: number;
  updatedAt: string;
  createdAt: string;
  firstPublishedAt: string | null;
};
export type PostWithStatus = PostRecord & { status: PostStatus };

export type PostListItem = {
  id: string;
  slug: string;
  publishedSlug: string | null;
  title: string;
  excerpt: string;
  status: PostStatus;
  words: number;
  sample: boolean;
  tags: string[];
  cover: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  firstPublishedAt: string | null;
};

export type RevisionReason = "save" | "publish" | "checkpoint" | "restore" | "unpublish";
export type RevisionSummary = { id: number; version: number; reason: RevisionReason; createdAt: string; title: string; words: number };
export type Revision = RevisionSummary & { draft: PostBody };

type Conflict = { ok: false; conflict: true; current: PostRecord };
type Failure<E extends string> = { ok: false; error: E };
export type SaveResult = { ok: true; post: PostRecord } | Conflict | Failure<"not_found" | "slug_taken">;
export type PublishResult = { ok: true; post: PostRecord } | { ok: false; errors: string[] } | Conflict | Failure<"not_found" | "slug_taken">;
export type UnpublishResult = { ok: true; post: PostRecord } | Conflict | Failure<"not_found" | "not_published">;
export type DeleteResult = { ok: true } | Failure<"not_found" | "was_published">;
export type RestoreResult = SaveResult | Failure<"revision_not_found">;

type Row = {
  id: string;
  slug: string;
  draft: PostBody;
  published: PostBody | null;
  version: number;
  updated_at: Date;
  created_at: Date;
  first_published_at: Date | null;
};

const COLS = () => sql()`id, slug, draft, published, version, updated_at, created_at, first_published_at`;
const WORDS = (col: string) => sql()`CASE WHEN btrim(${sql()(col)}->>'content') = '' THEN 0 ELSE cardinality(regexp_split_to_array(btrim(${sql()(col)}->>'content'), '[[:space:]]+')) END`;
const MAX_REVISIONS = 200;

export function toRecord(row: Row): PostRecord {
  return {
    id: row.id,
    slug: row.slug,
    draft: row.draft,
    published: row.published,
    version: row.version,
    updatedAt: row.updated_at.toISOString(),
    createdAt: row.created_at.toISOString(),
    firstPublishedAt: row.first_published_at?.toISOString() ?? null,
  };
}

export const statusOf = (post: Pick<PostRecord, "draft" | "published">) => derivePostStatus(post.draft, post.published);
export const withStatus = (post: PostRecord): PostWithStatus => ({ ...post, status: statusOf(post) });

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "23505";
const longDate = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const jsonb = (value: unknown) => JSON.stringify(value);

function revalidate(slugs: string[], redirects: string[] = []) {
  try {
    revalidateTag("posts", { expire: 0 });
    for (const s of new Set(slugs)) revalidateTag(`post:${s}`, { expire: 0 });
    for (const s of new Set([...slugs, ...redirects])) revalidateTag(`redirect:${s}`, { expire: 0 });
  } catch (error) {
    console.error("[editor] revalidate failed", error);
  }
}

type Tx = postgres.TransactionSql;

async function addRevision(tx: Tx, postId: string, version: number, draft: PostBody, reason: RevisionReason) {
  await tx`INSERT INTO portfolio_post_revisions (post_id, version, draft, reason) VALUES (${postId}, ${version}, ${jsonb(draft)}::text::jsonb, ${reason})`;
  await tx`
    DELETE FROM portfolio_post_revisions
    WHERE post_id = ${postId} AND id < (SELECT id FROM portfolio_post_revisions WHERE post_id = ${postId} ORDER BY id DESC OFFSET ${MAX_REVISIONS - 1} LIMIT 1)`;
}

async function lockPost(tx: Tx, id: string) {
  const rows = await tx<Row[]>`SELECT ${COLS()} FROM portfolio_posts WHERE id = ${id} AND deleted_at IS NULL FOR UPDATE`;
  return rows[0];
}

/* ---------- reads ---------- */

export async function listPosts(): Promise<PostListItem[]> {
  const rows = await sql()<(Omit<Row, "draft" | "published"> & { draft: PostBody; published: PostBody | null; same_content: boolean; words: number })[]>`
    SELECT id, slug, draft - 'content' AS draft, published - 'content' AS published,
           (draft->>'content') IS NOT DISTINCT FROM (published->>'content') AS same_content,
           ${WORDS("draft")} AS words,
           version, updated_at, created_at, first_published_at
    FROM portfolio_posts WHERE deleted_at IS NULL ORDER BY updated_at DESC`;
  return rows.map((r) => {
    const changed = r.published !== null && (!r.same_content || derivePostStatus(r.draft, r.published) === "changed");
    return {
      id: r.id,
      slug: r.draft.slug || r.slug,
      publishedSlug: r.published?.slug ?? null,
      title: r.draft.title ?? "",
      excerpt: r.draft.excerpt ?? "",
      status: r.published === null ? "draft" : changed ? "changed" : "published",
      words: r.words,
      sample: !!r.draft.sample,
      tags: r.draft.tags ?? [],
      cover: r.draft.cover ?? "",
      version: r.version,
      updatedAt: r.updated_at.toISOString(),
      createdAt: r.created_at.toISOString(),
      firstPublishedAt: r.first_published_at?.toISOString() ?? null,
    };
  });
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  if (!isUuid(id)) return null;
  const rows = await sql()<Row[]>`SELECT ${COLS()} FROM portfolio_posts WHERE id = ${id} AND deleted_at IS NULL`;
  return rows[0] ? toRecord(rows[0]) : null;
}

/* ---------- create / save ---------- */

export async function createPost({ title }: { title?: string } = {}): Promise<PostRecord> {
  const name = (title ?? "").trim().slice(0, 140);
  const base = slugify(name);
  const candidate = (n: number) => (base ? (n === 1 ? base : `${base}-${n}`) : `untitled-${n}`);
  const prefix = base || "untitled";
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = new Set(
      (
        await sql()<{ slug: string }[]>`
          SELECT slug FROM portfolio_posts WHERE slug LIKE ${prefix + "%"}
          UNION SELECT from_slug FROM portfolio_slug_redirects WHERE from_slug LIKE ${prefix + "%"}`
      ).map((r) => r.slug),
    );
    let n = 1 + attempt;
    while (taken.has(candidate(n))) n++;
    const slug = candidate(n);
    const draft: PostBody = { slug, title: name, excerpt: "", content: "", date: "", dateISO: "" };
    try {
      const rows = await sql()<Row[]>`INSERT INTO portfolio_posts (slug, draft) VALUES (${slug}, ${jsonb(draft)}::text::jsonb) RETURNING ${COLS()}`;
      return toRecord(rows[0]);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("Could not find a free slug");
}

export async function saveDraft(
  id: string,
  patch: Partial<PostBody>,
  baseVersion: number,
  opts: { checkpoint?: boolean; reason?: "save" | "checkpoint" } = {},
): Promise<SaveResult> {
  if (!isUuid(id)) return { ok: false, error: "not_found" };
  try {
    return await sql().begin(async (tx): Promise<SaveResult> => {
      const cur = await lockPost(tx, id);
      if (!cur) return { ok: false, error: "not_found" };
      if (cur.version !== baseVersion) return { ok: false, conflict: true, current: toRecord(cur) };
      const draft: PostBody = { ...cur.draft, ...patch };
      if (!validSlug(draft.slug ?? "")) draft.slug = cur.draft.slug;
      // The row's slug (public URL) only follows the draft while the post has never been public.
      const neverPublic = cur.first_published_at === null && cur.published === null;
      const slug = neverPublic ? draft.slug : cur.slug;
      if (slug !== cur.slug && (await tx`SELECT 1 FROM portfolio_posts WHERE slug = ${slug}`).length) return { ok: false, error: "slug_taken" };
      const rows = await tx<Row[]>`
        UPDATE portfolio_posts SET slug = ${slug}, draft = ${jsonb(draft)}::text::jsonb, version = version + 1, updated_at = now()
        WHERE id = ${id} AND version = ${baseVersion} AND deleted_at IS NULL RETURNING ${COLS()}`;
      if (!rows[0]) return { ok: false, conflict: true, current: toRecord((await lockPost(tx, id)) ?? cur) };
      if (opts.checkpoint) await addRevision(tx, id, rows[0].version, draft, opts.reason ?? "checkpoint");
      return { ok: true, post: toRecord(rows[0]) };
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "slug_taken" };
    throw error;
  }
}

/* ---------- publish / unpublish / delete ---------- */

export async function publish(id: string, baseVersion: number): Promise<PublishResult> {
  if (!isUuid(id)) return { ok: false, error: "not_found" };
  const touched: { slugs: string[]; redirects: string[] } = { slugs: [], redirects: [] };
  try {
    const result = await sql().begin(async (tx): Promise<PublishResult> => {
      const cur = await lockPost(tx, id);
      if (!cur) return { ok: false, error: "not_found" };
      if (cur.version !== baseVersion) return { ok: false, conflict: true, current: toRecord(cur) };

      const draft = cur.draft;
      const slug = draft.slug;
      const errors = validateForPublish(draft);
      if (validSlug(slug ?? "") && slug !== cur.slug && (await tx`SELECT 1 FROM portfolio_posts WHERE slug = ${slug}`).length) {
        errors.push("That URL is already used by another post.");
      }
      if (errors.length) return { ok: false, errors };

      const now = new Date();
      const first = cur.first_published_at ?? now;
      const published: PostBody = { ...draft, title: draft.title.trim(), excerpt: draft.excerpt.trim(), dateISO: first.toISOString(), date: longDate(first), modifiedISO: now.toISOString() };
      if (draft.cover) {
        const [media] = await tx<{ width: number | null; height: number | null }[]>`SELECT width, height FROM portfolio_media WHERE url = ${draft.cover}`;
        if (media?.width && media.height) Object.assign(published, { coverWidth: media.width, coverHeight: media.height });
      } else {
        delete published.cover;
        delete published.coverAlt;
        delete published.coverWidth;
        delete published.coverHeight;
      }

      const wasPublic = cur.first_published_at !== null || cur.published !== null;
      const existing = await tx<{ from: string; to: string }[]>`
        SELECT from_slug AS "from", to_slug AS "to" FROM portfolio_slug_redirects WHERE to_slug = ${cur.slug} OR from_slug = ${slug}`;
      const plan = wasPublic ? collapseRedirects(existing, cur.slug, slug) : { upsert: [], remove: [] };
      const remove = new Set([...plan.remove, ...existing.filter((r) => r.from === slug).map((r) => r.from)]);
      for (const from of remove) await tx`DELETE FROM portfolio_slug_redirects WHERE from_slug = ${from}`;
      for (const r of plan.upsert) {
        await tx`
          INSERT INTO portfolio_slug_redirects (from_slug, to_slug) VALUES (${r.from}, ${r.to})
          ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug`;
      }

      const rows = await tx<Row[]>`
        UPDATE portfolio_posts
        SET slug = ${slug}, published = ${jsonb(published)}::text::jsonb, first_published_at = coalesce(first_published_at, ${first}),
            version = version + 1, updated_at = now()
        WHERE id = ${id} AND version = ${baseVersion} AND deleted_at IS NULL RETURNING ${COLS()}`;
      if (!rows[0]) return { ok: false, conflict: true, current: toRecord((await lockPost(tx, id)) ?? cur) };
      await addRevision(tx, id, rows[0].version, draft, "publish");
      touched.slugs = [cur.slug, slug];
      touched.redirects = [...plan.upsert.map((r) => r.from), ...remove];
      return { ok: true, post: toRecord(rows[0]) };
    });
    if (result.ok) revalidate(touched.slugs, touched.redirects);
    return result;
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "slug_taken" };
    throw error;
  }
}

export async function unpublish(id: string, baseVersion: number): Promise<UnpublishResult> {
  if (!isUuid(id)) return { ok: false, error: "not_found" };
  const result = await sql().begin(async (tx): Promise<UnpublishResult> => {
    const cur = await lockPost(tx, id);
    if (!cur) return { ok: false, error: "not_found" };
    if (cur.version !== baseVersion) return { ok: false, conflict: true, current: toRecord(cur) };
    if (!cur.published) return { ok: false, error: "not_published" };
    const rows = await tx<Row[]>`
      UPDATE portfolio_posts SET published = NULL, version = version + 1, updated_at = now()
      WHERE id = ${id} AND version = ${baseVersion} RETURNING ${COLS()}`;
    await addRevision(tx, id, rows[0].version, cur.draft, "unpublish");
    return { ok: true, post: toRecord(rows[0]) };
  });
  if (result.ok) revalidate([result.post.slug]);
  return result;
}

/** Only posts that were never public can be deleted; the slug is freed for reuse. */
export async function deletePost(id: string): Promise<DeleteResult> {
  if (!isUuid(id)) return { ok: false, error: "not_found" };
  const rows = await sql()`
    UPDATE portfolio_posts SET deleted_at = now(), slug = 'deleted-' || replace(id::text, '-', ''), updated_at = now()
    WHERE id = ${id} AND deleted_at IS NULL AND first_published_at IS NULL AND published IS NULL RETURNING id`;
  if (rows.length) return { ok: true };
  return (await getPostById(id)) ? { ok: false, error: "was_published" } : { ok: false, error: "not_found" };
}

/* ---------- revisions ---------- */

type RevisionRow = { id: number; version: number; reason: RevisionReason; created_at: Date; title: string | null; words: number };
const toSummary = (r: RevisionRow): RevisionSummary => ({ id: r.id, version: r.version, reason: r.reason, createdAt: r.created_at.toISOString(), title: r.title ?? "", words: r.words });

export async function listRevisions(id: string, limit = 50): Promise<RevisionSummary[]> {
  if (!isUuid(id)) return [];
  const rows = await sql()<RevisionRow[]>`
    SELECT id::int AS id, version, reason, created_at, draft->>'title' AS title, ${WORDS("draft")} AS words
    FROM portfolio_post_revisions WHERE post_id = ${id} ORDER BY id DESC LIMIT ${limit}`;
  return rows.map(toSummary);
}

export async function getRevision(id: string, revId: number): Promise<Revision | null> {
  if (!isUuid(id) || !Number.isSafeInteger(revId)) return null;
  const rows = await sql()<(RevisionRow & { draft: PostBody })[]>`
    SELECT id::int AS id, version, reason, created_at, draft, draft->>'title' AS title, ${WORDS("draft")} AS words
    FROM portfolio_post_revisions WHERE post_id = ${id} AND id = ${revId}`;
  return rows[0] ? { ...toSummary(rows[0]), draft: rows[0].draft } : null;
}

/** Restores the text of a revision. The URL and dates stay as they are; the pre-restore draft is checkpointed. */
export async function restoreRevision(id: string, revId: number, baseVersion: number): Promise<RestoreResult> {
  if (!isUuid(id)) return { ok: false, error: "not_found" };
  return sql().begin(async (tx): Promise<RestoreResult> => {
    const cur = await lockPost(tx, id);
    if (!cur) return { ok: false, error: "not_found" };
    if (cur.version !== baseVersion) return { ok: false, conflict: true, current: toRecord(cur) };
    const [rev] = await tx<{ draft: PostBody }[]>`SELECT draft FROM portfolio_post_revisions WHERE post_id = ${id} AND id = ${revId}`;
    if (!rev) return { ok: false, error: "revision_not_found" };
    await addRevision(tx, id, cur.version, cur.draft, "checkpoint");
    const draft: PostBody = { ...rev.draft, slug: cur.draft.slug, date: cur.draft.date, dateISO: cur.draft.dateISO };
    const rows = await tx<Row[]>`
      UPDATE portfolio_posts SET draft = ${jsonb(draft)}::text::jsonb, version = version + 1, updated_at = now()
      WHERE id = ${id} AND version = ${baseVersion} RETURNING ${COLS()}`;
    await addRevision(tx, id, rows[0].version, draft, "restore");
    return { ok: true, post: toRecord(rows[0]) };
  });
}

/* ---------- preview links ---------- */

const previewHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createPreview(id: string, days = 7): Promise<{ token: string; expiresAt: string } | null> {
  if (!isUuid(id) || !(await getPostById(id))) return null;
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + Math.min(Math.max(Math.floor(days), 1), 30) * 86_400_000);
  await sql()`INSERT INTO portfolio_post_previews (token_hash, post_id, expires_at) VALUES (${previewHash(token)}, ${id}, ${expiresAt})`;
  await sql()`DELETE FROM portfolio_post_previews WHERE expires_at < now() - interval '30 days'`;
  return { token, expiresAt: expiresAt.toISOString() };
}

export async function revokePreviews(id: string): Promise<number> {
  if (!isUuid(id)) return 0;
  return (await sql()`UPDATE portfolio_post_previews SET revoked_at = now() WHERE post_id = ${id} AND revoked_at IS NULL`).count;
}

/** The draft behind a preview token, with display dates filled in; null when expired, revoked or deleted. */
export async function getPreviewPost(token: string): Promise<PostBody | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const rows = await sql()<{ draft: PostBody; first_published_at: Date | null }[]>`
    SELECT p.draft, p.first_published_at FROM portfolio_post_previews v
    JOIN portfolio_posts p ON p.id = v.post_id
    WHERE v.token_hash = ${previewHash(token)} AND v.expires_at > now() AND v.revoked_at IS NULL AND p.deleted_at IS NULL`;
  if (!rows[0]) return null;
  const when = rows[0].first_published_at ?? new Date();
  return { ...rows[0].draft, dateISO: when.toISOString(), date: longDate(when) };
}
