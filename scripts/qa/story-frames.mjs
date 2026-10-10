// Captures the home story at each chapter: node scripts/qa/story-frames.mjs <outDir> <width> <height>
import { chromium } from "@playwright/test";
const [out = ".qa", w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-angle=metal"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const ids = ["top", "interface", "api", "data", "ship", "ai", "run", "projects"];
for (const id of ids) {
  if (id !== "top") {
    await p.evaluate((id) => {
      const el = document.getElementById(id);
      const y = el.getBoundingClientRect().top + window.scrollY - (id === "projects" ? 0 : window.innerHeight * 0.1);
      window.scrollTo(0, y);
    }, id);
  }
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${out}/story-${w}-${id}.jpg`, type: "jpeg", quality: 78 });
}
console.log("ok", await p.evaluate(() => [document.documentElement.className, document.querySelector("[data-stage-label]")?.textContent]));
await b.close();
