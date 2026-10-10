// Sums the gzipped size of the scripts a page loads up front (from its HTML), per route.
import { gzipSync } from "node:zlib";
const base = process.argv[2] ?? "http://127.0.0.1:3001";
const routes = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/work", "/about", "/blogs", "/blogs/aws-db", "/contact", "/write"];
const cache = new Map();
for (const r of routes) {
  const html = await (await fetch(base + r)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  let total = 0;
  for (const s of srcs) {
    if (!cache.has(s)) cache.set(s, gzipSync(Buffer.from(await (await fetch(base + s)).arrayBuffer())).length);
    total += cache.get(s);
  }
  console.log(`${r.padEnd(16)} ${(total / 1024).toFixed(1).padStart(6)} KB gz  (${srcs.length} scripts)`);
}
