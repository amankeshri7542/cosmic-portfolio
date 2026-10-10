// Full-page capture after the motion layer settles: node scripts/qa/full.mjs <out.jpg> <path> [width]
import { chromium } from "@playwright/test";
const [out, path, w = "1440"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: 900 }, reducedMotion: "reduce" });
await p.goto(`http://127.0.0.1:3001${path}`, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 70 });
await b.close();
