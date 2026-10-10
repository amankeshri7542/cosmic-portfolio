import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", h1: /Let’s build a product/ },
  { path: "/work", h1: /Systems that hold/ },
  { path: "/about", h1: /Hello, I’m Aman/ },
  { path: "/blogs", h1: /Notes from the workbench/ },
  { path: "/blogs/aws-db", h1: /Beyond the Connection String/ },
  { path: "/contact", h1: /Write to me/ },
  { path: "/thank-you", h1: /Message sent/ },
];

test.describe("routes keep working", () => {
  for (const p of pages) {
    test(`${p.path} renders with one h1 and no horizontal scroll`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(p.h1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }

  test("files, feeds and redirects", async ({ request }) => {
    for (const pdf of ["/amankeshridotcom.pdf", "/resume-previous.pdf", "/cloud.pdf"]) {
      const r = await request.get(pdf);
      expect(r.status(), pdf).toBe(200);
      expect(r.headers()["content-type"]).toContain("pdf");
    }
    const moved = await request.get("/shivtraders.png", { maxRedirects: 0 });
    expect(moved.status()).toBe(308);
    expect(moved.headers().location).toBe("/work/shiv-cement.webp");
    const rss = await request.get("/blogs/rss.xml");
    expect(rss.headers()["content-type"]).toContain("rss");
    expect(await rss.text()).toContain("/blogs/aws-db");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /write");
    expect(robots).toContain("Sitemap: https://www.amankeshri.com/sitemap.xml");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("https://www.amankeshri.com/blogs/aws-db");
    expect(sitemap).not.toContain("one-sale-three-records"); // illustrated studies stay out
    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).toContain("# Aman Kumar");
    expect((await request.get("/rss.xml", { maxRedirects: 0 })).status()).toBe(308);
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toContain("image/png");
  });

  test("unknown pages are a real 404", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/isn’t built yet/);
  });

  test("project anchors open their frame", async ({ page }) => {
    await page.goto("/work#medscan");
    await expect(page.locator("#medscan details")).toHaveAttribute("open", "");
    await expect(page.locator("#hardware-erp")).toBeAttached();
    await expect(page.locator("#procurement")).toBeAttached();
    await expect(page.locator("#vartalaap")).toBeAttached();
  });

  test("structured data is valid JSON on every page", async ({ page }) => {
    for (const p of ["/", "/about", "/blogs", "/blogs/aws-db"]) {
      await page.goto(p);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(blocks.length, p).toBeGreaterThan(0);
      for (const b of blocks) expect(() => JSON.parse(b)).not.toThrow();
    }
  });
});

test.describe("navigation and keyboard", () => {
  test("skip link and the page finder work from the keyboard @desktop-only", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: "Find a page" });
    await expect(dialog).toBeVisible();
    await page.keyboard.type("vartalaap");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work#vartalaap/);
  });

  test("mobile menu opens as a sheet", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: /Menu/ }).click();
    const dialog = page.getByRole("dialog", { name: "Find a page" });
    await dialog.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
  });
});

test.describe("instruments", () => {
  test("ERP: a failed sale rolls back, a race sells one bag", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work#hardware-erp");
    const plate = page.locator("#hardware-erp");
    await plate.getByRole("button", { name: "Sell 1 bag" }).click();
    await expect(plate.getByText("COMMIT; three records, one promise")).toBeVisible();
    await plate.getByLabel("Pull the plug").selectOption("stock");
    await plate.getByRole("button", { name: "Sell 1 bag" }).click();
    await expect(plate.getByText(/ROLLBACK; no invoice/)).toBeVisible();
    await plate.getByRole("button", { name: "Two counters, last bag" }).click();
    await expect(plate.getByText("ROLLBACK; exactly one bag sold")).toBeVisible();
    await plate.getByLabel("Lock the row (FOR UPDATE)").uncheck();
    await plate.getByRole("button", { name: "Two counters, last bag" }).click();
    await expect(plate.getByText(/stock is −1/)).toBeVisible();
  });

  test("P2P: the wrong role is refused", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work#procurement");
    const plate = page.locator("#procurement");
    await plate.getByRole("button", { name: "Release PO" }).click();
    await expect(plate.getByText(/403 Forbidden — only finance may release/)).toBeVisible();
    await plate.getByRole("button", { name: "Submit request" }).click();
    await expect(plate.getByText(/Submitted\. Next gate/)).toBeVisible();
  });

  test("Vartalaap: an offline recipient doesn't stop the others", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work#vartalaap");
    const plate = page.locator("#vartalaap");
    await plate.getByRole("button", { name: "Send to #design" }).click();
    await expect(plate.getByText(/410 GoneException/)).toBeVisible();
    await expect(plate.getByText(/2 of 3 delivered/)).toBeVisible();
  });
});

test.describe("the build story", () => {
  test("scrolling builds the product step by step, and back @desktop-only", async ({ page }) => {
    await page.goto("/");
    const label = page.locator("[data-stage-label]");
    await expect(label).toHaveText("step 0 / 6");
    await expect(page.locator("html")).toHaveClass(/story-live/);
    for (const [id, n] of [["interface", 1], ["data", 3], ["run", 6]] as const) {
      await page.evaluate((id) => window.scrollTo(0, document.getElementById(id)!.getBoundingClientRect().top + scrollY - innerHeight * 0.1), id);
      await expect(label).toHaveText(`step ${n} / 6`);
    }
    await expect(page.locator("[data-part='done']")).toHaveCSS("opacity", "1");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(label).toHaveText("step 0 / 6");
    await expect.poll(() => page.locator("[data-part='done']").evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
  });

  test("reduced motion shows the finished product", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-part='done']")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-part='api']")).toHaveCSS("opacity", "1");
  });

  test("every chapter is readable text in order", async ({ page }) => {
    await page.goto("/");
    const titles = await page.locator("article[data-chapter] h2").allTextContents();
    expect(titles).toEqual([
      "Start with what people touch.",
      "Then the contract between screen and data.",
      "Make the data agree with itself.",
      "Package it, test it, put it in the cloud.",
      "Then make it smarter — where it helps.",
      "And then I keep it running.",
    ]);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the story and the finished product are still there", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Let’s build a product/);
    await expect(page.locator("[data-part='done']")).toHaveCSS("opacity", "1");
    await expect(page.locator("#projects")).toBeVisible();
  });
});

test.describe("contact", () => {
  test("validates, then sends and lands on thank-you", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() === "GET") return route.fulfill({ json: { t: "test-token" } });
      return route.fulfill({ json: { ok: true } });
    });
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Add your name so I know who’s writing.")).toBeVisible();
    await page.getByLabel("Your name").fill("Test Person");
    await page.getByLabel("Your email").fill("test@example.com");
    await page.getByLabel("Message").fill("Hello Aman, this is an automated test message.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/\/thank-you$/);
  });

  test("a failed send keeps the text and offers email", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.request().method() === "GET" ? route.fulfill({ json: { t: "x" } }) : route.fulfill({ status: 500, json: { message: "Mail server unavailable." } }),
    );
    await page.goto("/contact");
    await page.getByLabel("Your name").fill("Test Person");
    await page.getByLabel("Your email").fill("test@example.com");
    await page.getByLabel("Message").fill("This should stay in the box after a failure.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Your text is still here" })).toBeVisible();
    await expect(page.getByLabel("Message")).toHaveValue("This should stay in the box after a failure.");
  });
});

test.describe("sharing and AI discoverability", () => {
  test("every page has a preview image, title and URL for social cards", async ({ request }) => {
    for (const path of ["/", "/about", "/work", "/blogs", "/contact", "/blogs/aws-db"]) {
      const html = await (await request.get(path)).text();
      expect(html, path).toMatch(/<meta property="og:image" content="https:\/\/www\.amankeshri\.com\/[^"]*opengraph-image/);
      expect(html, path).toContain('property="og:title"');
      expect(html, path).toContain('property="og:url"');
    }
  });

  test("answer engines get plain facts: llms files, FAQ and person data", async ({ request }) => {
    const full = await (await request.get("/llms-full.txt")).text();
    expect(full).toContain("Also known as: Aman Keshri");
    expect(full).toContain("Hardware Store ERP");
    expect(full).toContain("Beyond the Connection String"); // full article text included
    const about = await (await request.get("/about")).text();
    expect(about).toContain('"@type":"FAQPage"');
    expect(about).toContain('"alternateName":["Aman Keshri","Aman Kumar Keshri"]');
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("User-Agent: OAI-SearchBot");
    expect(robots).toContain("User-Agent: ClaudeBot");
  });
});
