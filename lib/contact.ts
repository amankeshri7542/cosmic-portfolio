import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const MIN_FILL_MS = 3_000;
export const MAX_FILL_MS = 2 * 60 * 60 * 1000;
export const SPAM_THRESHOLD = 2;
export const RATE_LIMIT = { max: 3, windowSeconds: 3600 };

const ABUSIVE_WORDS = [
  "fuck", "shit", "bitch", "bastard", "asshole", "ass", "cunt", "dick", "cock", "pussy", "whore", "slut", "fag", "faggot", "nigger", "nigga",
  "retard", "idiot", "moron", "imbecile", "dumbass", "dipshit", "bullshit", "motherfucker", "fucker", "jackass", "prick", "twat", "wanker",
  // Hindi / Hinglish
  "madarchod", "behenchod", "chutiya", "randi", "gandu", "harami", "bhosdike", "lavde", "lauda", "gaand", "saala", "kamine", "bhosdi",
  "maderchod", "bhenchod", "chodu", "kutte", "kamina", "boor", "bur", "lund", "chutiye",
];
// A vowel may be masked with "*" (f*ck).
const ABUSIVE = ABUSIVE_WORDS.map((w) => new RegExp(`\\b${w.replace(/[aeiou]/g, "[aeiou*]")}\\b`));

const LEET: Record<string, string> = { "@": "a", "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", $: "s", "!": "i" };
const normalise = (text: string) => text.toLowerCase().replace(/[@01345$!]/g, (c) => LEET[c] ?? c);

/** Distinct abusive words plus link stuffing; at or above SPAM_THRESHOLD the message is filed as spam. */
export function spamScore(text: string) {
  const norm = normalise(text);
  const abusive = ABUSIVE.filter((re) => re.test(norm)).length;
  const links = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  return abusive + Math.max(0, links - 2);
}

export type ContactInput = { name: string; email: string; message: string };
export type ContactFields = Partial<Record<keyof ContactInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").trim();

export function validateContact(body: Record<string, unknown>): { ok: true; value: ContactInput } | { ok: false; fields: ContactFields } {
  const fields: ContactFields = {};
  const name = typeof body.name === "string" ? oneLine(body.name) : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.replace(/\r\n?/g, "\n").trim() : "";
  if (name.length < 1 || name.length > 80) fields.name = "Enter your name (up to 80 characters).";
  if (email.length > 254 || !EMAIL.test(email)) fields.email = "Enter a valid email address.";
  if (message.length < 10 || message.length > 4000) fields.message = "Write a message of 10–4000 characters.";
  return Object.keys(fields).length ? { ok: false, fields } : { ok: true, value: { name, email, message } };
}

/* Signed minimum-time token: `<issuedAt base36>.<hmac>`; the server never stores anything. */

export function contactSecret() {
  return process.env.CONTACT_SECRET || (process.env.EDITOR_PASSWORD_HASH ? createHash("sha256").update(`contact:${process.env.EDITOR_PASSWORD_HASH}`).digest("hex") : "dev-contact-secret");
}
const sign = (issued: string, secret: string) => createHmac("sha256", secret).update(issued).digest("hex").slice(0, 32);

export function issueContactToken(now = Date.now(), secret = contactSecret()) {
  const issued = now.toString(36);
  return `${issued}.${sign(issued, secret)}`;
}

export type TokenState = "ok" | "invalid" | "too_fast" | "expired";
export function checkContactToken(token: string, now = Date.now(), secret = contactSecret()): TokenState {
  const [issued, mac, extra] = token.split(".");
  if (!issued || !mac || extra !== undefined || !/^[0-9a-z]{1,12}$/.test(issued)) return "invalid";
  const expected = Buffer.from(sign(issued, secret));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return "invalid";
  const age = now - parseInt(issued, 36);
  if (age < MIN_FILL_MS) return "too_fast";
  return age > MAX_FILL_MS ? "expired" : "ok";
}

export function clientIp(request: Request) {
  return request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
export const hashIp = (ip: string, secret = contactSecret()) => createHash("sha256").update(`${secret}:${ip}`).digest("hex");
