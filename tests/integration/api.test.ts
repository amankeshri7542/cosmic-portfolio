import { beforeEach, describe, expect, it, vi } from "vitest";
import { sql } from "@/lib/db";
import { clearLoginFailures, loginLockedOut, recordLoginFailure } from "@/lib/editor/auth";
import { GET as sessionGet, POST as sessionPost, DELETE as sessionDelete } from "@/app/api/editor/session/route";
import { GET as postsGet, POST as postsPost } from "@/app/api/editor/posts/route";
import { GET as postGet, PATCH as postPatch, DELETE as postDelete } from "@/app/api/editor/posts/[id]/route";
import { POST as publishPost } from "@/app/api/editor/posts/[id]/publish/route";
import { POST as previewPost } from "@/app/api/editor/posts/[id]/preview/route";
import { GET as health } from "@/app/api/health/route";
import { configureEditor, request, resetDb, TEST_PASSWORD, VALID } from "../helpers";

vi.mock("next/server", async (importOriginal) => ({ ...(await importOriginal<typeof import("next/server")>()), connection: async () => {} }));

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function signIn() {
  const res = await sessionPost(request("/api/editor/session", { method: "POST", body: { password: TEST_PASSWORD } }));
  expect(res.status).toBe(200);
  const cookie = res.headers.get("set-cookie")!;
  expect(cookie).toMatch(/^ak_editor=[a-f0-9]{64}/);
  expect(cookie).toMatch(/HttpOnly/i);
  expect(cookie).toMatch(/SameSite=strict/i);
  return cookie.split(";")[0];
}

beforeEach(async () => {
  await resetDb();
  await configureEditor();
});

describe("session and auth", () => {
  it("logs in, reports status, and logs out", async () => {
    expect(await (await sessionGet(request("/api/editor/session"))).json()).toEqual({ configured: true, authenticated: false });
    const cookie = await signIn();
    const status = await (await sessionGet(request("/api/editor/session", { cookie }))).json();
    expect(status).toMatchObject({ configured: true, authenticated: true });
    expect((await sql()`SELECT token_hash FROM portfolio_editor_sessions`)[0].token_hash).not.toBe(cookie.split("=")[1]);

    const out = await sessionDelete(request("/api/editor/session", { method: "DELETE", cookie }));
    expect(out.status).toBe(200);
    expect(await (await sessionGet(request("/api/editor/session", { cookie }))).json()).toMatchObject({ authenticated: false });
  });

  it("extends the session lifetime as it is used (sliding expiry)", async () => {
    const cookie = await signIn();
    await sql()`UPDATE portfolio_editor_sessions SET expires_at = now() + interval '1 hour'`;
    await postsGet(request("/api/editor/posts", { cookie }));
    const [row] = await sql()<{ hours: number }[]>`SELECT extract(epoch FROM expires_at - now()) / 3600 AS hours FROM portfolio_editor_sessions`;
    expect(Number(row.hours)).toBeGreaterThan(11);
  });

  it("401 without a session, 403 for a foreign origin, 415/413 for bad bodies, 404 for bad ids", async () => {
    expect((await postsGet(request("/api/editor/posts"))).status).toBe(401);
    const cookie = await signIn();
    expect((await postsPost(request("/api/editor/posts", { method: "POST", body: {}, headers: { origin: "https://evil.example" }, cookie }))).status).toBe(403);
    expect((await postsPost(request("/api/editor/posts", { method: "POST", body: {}, headers: { "sec-fetch-site": "cross-site" }, cookie }))).status).toBe(403);
    expect((await postsPost(request("/api/editor/posts", { method: "POST", body: {}, headers: { "content-type": "text/plain" }, cookie }))).status).toBe(415);
    expect((await postsPost(request("/api/editor/posts", { method: "POST", body: { title: "x".repeat(20_000) }, cookie }))).status).toBe(413);
    expect((await postGet(request("/api/editor/posts/nope", { cookie }), ctx("nope"))).status).toBe(404);
  });

  it("503 when the editor is not configured", async () => {
    delete process.env.EDITOR_PASSWORD_HASH;
    expect((await postsGet(request("/api/editor/posts"))).status).toBe(503);
    expect(await (await sessionGet(request("/api/editor/session"))).json()).toEqual({ configured: false, authenticated: false });
    expect((await sessionPost(request("/api/editor/session", { method: "POST", body: { password: "x" } }))).status).toBe(503);
  });
});

describe("post routes", () => {
  it("creates, saves with a 409 on a stale version, publishes with a 422 checklist, and previews", async () => {
    const cookie = await signIn();
    const created = await postsPost(request("/api/editor/posts", { method: "POST", body: { title: "Route test post" }, cookie }));
    expect(created.status).toBe(201);
    const { post } = await created.json();
    expect(post).toMatchObject({ status: "draft", slug: "route-test-post", version: 1 });

    const patch = (body: unknown) => postPatch(request(`/api/editor/posts/${post.id}`, { method: "PATCH", body, cookie }), ctx(post.id));
    const saved = await patch({ baseVersion: 1, draft: { excerpt: VALID.excerpt, content: "short" } });
    expect(saved.status).toBe(200);
    const stale = await patch({ baseVersion: 1, draft: { content: VALID.content } });
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ error: "version_conflict", current: { version: 2, draft: { content: "short" } } });
    expect((await patch({ baseVersion: 2, draft: { slug: "Bad Slug" } })).status).toBe(422);
    expect((await patch({ draft: {} })).status).toBe(400);

    const refused = await publishPost(request(`/api/editor/posts/${post.id}/publish`, { method: "POST", body: { baseVersion: 2 }, cookie }), ctx(post.id));
    expect(refused.status).toBe(422);
    expect((await refused.json()).errors).toEqual([expect.stringMatching(/content/)]);

    await patch({ baseVersion: 2, draft: { content: VALID.content } });
    const live = await publishPost(request(`/api/editor/posts/${post.id}/publish`, { method: "POST", body: { baseVersion: 3 }, cookie }), ctx(post.id));
    expect(live.status).toBe(200);
    expect((await live.json()).post).toMatchObject({ status: "published", version: 4 });

    const preview = await previewPost(request(`/api/editor/posts/${post.id}/preview`, { method: "POST", body: {}, cookie }), ctx(post.id));
    expect(preview.status).toBe(201);
    expect((await preview.json()).url).toMatch(/^\/preview\/[A-Za-z0-9_-]{32}$/);

    const del = await postDelete(request(`/api/editor/posts/${post.id}`, { method: "DELETE", cookie }), ctx(post.id));
    expect(del.status).toBe(409);
    expect(await del.json()).toMatchObject({ error: "was_published" });

    const list = await (await postsGet(request("/api/editor/posts", { cookie }))).json();
    expect(list.posts).toHaveLength(1);
    expect(list.posts[0]).toMatchObject({ status: "published", title: "Route test post" });
    expect(list.posts[0]).not.toHaveProperty("content");
    expect(list.posts[0]).not.toHaveProperty("draft");
  });
});

describe("login lockout", () => {
  const login = (password: string, ip = "203.0.113.7") =>
    sessionPost(request("/api/editor/session", { method: "POST", body: { password }, headers: { "x-forwarded-for": `${ip}, 10.0.0.1` } }));
  const failures = async () => (await sql()<{ n: number }[]>`SELECT count(*)::int AS n FROM portfolio_login_failures`)[0].n;

  it("counts only failures, locks out the 9th attempt, and a success resets the key", async () => {
    for (let i = 0; i < 5; i++) expect((await login(TEST_PASSWORD)).status).toBe(200);
    expect(await failures()).toBe(0);

    for (let i = 0; i < 8; i++) expect((await login("wrong")).status).toBe(401);
    const locked = await login("wrong");
    expect(locked.status).toBe(429);
    expect(locked.headers.get("retry-after")).toBe("900");
    expect((await login(TEST_PASSWORD)).status).toBe(429);
    expect((await login(TEST_PASSWORD, "198.51.100.9")).status).toBe(200);

    await sql()`UPDATE portfolio_login_failures SET failed_at = now() - interval '16 minutes'`;
    expect((await login(TEST_PASSWORD)).status).toBe(200);
  });

  it("uses a sliding window and a successful login deletes that key's failures", async () => {
    const req = request("/api/editor/session", { headers: { "x-forwarded-for": "192.0.2.1" } });
    for (let i = 0; i < 7; i++) await recordLoginFailure(req);
    expect(await loginLockedOut(req)).toBe(false);
    await recordLoginFailure(req);
    expect(await loginLockedOut(req)).toBe(true);
    await clearLoginFailures(req);
    expect(await loginLockedOut(req)).toBe(false);

    await sql()`TRUNCATE portfolio_login_failures`;
    for (let i = 0; i < 8; i++) await recordLoginFailure(req);
    await sql()`UPDATE portfolio_login_failures SET failed_at = now() - interval '14 minutes' WHERE id IN (SELECT id FROM portfolio_login_failures ORDER BY id LIMIT 4)`;
    expect(await loginLockedOut(req)).toBe(true);
    await sql()`UPDATE portfolio_login_failures SET failed_at = now() - interval '16 minutes' WHERE id IN (SELECT id FROM portfolio_login_failures ORDER BY id LIMIT 8)`;
    expect(await loginLockedOut(req)).toBe(false);
  });

  it("applies a global cap across clients", async () => {
    for (let i = 0; i < 50; i++) await recordLoginFailure(request("/x", { headers: { "x-forwarded-for": `10.1.${Math.floor(i / 250)}.${i}` } }));
    expect((await login(TEST_PASSWORD, "198.51.100.200")).status).toBe(429);
    await sql()`UPDATE portfolio_login_failures SET failed_at = now() - interval '16 minutes'`;
    expect((await login(TEST_PASSWORD, "198.51.100.200")).status).toBe(200);
  });
});

describe("health", () => {
  it("reports the database", async () => {
    const res = await health();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok", db: "ok" });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
