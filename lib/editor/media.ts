import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { sql } from "../db";
import type { ImageInfo } from "../markdown";
import { ApiError } from "./http";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"];
const FORMAT_TYPES: Record<string, string> = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif", heif: "image/avif", gif: "image/gif" };
const EXTENSIONS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads-dev");
const LOCAL_URL = "/uploads-dev/";

export type MediaRecord = {
  id: string;
  url: string;
  pathname: string | null;
  contentType: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  alt: string;
  lqip: string | null;
  createdAt: string;
};
type Row = { id: string; url: string; pathname: string | null; content_type: string | null; bytes: number | null; width: number | null; height: number | null; alt: string; lqip: string | null; created_at: Date };
const toMedia = (r: Row): MediaRecord => ({ id: r.id, url: r.url, pathname: r.pathname, contentType: r.content_type, bytes: r.bytes, width: r.width, height: r.height, alt: r.alt, lqip: r.lqip, createdAt: r.created_at.toISOString() });
const COLS = () => sql()`id, url, pathname, content_type, bytes, width, height, alt, lqip, created_at`;

const isProduction = () => process.env.NODE_ENV === "production";
// A local production preview (`next start` on this machine) may opt into filesystem uploads. Never on Vercel.
const localAllowed = () => !isProduction() || (process.env.MEDIA_DRIVER === "local" && !process.env.VERCEL);

/** Vercel Blob when a token is configured; otherwise files under public/uploads-dev (never in production). */
export function mediaDriver(): "blob" | "local" | "none" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return localAllowed() ? "local" : "none";
}
export const uploadPrefix = () => (isProduction() ? "blog/" : "dev/blog/");

export function isAllowedMediaUrl(url: string) {
  if (url.startsWith(LOCAL_URL)) return localAllowed() && !url.includes("..") && !url.includes("\\") && !url.includes("?") && !url.includes("#");
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function analyzeImage(buffer: Buffer) {
  const sharp = (await import("sharp")).default;
  try {
    const meta = await sharp(buffer, { limitInputPixels: 100_000_000 }).metadata();
    const contentType = meta.format ? FORMAT_TYPES[meta.format] : undefined;
    if (!contentType || !meta.width || !meta.height) throw new Error("unsupported");
    const swap = (meta.orientation ?? 1) >= 5;
    const lqip = await sharp(buffer).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    return {
      contentType,
      width: swap ? meta.height : meta.width,
      height: swap ? meta.width : meta.height,
      lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
    };
  } catch {
    throw new ApiError(422, "not_an_image", "That file is not a supported image (PNG, JPEG, WebP, AVIF or GIF).");
  }
}

async function fetchBytes(url: string): Promise<Buffer> {
  if (url.startsWith(LOCAL_URL)) {
    const file = path.join(LOCAL_DIR, url.slice(LOCAL_URL.length));
    if (!file.startsWith(LOCAL_DIR + path.sep)) throw new ApiError(422, "invalid_url", "Unsupported media URL.");
    return readFile(file).catch(() => {
      throw new ApiError(502, "probe_failed", "Could not read the uploaded file.");
    });
  }
  const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10_000) }).catch(() => null);
  if (!res?.ok || !res.body) throw new ApiError(502, "probe_failed", "Could not fetch the uploaded image.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of res.body) {
    size += chunk.byteLength;
    if (size > MAX_UPLOAD_BYTES) throw new ApiError(413, "payload_too_large", "Images must be 8 MB or smaller.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function recordMedia(input: { url: string; pathname?: string | null; contentType?: string | null; bytes?: number | null; alt?: string }, bytes?: Buffer): Promise<MediaRecord> {
  if (!isAllowedMediaUrl(input.url)) throw new ApiError(422, "invalid_url", "That URL is not in this site's media storage.");
  const buffer = bytes ?? (await fetchBytes(input.url));
  const info = await analyzeImage(buffer);
  const alt = (input.alt ?? "").trim().slice(0, 500);
  const rows = await sql()<Row[]>`
    INSERT INTO portfolio_media (url, pathname, content_type, bytes, width, height, alt, lqip)
    VALUES (${input.url}, ${input.pathname ?? null}, ${info.contentType}, ${buffer.length}, ${info.width}, ${info.height}, ${alt}, ${info.lqip})
    ON CONFLICT (url) DO UPDATE SET content_type = EXCLUDED.content_type, bytes = EXCLUDED.bytes, width = EXCLUDED.width, height = EXCLUDED.height,
      lqip = EXCLUDED.lqip, alt = CASE WHEN EXCLUDED.alt = '' THEN portfolio_media.alt ELSE EXCLUDED.alt END, deleted_at = NULL
    RETURNING ${COLS()}`;
  return toMedia(rows[0]);
}

/** Development only: store the file under public/uploads-dev and register it. */
export async function storeLocalUpload(buffer: Buffer, originalName: string, alt: string) {
  if (mediaDriver() !== "local") throw new ApiError(503, "storage_unavailable", "Local uploads are disabled here.");
  if (buffer.length > MAX_UPLOAD_BYTES) throw new ApiError(413, "payload_too_large", "Images must be 8 MB or smaller.");
  const info = await analyzeImage(buffer);
  const stem = originalName.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
  const name = `${stem}-${randomBytes(4).toString("hex")}.${EXTENSIONS[info.contentType]}`;
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), buffer);
  return recordMedia({ url: LOCAL_URL + name, pathname: `uploads-dev/${name}`, alt }, buffer);
}

export async function listMedia(limit = 200): Promise<MediaRecord[]> {
  const rows = await sql()<Row[]>`SELECT ${COLS()} FROM portfolio_media WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(toMedia);
}

export async function updateAlt(id: string, alt: string): Promise<MediaRecord | null> {
  const rows = await sql()<Row[]>`UPDATE portfolio_media SET alt = ${alt.trim().slice(0, 500)} WHERE id = ${id} AND deleted_at IS NULL RETURNING ${COLS()}`;
  return rows[0] ? toMedia(rows[0]) : null;
}

/** Hides the image from the library; the file stays in storage so published posts keep working. */
export async function softDeleteMedia(id: string): Promise<boolean> {
  return (await sql()`UPDATE portfolio_media SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL`).count > 0;
}

export async function imageInfoMap(urls: string[]): Promise<Record<string, ImageInfo>> {
  const unique = [...new Set(urls)].slice(0, 200);
  if (!unique.length) return {};
  const rows = await sql()<{ url: string; width: number; height: number; lqip: string | null }[]>`
    SELECT url, width, height, lqip FROM portfolio_media WHERE url IN ${sql()(unique)} AND width IS NOT NULL AND height IS NOT NULL`;
  return Object.fromEntries(rows.map((r) => [r.url, { width: r.width, height: r.height, ...(r.lqip ? { lqip: r.lqip } : {}) }]));
}
