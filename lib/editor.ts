import { sql } from "@vercel/postgres";
import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { BlogPost } from "./blog-types";

export const SESSION_COOKIE = "portfolio_editor";
const deriveKey = promisify(scrypt);
export const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");
export class EditorError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function editorSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !process.env.POSTGRES_URL) return false;
  const result = await sql`SELECT 1 FROM portfolio_editor_sessions WHERE token_hash = ${tokenHash(token)} AND expires_at > now()`;
  return result.rowCount === 1;
}
export async function requireEditor() {
  if (!await editorSession()) throw new EditorError("Sign in to the writer’s desk.", 401);
}
export function checkOrigin(request: Request) {
  // Next can use its internal hostname in request.url behind a reverse proxy.
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  const protocol = request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1);
  if (request.headers.get("origin") !== `${protocol}://${host}`) throw new EditorError("Request origin is not allowed.", 403);
}
export async function readEditorJSON(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new EditorError("Send JSON content.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new EditorError("The request is empty.");
  let size = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 200_000) { await reader.cancel(); throw new EditorError("Keep the article below 200 KB.", 413); }
    parts.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(parts).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new EditorError("The request contains invalid JSON."); }
}
export function validSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
export function validatePost(data: Record<string, unknown>): BlogPost {
  const text = (key: string, min: number, max: number) => {
    const value = data[key];
    if (typeof value !== "string" || value.trim().length < min || value.length > max) throw new EditorError(`${key}: use ${min}–${max} characters.`);
    return value.trim();
  };
  if (!validSlug(data.slug)) throw new EditorError("Use a URL made of lowercase letters, numbers and hyphens (up to 100 characters).");
  const cover = text("cover", 0, 2000);
  if (cover) {
    try {
      const url = new URL(cover, "https://www.amankeshri.com");
      if (url.protocol !== "https:" || url.username || url.password || cover.startsWith("//")) throw new Error();
    } catch { throw new EditorError("Use an HTTPS image URL or a path starting with /."); }
    if (!cover.startsWith("https://") && !cover.startsWith("/")) throw new EditorError("Use an HTTPS image URL or a path starting with /.");
  }
  const coverAlt = text("coverAlt", cover ? 3 : 0, 300);
  if (typeof data.sample !== "boolean") throw new EditorError("Choose whether this is a sample article.");
  return { slug: data.slug, title: text("title", 3, 140), excerpt: text("excerpt", 20, 320), content: text("content", 20, 150_000), cover, coverAlt, sample: data.sample, date: "Draft", dateISO: "" };
}
export async function login(password: unknown, request: Request) {
  const configured = process.env.EDITOR_PASSWORD_HASH;
  if (!configured || !process.env.POSTGRES_URL) throw new EditorError("The editor is not configured yet.", 503);
  const [salt, hash] = configured.split(":");
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash ?? "")) throw new EditorError("The editor needs a valid password configuration.", 503);
  const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const key = tokenHash(`${salt}:${ip}:${Math.floor(Date.now() / 900_000)}`);
  const attempts = await sql`INSERT INTO portfolio_editor_attempts (key, attempts, expires_at) VALUES (${key}, 1, now() + interval '15 minutes') ON CONFLICT (key) DO UPDATE SET attempts = portfolio_editor_attempts.attempts + 1 RETURNING attempts`;
  if (attempts.rows[0].attempts > 8) throw new EditorError("Too many sign-in attempts. Try again in 15 minutes.", 429);
  if (typeof password !== "string" || password.length > 200) throw new EditorError("Incorrect password.", 401);
  const derived = await deriveKey(password, salt, 64) as Buffer;
  if (!timingSafeEqual(derived, Buffer.from(hash, "hex"))) throw new EditorError("Incorrect password.", 401);
  const token = randomBytes(32).toString("hex");
  await sql`DELETE FROM portfolio_editor_sessions WHERE expires_at <= now()`;
  await sql`DELETE FROM portfolio_editor_attempts WHERE expires_at <= now()`;
  await sql`INSERT INTO portfolio_editor_sessions (token_hash, expires_at) VALUES (${tokenHash(token)}, now() + interval '8 hours')`;
  return token;
}
