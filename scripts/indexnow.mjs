// Submit every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam, Naver…). Run after a deploy:
//   node scripts/indexnow.mjs
import { readFileSync } from "node:fs";
const site = "https://www.amankeshri.com";
const key = /INDEXNOW_KEY = "([a-f0-9]+)"/.exec(readFileSync("lib/indexnow.ts", "utf8"))[1];
const xml = await (await fetch(`${site}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).concat([`${site}/llms.txt`, `${site}/llms-full.txt`]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} — ${urlList.length} URLs`);
