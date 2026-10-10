import { expect, test } from "@playwright/test";

test("security headers are sent", async ({ request }) => {
  const h = (await request.get("/")).headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["cross-origin-opener-policy"]).toBe("same-origin");
  expect(h["strict-transport-security"]).toContain("includeSubDomains");
});

test("the CSP doesn't break any page", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text()); });
  for (const path of ["/", "/work", "/about", "/blogs/aws-db", "/contact", "/write"]) {
    await page.goto(path, { waitUntil: "networkidle" });
  }
  expect(violations).toEqual([]);
});

test("short links: known destinations redirect, unknown codes 404", async ({ request }) => {
  const known = await request.get("/z4v3d6", { maxRedirects: 0 });
  expect(known.status()).toBe(302);
  expect(new URL(known.headers().location).hostname).toMatch(/linkedin\.com$/);
  expect((await request.get("/zzzzz9", { maxRedirects: 0 })).status()).toBe(404);
});

test("editor APIs refuse cross-origin and unauthenticated calls", async ({ request, baseURL }) => {
  const forged = await request.post("/api/editor/session", { data: { password: "x" }, headers: { Origin: "https://evil.example" } });
  expect(forged.status()).toBe(403);
  expect((await request.get("/api/editor/posts")).status()).toBe(401);
  const unauth = await request.post("/api/editor/posts", { data: {}, headers: { Origin: new URL(baseURL!).origin } });
  expect([401, 403]).toContain(unauth.status());
});
