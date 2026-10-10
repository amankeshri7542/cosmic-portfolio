// The editor's only door to the server. Every response shape is normalised here.
import type { PostBody } from "@/lib/post-types";

export type Status = "draft" | "published" | "changed";
export type ListItem = { id: string; slug: string; title: string; status: Status; updatedAt: string; version: number };
export type EditorPost = {
  id: string;
  slug: string;
  draft: PostBody;
  published: PostBody | null;
  version: number;
  updatedAt: string;
  firstPublishedAt: string | null;
  status: Status;
};
export type Revision = { id: number | string; version: number; reason: string; createdAt: string; title?: string };
export type Media = { id: string; url: string; width: number | null; height: number | null; alt: string; bytes?: number | null; createdAt?: string };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public data: Record<string, unknown> = {}) {
    super(message);
  }
}

async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json", ...init.headers } : init.headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(res.status, String(data.error ?? res.status), String(data.message ?? defaultMessage(res.status)), data);
  }
  return data as T;
}

function defaultMessage(status: number) {
  if (status === 401) return "Your session ended. Sign in again — your text is kept on this device.";
  if (status === 413) return "That's too large to send in one go.";
  if (status === 429) return "Too many attempts. Wait a few minutes and try again.";
  if (status >= 500) return "The server couldn't complete that. Your text is kept on this device; try again shortly.";
  return "That didn't work.";
}

const enc = encodeURIComponent;

export const api = {
  session: () => call<{ authenticated: boolean; configured?: boolean }>("/api/editor/session"),
  login: (password: string) => call<{ ok: boolean }>("/api/editor/session", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => call<{ ok: boolean }>("/api/editor/session", { method: "DELETE" }),

  list: () => call<{ posts: ListItem[] }>("/api/editor/posts").then((d) => d.posts),
  create: (title?: string) => call<{ post: EditorPost }>("/api/editor/posts", { method: "POST", body: JSON.stringify({ title }) }).then((d) => d.post),
  get: (id: string) => call<{ post: EditorPost }>(`/api/editor/posts/${enc(id)}`).then((d) => d.post),
  save: (id: string, draft: PostBody, baseVersion: number, checkpoint = false) =>
    call<{ post: EditorPost }>(`/api/editor/posts/${enc(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ draft, baseVersion, checkpoint }),
    }).then(({ post }) => ({ version: post.version, updatedAt: post.updatedAt, slug: post.slug, post })),
  publish: (id: string, baseVersion: number) => call<{ post: EditorPost }>(`/api/editor/posts/${enc(id)}/publish`, { method: "POST", body: JSON.stringify({ baseVersion }) }).then((d) => d.post),
  unpublish: (id: string, baseVersion: number) => call<{ post: EditorPost }>(`/api/editor/posts/${enc(id)}/unpublish`, { method: "POST", body: JSON.stringify({ baseVersion }) }).then((d) => d.post),
  remove: (id: string) => call<{ ok: boolean }>(`/api/editor/posts/${enc(id)}`, { method: "DELETE" }),
  revisions: (id: string) => call<{ revisions: Revision[] }>(`/api/editor/posts/${enc(id)}/revisions`).then((d) => d.revisions),
  restore: (id: string, revId: Revision["id"], baseVersion: number) =>
    call<{ post: EditorPost }>(`/api/editor/posts/${enc(id)}/revisions/${enc(String(revId))}/restore`, { method: "POST", body: JSON.stringify({ baseVersion }) }).then((d) => d.post),
  preview: (id: string) => call<{ url: string; expiresAt: string }>(`/api/editor/posts/${enc(id)}/preview`, { method: "POST", body: "{}" }),
  revokePreviews: (id: string) => call<{ ok: boolean }>(`/api/editor/posts/${enc(id)}/preview`, { method: "DELETE" }),
  render: (markdown: string) => call<{ html: string; words: number; toc: { id: string; text: string; depth: number }[] }>("/api/editor/render", { method: "POST", body: JSON.stringify({ markdown }) }),

  media: () => call<{ media: Media[]; driver: "blob" | "local" | "none"; prefix: string }>("/api/editor/media"),
  recordMedia: (m: { url: string; pathname?: string; contentType?: string; bytes?: number; alt: string }) =>
    call<{ media: Media }>("/api/editor/media", { method: "POST", body: JSON.stringify(m) }).then((d) => d.media),
  updateAlt: (id: string, alt: string) => call<{ media: Media }>("/api/editor/media", { method: "PATCH", body: JSON.stringify({ id, alt }) }),
  deleteMedia: (id: string) => call<{ ok: boolean }>(`/api/editor/media?id=${enc(id)}`, { method: "DELETE" }),
};

/** Upload one image with whichever storage the server is configured for, then record it. */
export async function uploadImage(file: File, alt: string, driver: "blob" | "local" | "none", prefix: string): Promise<Media> {
  if (driver === "none") throw new ApiError(503, "storage_unavailable", "Image storage isn't configured on this server.");
  if (driver === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+/, "") || "image";
    const blob = await upload(`${prefix}${safe}`, file, { access: "public", handleUploadUrl: "/api/editor/media/upload", contentType: file.type });
    return api.recordMedia({ url: blob.url, pathname: blob.pathname, contentType: file.type, bytes: file.size, alt });
  }
  // Local development storage registers the file in the same request.
  const form = new FormData();
  form.append("file", file);
  form.append("alt", alt);
  return call<{ media: Media }>("/api/editor/media/upload", { method: "POST", body: form }).then((d) => d.media);
}
