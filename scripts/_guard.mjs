import { createHash } from "node:crypto";

const PRODUCTION_HOST_SHA256 = "eecf49592317e11d48e7b891d35c977a1d5098da53ed94d3c7206b23c839981c";

export function targetUrl() {
  return process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
}

export function describeTarget(url) {
  const { hostname, pathname } = new URL(url);
  const host = hostname.length > 8 ? `${hostname.slice(0, 4)}…${hostname.slice(-8)}` : hostname;
  return `${host}${pathname}`;
}

export function isLocal(url) {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(new URL(url).hostname);
}

export function isProduction(url) {
  const host = new URL(url).hostname.replace("-pooler", "");
  return createHash("sha256").update(host).digest("hex") === PRODUCTION_HOST_SHA256;
}

export function connectionOptions(url) {
  return { max: 1, onnotice: () => {}, prepare: false, connect_timeout: 15, ssl: isLocal(url) ? false : "require" };
}
