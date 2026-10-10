import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/editor/auth";
import { createPost, saveDraft, type PostRecord } from "@/lib/editor/posts";
import { cookieJar } from "./mocks/next-headers";
import { revalidated } from "./mocks/next-cache";

export const TEST_PASSWORD = "correct horse battery staple";
export const ORIGIN = "http://localhost:3010";

export async function resetDb() {
  await sql()`TRUNCATE portfolio_posts, portfolio_post_revisions, portfolio_slug_redirects, portfolio_post_previews, portfolio_login_failures,
    portfolio_editor_sessions, portfolio_contact_messages, portfolio_media CASCADE`;
  cookieJar.clear();
  revalidated.length = 0;
}

export async function configureEditor() {
  process.env.EDITOR_PASSWORD_HASH = await hashPassword(TEST_PASSWORD, { n: 1024 });
}

export const VALID = {
  title: "A perfectly good title",
  excerpt: "An excerpt that is long enough to pass the publish checklist.",
  content: "# Heading\n\nSome real content that is comfortably over twenty characters.",
};

export async function validPost(patch: Partial<Parameters<typeof saveDraft>[1]> = {}): Promise<PostRecord> {
  const created = await createPost({ title: patch.title ?? VALID.title });
  const saved = await saveDraft(created.id, { ...VALID, ...patch }, created.version);
  if (!saved.ok) throw new Error("fixture save failed");
  return saved.post;
}

export function request(path: string, init: { method?: string; body?: unknown; cookie?: string; headers?: Record<string, string> } = {}) {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = { ...init.headers };
  if (method !== "GET") headers.origin ??= ORIGIN;
  if (init.body !== undefined) headers["content-type"] ??= "application/json";
  if (init.cookie) headers.cookie = init.cookie;
  return new Request(`${ORIGIN}${path}`, { method, headers, body: init.body === undefined ? undefined : JSON.stringify(init.body) });
}
