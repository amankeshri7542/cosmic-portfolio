import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";
const dir = "docs/qa/responsive";
fs.mkdirSync(dir, { recursive: true });
const report = { checks: [], errors: [] };
const check = (name, value) => { assert.ok(value, name); report.checks.push(name); };
const browser = await chromium.launch({ channel: "chrome", headless: true });
const sizes = [[320,568],[360,800],[390,844],[430,932],[600,900],[760,1024],[761,1024],[820,1180],[1024,768],[667,375],[844,390],[1440,900],[1920,1080],[2560,1440]];
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.on("pageerror", error => report.errors.push(error.message));
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const route of ["/", "/work", "/about", "/blogs", "/blogs/aws-db", "/blogs/one-sale-three-records", "/blogs/when-a-recipient-goes-offline", "/blogs/patterns-between-patterns", "/contact", "/thank-you"]) {
      const response = await page.goto(origin + route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator("details").evaluateAll(es => es.forEach(e => e.open = true));
      check(`${width}x${height} ${route}: loaded and expanded content fits`, response.ok() && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      check(`${width}x${height} ${route}: header controls fit without collisions`, await page.locator(".site-header").evaluate(e => {
        const visible = [...e.querySelectorAll(".wordmark,.desktop-nav,.header-right")].filter(e => e.getBoundingClientRect().width > 0);
        return visible.every((e, i) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && (!i || visible[i-1].getBoundingClientRect().right <= r.left); });
      }));
      if (route === "/") {
        check(`${width}x${height}: diagram notes clear the records and workflow`, await page.evaluate(() => {
          const receipt = document.querySelector(".receipt").getBoundingClientRect();
          const note = document.querySelector(".transaction-note").getBoundingClientRect();
          const track = document.querySelector(".workflow-track").getBoundingClientRect();
          const margin = document.querySelector(".workflow-margin").getBoundingClientRect();
          return note.top >= receipt.bottom && (margin.top >= track.bottom || margin.left >= track.right);
        }));
        if ([320,761].includes(width)) {
          await page.screenshot({ path: `${dir}/home-${width}.png` });
          for (const selector of [".workflow-drawing", ".transaction-drawing", ".interference-study"]) {
            await page.locator(selector).screenshot({ path: `${dir}/${selector.slice(1)}-${width}.png` });
          }
        }
      }
    }
  }
  await page.close();
  const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  touch.on("pageerror", error => report.errors.push(error.message));
  await touch.goto(origin, { waitUntil: "networkidle" });
  await touch.getByRole("button", { name: "Open navigation" }).tap();
  await touch.getByRole("navigation", { name: "Mobile navigation", exact: true }).getByRole("link", { name: "Blog", exact: true }).tap();
  await touch.waitForURL("**/blogs");
  check("Touch menu opens the blog", await touch.locator(".blog-feature").first().isVisible());
  await touch.screenshot({ path: `${dir}/blog-touch.png` });
  await touch.goto(origin, { waitUntil: "networkidle" });
  const slider = touch.getByRole("slider", { name: "Separate the layers" });
  await slider.scrollIntoViewIfNeeded();
  await slider.waitFor({ state: "visible" });
  await touch.waitForFunction(() => document.querySelector(".object-circuit input").disabled === false);
  check("3D slider has a 44px touch area", (await slider.boundingBox()).height >= 44);
  await slider.tap({ position: { x: 60, y: 12 } });
  check("3D slider responds away from the thin visual track", await slider.inputValue() !== "25");
  const pattern = touch.getByRole("slider", { name: "Pattern alignment" });
  await pattern.scrollIntoViewIfNeeded();
  await pattern.tap({ position: { x: 20, y: 15 } });
  check("Psychedelic alignment responds to touch", await pattern.inputValue() !== "7");
  await touch.goto(origin + "/contact", { waitUntil: "networkidle" });
  check("Touch inputs avoid focus zoom", await touch.locator(".contact-form input,.contact-form textarea").evaluateAll(es => es.every(e => parseFloat(getComputedStyle(e).fontSize) >= 16)));
  await touch.screenshot({ path: `${dir}/contact-touch.png` });
  await touch.setViewportSize({ width: 667, height: 375 });
  await touch.getByRole("button", { name: "Open navigation" }).tap();
  await touch.getByRole("navigation", { name: "Mobile navigation", exact: true }).getByRole("link", { name: "Contact", exact: true }).tap();
  check("Landscape menu can scroll to its last route and close", !await touch.locator(".mobile-menu").isVisible());
  await touch.setViewportSize({ width: 320, height: 568 });
  await touch.goto(origin, { waitUntil: "networkidle" });
  check("Narrow hero reserves space for the live object", await touch.evaluate(() => document.querySelector(".hero-content").getBoundingClientRect().bottom < document.querySelector(".hero-satellite").getBoundingClientRect().top));
  await touch.locator(".cosmic-hero").screenshot({ path: `${dir}/hero-touch-320.png` });
  check("No runtime errors", report.errors.length === 0);
  console.log(JSON.stringify({ passed: report.checks.length, errors: report.errors }, null, 2));
} finally {
  fs.writeFileSync(`${dir}/verification.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
