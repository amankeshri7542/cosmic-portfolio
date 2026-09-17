import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";
const dir = "docs/qa/controls-blogs";
fs.mkdirSync(dir, { recursive: true });
const report = { checks: [], errors: [] };
const check = (name, condition) => { assert.ok(condition, name); report.checks.push(name); };
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const mode of ["unsupported", "reduced", "missing", "still", "context-loss"]) {
    const page = await browser.newPage({ viewport: { width: 1188, height: 747 }, reducedMotion: mode === "reduced" ? "reduce" : "no-preference" });
    if (mode === "unsupported") await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) { return String(type).includes("webgl") ? null : original.call(this, type, ...args); };
    });
    if (mode === "missing") await page.route("**/*.glb", route => route.abort());
    await page.goto(origin, { waitUntil: "networkidle" });
    for (let i = 0; i < 4; i++) {
      const study = page.locator(".object-study").nth(i);
      const range = study.getByRole("slider");
      await range.scrollIntoViewIfNeeded();
      if (["still", "context-loss"].includes(mode)) {
        await study.locator("canvas[data-object-ready]").waitFor();
        if (mode === "still") await study.getByRole("button", { name: "Still view" }).click();
        else await study.locator("canvas").evaluate(e => e.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
      }
      check(`${mode}: object ${i + 1} control is enabled`, await range.isEnabled());
      await range.fill("0");
      await page.waitForFunction(i => {
        const s = document.querySelectorAll(".object-study")[i];
        const svg = s.querySelector("svg.object-fallback");
        return s.dataset.objectMode === "still" && svg && getComputedStyle(svg).visibility === "visible";
      }, i);
      const before = await study.locator(".object-stage").screenshot();
      await range.fill("100");
      const after = await study.locator(".object-stage").screenshot();
      check(`${mode}: object ${i + 1} visibly responds`, !before.equals(after));
      await range.focus(); await page.keyboard.press("ArrowLeft");
      check(`${mode}: object ${i + 1} works by keyboard`, await range.inputValue() === "99");
      if (mode === "unsupported") await study.screenshot({ path: `${dir}/fallback-${i}.png` });
    }
    if (mode === "unsupported") {
      await page.goto(origin + "/work", { waitUntil: "networkidle" });
      const range = page.getByRole("slider", { name: "Satellite view angle" });
      await range.scrollIntoViewIfNeeded();
      check("Work-page satellite fallback control works", await range.isEnabled());
      await range.fill("10");
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator(".hero-satellite canvas[data-object-ready]").waitFor();
  await page.locator("#archive").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000); // R3F disposes an offscreen root asynchronously.
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.locator(".hero-satellite canvas[data-object-ready]").waitFor();
  check("Scrolling out and back preserves live 3D", await page.locator(".hero-satellite figure").getAttribute("data-object-mode") === "3d");

  page.on("pageerror", e => report.errors.push(e.message));
  await page.goto(origin + "/blogs", { waitUntil: "networkidle" });
  check("Blog index contains the original and three samples", await page.locator(".blog-feature").count() === 4);
  check("Sample articles are clearly labeled", await page.getByText("Sample essay", { exact: true }).count() === 3);
  check("Every sample has its own illustration", await page.getByRole("img").count() >= 3);
  await page.screenshot({ path: `${dir}/blogs-desktop.png`, fullPage: true });
  for (const slug of ["one-sale-three-records", "when-a-recipient-goes-offline", "patterns-between-patterns"]) {
    await page.goto(origin + "/blogs/" + slug, { waitUntil: "networkidle" });
    check(`${slug}: article and sample label render`, (await page.locator(".article-body").innerText()).length > 2500 && (await page.locator(".page-heading").textContent()).includes("Sample essay"));
    const figure = page.locator(".blog-illustration");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: "Pause illustration" }).click();
    check(`${slug}: illustration pauses`, await figure.getAttribute("data-running") === "false");
    await figure.getByRole("button", { name: "Play illustration" }).click();
    check(`${slug}: illustration resumes`, await figure.getAttribute("data-running") === "true");
    await page.screenshot({ path: `${dir}/${slug}-desktop.png` });
    for (const width of [320, 390, 761]) {
      await page.setViewportSize({ width, height: 844 });
      check(`${slug}: ${width}px content fits`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    if (slug === "when-a-recipient-goes-offline") {
      const demo = page.locator(".article-experiment");
      await demo.getByRole("checkbox").check();
      await demo.getByRole("button", { name: "Send a sample message" }).click();
      check("Article delivery experiment shows independent delivery", await demo.locator(".delivered").count() === 2 && (await demo.getByRole("status").innerText()).includes("B’s failure did not cancel"));
    }
    if (slug === "patterns-between-patterns") {
      const range = page.getByRole("slider", { name: "Pattern alignment" });
      await range.fill("-10");
      check("Article optical experiment can be manipulated", await range.inputValue() === "-10");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({ path: `${dir}/${slug}-mobile.png` });
    await page.emulateMedia({ reducedMotion: "reduce" });
    check(`${slug}: reduced motion stops cover animation`, await figure.locator(".record-leaf,.delivery-particle,.pattern-overlay").first().evaluate(e => getComputedStyle(e).animationName) === "none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  check("No normal runtime errors", report.errors.length === 0);
  console.log(JSON.stringify({ passed: report.checks.length, errors: report.errors }));
} finally {
  fs.writeFileSync(`${dir}/verification.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
