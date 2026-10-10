// Screenshots for visual review: node scripts/qa/shoot.mjs <outDir> <width> <height> <path[#selector]>...
import { chromium } from "@playwright/test";
const [out, w, h, ...targets] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
for (const t of targets) {
  const [path, sel] = t.split("@");
  await p.goto(`http://127.0.0.1:3001${path}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const name = `${out}/${w}-${(path + (sel ?? "")).replace(/[^a-z0-9]+/gi, "_")}.jpg`;
  if (sel) await p.locator(sel).first().screenshot({ path: name, type: "jpeg", quality: 80 });
  else await p.screenshot({ path: name, type: "jpeg", quality: 80, fullPage: false });
  console.log(name);
}
await b.close();
