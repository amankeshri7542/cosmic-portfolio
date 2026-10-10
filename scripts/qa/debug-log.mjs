import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
for (const id of ["interface", "api", "data"]) {
  await p.evaluate((id) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - innerHeight * 0.1), id);
  await p.waitForTimeout(1500);
  console.log(id, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll("ol[aria-hidden='true'] li")].map((l) => [l.dataset.s, getComputedStyle(l).display, getComputedStyle(l).opacity, Math.round(l.getBoundingClientRect().top)]))));
}
await b.close();
