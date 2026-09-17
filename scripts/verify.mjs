// Run against a production server. PLAYWRIGHT_MODULE can point to a bundled Playwright index.mjs.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const origin = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";
const output = path.join(process.cwd(), "docs/qa");
fs.mkdirSync(output, { recursive: true });
const expected = [
  "Shiv Cement Store",
  "AI-Powered Alexa Assistant",
  "Mythos AI Studio",
  "Foxpop.in",
  "MedScan AI",
  "URL Shortener",
  "Prompt Enhancer",
  "Serverless Notification System",
];
const report = { origin, checks: [], screenshots: [], performance: {} };
const check = (name, condition) => {
  assert.ok(condition, name);
  report.checks.push(name);
};
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const shot = async (name) => {
      const file = name + ".png";
      await page.screenshot({ path: path.join(output, file) });
      report.screenshots.push(file);
    };
    const settle = async () => {
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            let n = 0;
            function tick() {
              if (++n === 55) resolve();
              else requestAnimationFrame(tick);
            }
            tick();
          }),
      );
    };
    const jump = async (id) => {
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollY - 110,
          behavior: "instant",
        });
      }, id);
      await settle();
    };
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-world-ready="true"]');
    await settle();
    check("Home has exactly one h1", (await page.locator("h1").count()) === 1);
    check("One WebGL canvas", (await page.locator("canvas").count()) === 1);
    check(
      "All eight archive records present",
      (await page.locator(".archive-record").count()) === 8,
    );
    const titles = await page.locator(".archive-record h3").allTextContents();
    check(
      "Every original project preserved",
      expected.every((title) => titles.includes(title)),
    );
    check(
      "Desktop has no horizontal overflow",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await shot("final-home-desktop");
    await page.getByRole("button", { name: "Inspect the instrument" }).click();
    await page.getByRole("slider", { name: "View angle" }).fill("35");
    await settle();
    await shot("final-inspect-desktop");
    await page.keyboard.press("Escape");
    check(
      "Escape exits inspection",
      (await page
        .getByRole("button", { name: "Inspect the instrument" })
        .getAttribute("aria-pressed")) === "false",
    );
    await jump("hardware-erp");
    await page.locator("#hardware-erp summary").click();
    check(
      "Engineering detail opens",
      (await page.locator("#hardware-erp details").getAttribute("open")) !==
        null,
    );
    check(
      "Transaction evidence present",
      await page
        .locator("#hardware-erp")
        .innerText()
        .then((text) => text.includes("FOR UPDATE")),
    );
    await shot("final-study-desktop");
    await page.locator("#hardware-erp summary").click();
    await jump("garden");
    await shot("final-garden-desktop");
    await jump("archive");
    await page
      .getByRole("searchbox", { name: "Find a project" })
      .fill("DynamoDB");
    check(
      "Archive search narrows relevant records",
      (await page.locator(".archive-record").count()) === 1,
    );
    await page
      .getByRole("searchbox", { name: "Find a project" })
      .fill("does-not-exist");
    check(
      "Empty search state is actionable",
      await page
        .getByRole("button", { name: "Show every project" })
        .isVisible(),
    );
    await page.getByRole("button", { name: "Show every project" }).click();
    await page.locator("#shiv-cement summary").click();
    await page.locator("#shiv-cement img").evaluate(image => image.decode());
    check("Archive image loads", await page.locator("#shiv-cement img").evaluate(image => image.naturalWidth > 0));
    await shot("final-archive-desktop");
    check(
      "Architecture link retained",
      (await page
        .locator("#shiv-cement")
        .getByRole("link", { name: "View architecture" })
        .getAttribute("href")) === "/diagram-export-18-04-2026-22_29_24.png",
    );
    await jump("ground");
    await shot("final-ground-desktop");
    check(
      "Ram Naam remains accessible DOM text",
      (await page.locator('.ram-inscription [lang="hi"]').textContent()) ===
        "राम",
    );
    await page.keyboard.press("Control+k");
    check(
      "Keyboard page finder opens",
      await page.locator(".command-dialog").evaluate((el) => el.open),
    );
    await page.getByRole("textbox", { name: "Find a page" }).fill("Notes");
    await page.keyboard.press("Escape");
    check(
      "Page finder closes with Escape",
      !(await page.locator(".command-dialog").evaluate((el) => el.open)),
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await settle();
    report.performance = await page.evaluate(async () => {
      const intervals = [];
      let last = performance.now();
      for (let i = 0; i < 90; i++) {
        await new Promise(requestAnimationFrame);
        const now = performance.now();
        intervals.push(now - last);
        last = now;
        scrollTo({ top: i * 3, behavior: "instant" });
      }
      intervals.shift();
      intervals.sort((a, b) => a - b);
      return {
        meanFrameMs: intervals.reduce((a, b) => a + b, 0) / intervals.length,
        p95FrameMs: intervals[Math.floor(intervals.length * 0.95)],
        render: { ...document.querySelector("canvas").dataset },
        viewport: [innerWidth, innerHeight],
        renderer:
          "Chrome headless on this host; not a physical-device benchmark",
      };
    });
    await page.getByRole("button", { name: "Still view", exact: true }).click();
    check(
      "Still control removes WebGL canvas",
      (await page.locator("canvas").count()) === 0,
    );
    await shot("final-still-desktop");
    await page.getByRole("button", { name: "Enable 3D" }).click();
    await page.waitForSelector('[data-world-ready="true"] canvas');
    // Navigate the content routes and verify a deliberate reading layout.
    for (const route of [
      "/work",
      "/about",
      "/blogs",
      "/blogs/aws-db",
      "/contact",
    ]) {
      const response = await page.goto(origin + route, {
        waitUntil: "networkidle",
      });
      check(route + " returns 200", response.status() === 200);
      check(route + " has one page heading", await page.locator("h1").count()===1);
      check(
        route + " has a main landmark",
        (await page.locator("main#main-content").count()) === 1,
      );
      check(
        route + " has no horizontal overflow",
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      check(
        route + " does not load WebGL",
        (await page.locator("canvas").count()) === 0,
      );
      await shot("final" + route.replaceAll("/", "-"));
    }
    await page.getByRole("button", { name: "Send message" }).click();
    check(
      "Empty form exposes three validation errors",
      (await page.locator(".field-error").count()) === 3,
    );
    // Stub transport: no real message is sent during verification.
    await page.route("**/api/contact", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Test delivery unavailable." }),
      }),
    );
    await page.getByLabel("Your name").fill("Portfolio QA");
    await page.getByLabel("Email address").fill("qa@example.com");
    await page
      .getByLabel("What are you thinking?")
      .fill("Testing the portfolio form without sending a message.");
    await page.getByRole("button", { name: "Send message" }).click();
    await page.getByRole("alert").waitFor();
    check(
      "Delivery failure preserves the message",
      (await page.getByLabel("What are you thinking?").inputValue()).includes(
        "Testing",
      ),
    );
    await page.unroute("**/api/contact");
    await page.route("**/api/contact", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Test success" }),
      }),
    );
    await page.getByRole("button", { name: "Send message" }).click();
    await page.waitForURL("**/thank-you");
    check(
      "Successful form reaches thank-you page",
      await page
        .locator("h1")
        .textContent()
        .then((text) => text.includes("Thank you")),
    );
    const pdf = await context.request.get(origin + "/amankeshridotcom.pdf");
    check(
      "Resume endpoint matches newest source PDF",
      Buffer.compare(
        await pdf.body(),
        fs.readFileSync("amankeshridotcom.pdf"),
      ) === 0,
    );
    const unavailable = await context.request.post(
      origin + "/api/generate-image",
      { data: { name: "Portfolio QA" } },
    );
    check(
      "Legacy generation fails gracefully without configuration",
      unavailable.status() === 503,
    );
    await page.goto(origin + "/work#mythos", { waitUntil: "networkidle" });
    check(
      "Direct project URL opens its disclosure",
      (await page.locator("#mythos").getAttribute("open")) !== null,
    );
    // Test physical-size layouts, not a scaled desktop screenshot.
    for (const width of [390, 360, 768, 1920]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.waitForSelector('[data-world-ready="true"]');
      await settle();
      check(
        width + "px has no horizontal overflow",
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await shot("final-home-" + width);
      if (width === 390) {
        await page.getByRole("button", { name: "Open navigation" }).click();
        check(
          "Mobile navigation is a modal dialog",
          await page.locator(".mobile-menu").evaluate((el) => el.open),
        );
        await shot("final-mobile-menu");
        await page.keyboard.press("Escape");
        check(
          "Mobile menu returns focus",
          await page
            .getByRole("button", { name: "Open navigation" })
            .evaluate((el) => el === document.activeElement),
        );
        await jump("hardware-erp");
        await shot("final-study-mobile");
        await jump("archive");
        await page.locator("#alexa summary").click();
        await page.locator("#alexa img").evaluate(image => image.decode());
        await shot("final-archive-mobile");
        await page.goto(origin + "/contact", { waitUntil: "networkidle" });
        await shot("final-contact-mobile");
      }
    }
    check("No runtime exceptions in normal journeys", errors.length === 0);
    report.normalErrors = errors;
    await context.close();
    const reduced = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const reducedPage = await reduced.newPage();
    const requested = [];
    reducedPage.on("request", (request) => requested.push(request.url()));
    await reducedPage.goto(origin, { waitUntil: "networkidle" });
    check(
      "Reduced motion renders the still",
      (await reducedPage.locator('[data-world-mode="still"]').count()) === 1,
    );
    check(
      "Reduced motion skips WebGL and model download",
      (await reducedPage.locator("canvas").count()) === 0 &&
        !requested.some((url) => url.endsWith(".glb")),
    );
    await reducedPage.screenshot({
      path: path.join(output, "final-reduced-motion.png"),
    });
    await reduced.close();
    const fallback = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (String(type).includes("webgl")) return null;
        return original.call(this, type, ...args);
      };
    });
    const fallbackPage = await fallback.newPage();
    await fallbackPage.goto(origin, { waitUntil: "networkidle" });
    check(
      "WebGL unavailable retains page content",
      await fallbackPage
        .locator("h1")
        .textContent()
        .then((text) => text.includes("Engineering")),
    );
    check(
      "WebGL unavailable retains fallback image",
      await fallbackPage
        .locator(".sanctuary-still img")
        .evaluate((el) => el.complete && el.naturalWidth > 0),
    );
    await fallbackPage.screenshot({
      path: path.join(output, "final-webgl-fallback.png"),
    });
    await fallback.close();
    const missing = await browser.newContext();
    await missing.route("**/quiet-engine.glb", (route) => route.abort());
    const missingPage = await missing.newPage();
    await missingPage.goto(origin, { waitUntil: "networkidle" });
    await missingPage.waitForSelector('[data-world-mode="still"]');
    check(
      "Missing model returns to still view",
      await missingPage.locator("h1").isVisible(),
    );
    await missing.close();
    const loss = await browser.newContext();
    const lossPage = await loss.newPage();
    await lossPage.goto(origin, { waitUntil: "networkidle" });
    await lossPage.waitForSelector('[data-world-ready="true"] canvas');
    await lossPage.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const gl = canvas.getContext("webgl2");
      gl.getExtension("WEBGL_lose_context").loseContext();
    });
    await lossPage.waitForSelector('[data-world-mode="still"]');
    check(
      "Context loss returns to still view",
      (await lossPage.locator("canvas").count()) === 0,
    );
    await loss.close();
    const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const nojsPage = await nojs.newPage();
    await nojsPage.goto(origin);
    check(
      "No-JavaScript retains all projects",
      (await nojsPage.locator(".archive-record").count()) === 8,
    );
    await nojs.close();
    fs.writeFileSync(
      path.join(output, "verification.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          passed: report.checks.length,
          performance: report.performance,
          report: "docs/qa/verification.json",
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  fs.writeFileSync(
    path.join(output, "verification-failure.json"),
    JSON.stringify({ ...report, error: error.stack }, null, 2),
  );
  console.error(error);
  process.exit(1);
});
