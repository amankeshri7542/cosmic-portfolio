import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

// Runs only against a local database with a dev editor password (never production).
const PASSWORD = process.env.E2E_EDITOR_PASSWORD ?? "";
test.skip(!PASSWORD, "E2E_EDITOR_PASSWORD not set");
test.describe.configure({ mode: "serial" });
// One shared database: run the workflow once, on desktop.
test.skip(({ isMobile }) => isMobile, "publishing workflow runs once, on desktop");
test.use({ viewport: { width: 1440, height: 900 } });

const stamp = Date.now().toString(36);
const title = `Field test ${stamp}: what holds`;
const slug = `field-test-${stamp}-what-holds`;
const renamed = `${slug}-renamed`;
const image = path.join(process.cwd(), "public/work/shiv-cement-architecture.webp");

async function signIn(page: Page) {
  page.on("dialog", (d) => d.accept().catch(() => {}));
  await page.goto("/write");
  const pw = page.getByLabel("Editor password");
  if (await pw.isVisible().catch(() => false)) {
    await pw.fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
  }
  await expect(page.getByText("Writer’s desk")).toBeVisible();
}

async function saved(page: Page) {
  await expect(page.locator("[data-kind]").first()).toHaveAttribute("data-kind", "saved", { timeout: 15_000 });
}

async function openArticle(page: Page, name: string | RegExp) {
  await page.locator("#desk-list").getByRole("button", { name }).first().click();
  await expect(page.locator("#f-title")).toBeVisible();
}

test("wrong password is refused with a clear message", async ({ page }) => {
  await page.goto("/write");
  await page.getByLabel("Editor password").fill("definitely-not-it");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("#pw-err")).toHaveText("That password isn't right.");
});

test("write, add an image, autosave and survive a reload", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "New article" }).first().click();
  await page.locator("#f-title").fill(title);
  const slugInput = page.locator("#details").locator("input").first();
  await expect(slugInput).toHaveValue(slug);
  await page.locator("#details textarea").fill("A field test of the writer’s desk: autosave, images, previews and publishing, end to end.");

  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.type("## Why this exists\n\nA sale either completes everywhere or nowhere.\n\n```ts\nawait sql.begin(async (tx) => { /* … */ });\n```\n\n");

  await page.locator("label", { hasText: /^Image$/ }).locator("input[type=file]").setInputFiles(image);
  await page.getByLabel("Alt text (required)").fill("Architecture diagram of the Shiv Cement platform");
  await page.getByLabel(/Caption/).fill("The platform at a glance");
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(editor).toContainText("![Architecture diagram of the Shiv Cement platform](", { timeout: 20_000 });
  await saved(page);

  // The preview uses the public renderer: highlighted code and a captioned figure.
  await expect(page.locator("[aria-label=Preview] .code-block")).toBeVisible();
  await expect(page.locator("[aria-label=Preview] figcaption")).toHaveText("The platform at a glance");

  await page.reload();
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await expect(page.locator(".cm-content")).toContainText("A sale either completes everywhere or nowhere.");
});

test("text typed while the server is unreachable is kept on the device and offered back", async ({ page }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await page.route("**/api/editor/posts/*", (route) => (route.request().method() === "PATCH" ? route.abort("internetdisconnected") : route.continue()));
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("Written while offline.");
  await expect(page.locator("[data-kind]").first()).toHaveAttribute("data-kind", "offline", { timeout: 15_000 });
  await page.unrouteAll({ behavior: "ignoreErrors" });
  await page.goto("/write");
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await expect(page.getByText(/This device has newer text/)).toBeVisible();
  await page.getByRole("button", { name: "Restore it" }).click();
  await expect(page.locator(".cm-content")).toContainText("Written while offline.");
  await saved(page);
});

test("a save from another device produces a choice, not a silent overwrite", async ({ page, browser }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  const other = await browser.newContext();
  const page2 = await other.newPage();
  await signIn(page2);
  await openArticle(page2, new RegExp(`Field test ${stamp}`));
  await page2.locator(".cm-content").click();
  await page2.keyboard.press("ControlOrMeta+End");
  await page2.keyboard.type(" Edited on the second device.");
  await saved(page2);
  await other.close();

  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type(" Edited on the first.");
  await expect(page.getByRole("heading", { name: "This article changed somewhere else." })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Keep mine" }).click();
  await saved(page);
  await expect(page.locator(".cm-content")).toContainText("Edited on the first.");
});

test("a private preview link shows the draft without publishing it", async ({ page, browser }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await page.getByRole("button", { name: "Preview link" }).click();
  const link = page.getByRole("link", { name: "Open preview link ↗" });
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  const anon = await browser.newContext();
  const p = await anon.newPage();
  const res = await p.goto(href!);
  expect(res?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(p.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(p.getByText(/Private preview of an unpublished draft/)).toBeVisible();
  // Not public: the article address shows "not found" and is never indexable.
  await p.goto(`/blogs/${slug}`);
  await expect(p.getByRole("heading", { level: 1 })).toHaveText(/isn’t built yet/);
  await expect(p.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  await anon.close();
});

test("publish, then it's on the blog, sitemap and feed", async ({ page, request }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("✕")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: `Published at /blogs/${slug}` })).toBeVisible();

  await expect.poll(async () => (await request.get(`/blogs/${slug}`)).status(), { timeout: 15_000 }).toBe(200);
  await expect.poll(async () => (await request.get("/blogs")).text()).toContain(title);
  await expect.poll(async () => (await request.get("/sitemap.xml")).text()).toContain(`/blogs/${slug}`);
  await expect.poll(async () => (await request.get("/blogs/rss.xml")).text()).toContain(`/blogs/${slug}`);
  await expect.poll(async () => (await request.get("/llms.txt")).text()).toContain(`/blogs/${slug}`);
});

test("edits stay private until 'Publish changes'; renaming leaves a redirect", async ({ page, request }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("\n\nA second edition paragraph.");
  await saved(page);
  await expect(page.getByText("Published · your edits aren’t live yet")).toBeVisible();
  expect(await (await request.get(`/blogs/${slug}`)).text()).not.toContain("A second edition paragraph.");

  const toggle = page.getByRole("button", { name: /^Details:/ });
  if (await toggle.isVisible()) await toggle.click();
  const slugInput = page.locator("#details").locator("input").first();
  await slugInput.fill(renamed);
  await expect(page.getByText(`When you publish, /blogs/${slug} will redirect here permanently.`)).toBeVisible();
  await saved(page);
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: `Published at /blogs/${renamed}` })).toBeVisible();

  await expect.poll(async () => (await request.get(`/blogs/${renamed}`)).text(), { timeout: 15_000 }).toContain("A second edition paragraph.");
  await expect
    .poll(async () => {
      const r = await request.get(`/blogs/${slug}`, { maxRedirects: 0 });
      return `${r.status()} ${r.headers()["location"] ?? ""}`;
    }, { timeout: 20_000 })
    .toBe(`308 /blogs/${renamed}`);
});

test("unpublish takes it offline but keeps the draft; once-published articles can't be deleted", async ({ page, request }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await page.getByRole("button", { name: "Unpublish" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Unpublish" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Unpublished." })).toBeVisible();
  // First render after unpublishing may stream (200 + noindex); the cached response is a real 404.
  await expect.poll(async () => (await request.get(`/blogs/${renamed}`)).status(), { timeout: 20_000 }).toBe(404);
  await expect.poll(async () => (await request.get("/sitemap.xml")).text()).not.toContain(renamed);
  await expect(page.locator(".cm-content")).toContainText("A second edition paragraph.");
  await expect(page.getByRole("button", { name: "Delete draft" })).toHaveCount(0);
});

test("history keeps revisions you can restore", async ({ page }) => {
  await signIn(page);
  await openArticle(page, new RegExp(`Field test ${stamp}`));
  await page.getByRole("button", { name: "History" }).click();
  const drawer = page.getByRole("complementary", { name: "History" });
  await expect(drawer.getByText(/publish · v/).first()).toBeVisible();
  await expect(drawer.getByText(/unpublish · v/).first()).toBeVisible();
});

test("a never-published draft can be deleted", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "New article" }).first().click();
  await page.locator("#f-title").fill(`Throwaway ${stamp}`);
  await saved(page);
  await page.getByRole("button", { name: "Delete draft" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete draft" }).click();
  await expect(page.locator("#desk-list")).not.toContainText(`Throwaway ${stamp}`);
});
