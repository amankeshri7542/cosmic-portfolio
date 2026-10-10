// Mobile story frames scrolled the way a reader would: chapter title just below the pinned stage.
import { chromium, devices } from "@playwright/test";
const out = process.argv[2] ?? ".qa";
const b = await chromium.launch();
const p = await b.newPage({ ...devices["Pixel 7"] });
await p.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
for (const id of ["top", "interface", "data", "ai", "run", "projects"]) {
  if (id !== "top") await p.evaluate((id) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - innerHeight * 0.5), id);
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `${out}/m-${id}.jpg`, type: "jpeg", quality: 75 });
}
await b.close();
