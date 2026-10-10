import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { hasDatabase, sql } from "../db";
import { ApiError, Halt, json, readJson } from "./http";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const FAILURE_WINDOW = "15 minutes";
const MAX_FAILURES_PER_IP = 8;
const MAX_FAILURES_GLOBAL = 50;
const MAX_PASSWORD_LENGTH = 256;

const prod = () => process.env.NODE_ENV === "production";
export const sessionCookieName = () => (prod() ? "__Host-ak_editor" : "ak_editor");
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/* ---------- password hashing ---------- */

type Hash = { n: number; r: number; p: number; salt: Buffer; key: Buffer; legacySalt?: string };

function derive(password: string, salt: string | Buffer, length: number, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, length, { N: n, r, p, maxmem: 256 * n * r + 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export function parsePasswordHash(value: string | undefined): Hash | null {
  if (!value) return null;
  const modern = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([a-f0-9]+)\$([a-f0-9]+)$/.exec(value);
  if (modern) {
    const [n, r, p] = [Number(modern[1]), Number(modern[2]), Number(modern[3])];
    if (n < 2 || n > 2 ** 20 || (n & (n - 1)) !== 0 || r < 1 || r > 32 || p < 1 || p > 16) return null;
    return { n, r, p, salt: Buffer.from(modern[4], "hex"), key: Buffer.from(modern[5], "hex") };
  }
  const legacy = /^([a-f0-9]{32}):([a-f0-9]{128})$/.exec(value);
  if (legacy) return { n: 16384, r: 8, p: 1, salt: Buffer.from(legacy[1], "hex"), key: Buffer.from(legacy[2], "hex"), legacySalt: legacy[1] };
  return null;
}

export async function hashPassword(password: string, { n = 2 ** 15, r = 8, p = 1 } = {}) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, 64, n, r, p);
  return `scrypt$${n}$${r}$${p}$${salt.toString("hex")}$${key.toString("hex")}`;
}

/** Constant-time check against EDITOR_PASSWORD_HASH (legacy `salt:key` or `scrypt$N$r$p$salt$key`). */
export async function verifyPassword(password: string, configured = process.env.EDITOR_PASSWORD_HASH) {
  const hash = parsePasswordHash(configured);
  if (!hash || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) return false;
  // Legacy hashes were made by passing the hex salt string itself to scrypt; accept the decoded bytes too.
  const salts: (string | Buffer)[] = hash.legacySalt ? [hash.legacySalt, hash.salt] : [hash.salt];
  let ok = false;
  for (const salt of salts) {
    const key = await derive(password, salt, hash.key.length, hash.n, hash.r, hash.p);
    if (timingSafeEqual(key, hash.key)) ok = true;
  }
  return ok;
}

/* ---------- sessions ---------- */

export type Session = { tokenHash: string; expiresAt: Date };

export function editorConfigured() {
  return hasDatabase() && parsePasswordHash(process.env.EDITOR_PASSWORD_HASH) !== null;
}

export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await sql()`DELETE FROM portfolio_editor_sessions WHERE expires_at <= now()`;
  await sql()`INSERT INTO portfolio_editor_sessions (token_hash, expires_at) VALUES (${sha256(token)}, ${expiresAt})`;
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  await sql()`DELETE FROM portfolio_editor_sessions WHERE token_hash = ${sha256(token)}`;
}

async function sessionFromToken(token: string | undefined): Promise<Session | null> {
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !hasDatabase()) return null;
  const tokenHash = sha256(token);
  const rows = await sql()<{ expires_at: Date }[]>`SELECT expires_at FROM portfolio_editor_sessions WHERE token_hash = ${tokenHash} AND expires_at > now()`;
  if (!rows[0]) return null;
  let expiresAt = rows[0].expires_at;
  // Sliding expiry, written at most about once an hour.
  if (expiresAt.getTime() - Date.now() < SESSION_TTL_MS - 60 * 60 * 1000) {
    expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await sql()`UPDATE portfolio_editor_sessions SET expires_at = ${expiresAt} WHERE token_hash = ${tokenHash}`;
  }
  return { tokenHash, expiresAt };
}

/** For server components and actions. */
export async function getSession() {
  return sessionFromToken((await cookies()).get(sessionCookieName())?.value);
}

function cookieFrom(request: Request, name: string) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

/** The session, or a ready-made 401 (503 when the editor is not configured). */
export async function requireEditor(request: Request): Promise<Session | Response> {
  if (!editorConfigured()) return json({ error: "not_configured", message: "The editor is not configured on this server." }, 503);
  const session = await sessionFromToken(cookieFrom(request, sessionCookieName()));
  return session ?? json({ error: "unauthorized", message: "Sign in to continue." }, 401);
}

const cookieOptions = (maxAge: number) => ({ httpOnly: true, sameSite: "strict" as const, path: "/", secure: prod(), maxAge });
export const setSessionCookie = (res: NextResponse, token: string) => res.cookies.set(sessionCookieName(), token, cookieOptions(Math.floor(SESSION_TTL_MS / 1000)));
export const clearSessionCookie = (res: NextResponse) => res.cookies.set(sessionCookieName(), "", cookieOptions(0));
export const sessionTokenFrom = (request: Request) => cookieFrom(request, sessionCookieName());

/* ---------- trusted devices ---------- */
// A browser that has signed in successfully gets a signed, long-lived device cookie. When attackers trip the
// global lockout, trusted devices can still sign in, so a flood of wrong passwords can't lock the owner out.
// Changing the password (EDITOR_PASSWORD_HASH) invalidates every device.
const DEVICE_TTL_S = 180 * 24 * 60 * 60;
export const deviceCookieName = () => (prod() ? "__Host-ak_device" : "ak_device");
const deviceSig = (id: string) => createHmac("sha256", `device:${process.env.EDITOR_PASSWORD_HASH ?? ""}`).update(id).digest("hex");
export function setDeviceCookie(res: NextResponse) {
  const id = randomBytes(16).toString("hex");
  res.cookies.set(deviceCookieName(), `${id}.${deviceSig(id)}`, cookieOptions(DEVICE_TTL_S));
}
export function trustedDevice(request: Request) {
  const value = cookieFrom(request, deviceCookieName());
  const m = value ? /^([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(value) : null;
  if (!m) return false;
  const a = Buffer.from(m[2], "hex");
  const b = Buffer.from(deviceSig(m[1]), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- CSRF ---------- */

const first = (value: string | null) => value?.split(",")[0].trim() || "";

/** Same-origin only: Origin must equal the public origin and Sec-Fetch-Site, if sent, must be same-origin. */
export function checkOrigin(request: Request): Response | null {
  const url = new URL(request.url);
  const host = first(request.headers.get("x-forwarded-host")) || request.headers.get("host") || url.host;
  const proto = first(request.headers.get("x-forwarded-proto")) || url.protocol.slice(0, -1);
  const site = request.headers.get("sec-fetch-site");
  if (request.headers.get("origin") !== `${proto}://${host}` || (site !== null && site !== "same-origin")) {
    return json({ error: "forbidden_origin", message: "Cross-origin requests are not allowed." }, 403);
  }
  return null;
}

/** Origin check + session for a mutating route; returns the session or the response to send. */
export async function guardMutation(request: Request): Promise<Session | Response> {
  return checkOrigin(request) ?? (await requireEditor(request));
}

/** For route handlers: the session, or a thrown Halt carrying the 401/403/503 response. */
export async function authorize(request: Request, mutate = false): Promise<Session> {
  const result = mutate ? await guardMutation(request) : await requireEditor(request);
  if (result instanceof Response) throw new Halt(result);
  return result;
}

/* ---------- login lockout ---------- */

function clientIp(request: Request) {
  return request.headers.get("x-vercel-forwarded-for") || first(request.headers.get("x-forwarded-for")) || "local";
}

const lockoutSalt = () => process.env.EDITOR_PASSWORD_HASH?.split(/[:$]/).filter(Boolean).at(-2) ?? "unconfigured";
const failureKeys = (request: Request) => ({ ip: sha256(`ip:${lockoutSalt()}:${clientIp(request)}`), global: sha256(`global:${lockoutSalt()}`) });

export async function loginLockedOut(request: Request) {
  const keys = failureKeys(request);
  const rows = await sql()<{ key: string; n: number }[]>`
    SELECT key, count(*)::int AS n FROM portfolio_login_failures
    WHERE key IN (${keys.ip}, ${keys.global}) AND failed_at > now() - ${FAILURE_WINDOW}::interval GROUP BY key`;
  const n = (key: string) => rows.find((r) => r.key === key)?.n ?? 0;
  return n(keys.ip) >= MAX_FAILURES_PER_IP || (n(keys.global) >= MAX_FAILURES_GLOBAL && !trustedDevice(request));
}

export async function recordLoginFailure(request: Request) {
  const keys = failureKeys(request);
  await sql()`INSERT INTO portfolio_login_failures (key) VALUES (${keys.ip}), (${keys.global})`;
  await sql()`DELETE FROM portfolio_login_failures WHERE failed_at < now() - interval '1 day'`;
}

export async function clearLoginFailures(request: Request) {
  await sql()`DELETE FROM portfolio_login_failures WHERE key = ${failureKeys(request).ip}`;
}

export async function login(request: Request) {
  if (!editorConfigured()) throw new ApiError(503, "not_configured", "The editor is not configured on this server.");
  const body = await readJson(request, 2_000);
  if (await loginLockedOut(request)) {
    throw new ApiError(429, "rate_limited", "Too many failed sign-ins. Try again in 15 minutes.", {}, { "Retry-After": "900" });
  }
  const ok = typeof body.password === "string" && (await verifyPassword(body.password));
  if (!ok) {
    await recordLoginFailure(request);
    throw new ApiError(401, "invalid_credentials", "Incorrect password.");
  }
  await clearLoginFailures(request);
  return createSession();
}
