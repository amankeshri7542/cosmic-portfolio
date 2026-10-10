import { describe, expect, it } from "vitest";
import { isShortCode, leavingPage, trusted } from "@/lib/shortlinks";
import { renderMarkdown } from "@/lib/markdown";

describe("short links", () => {
  it("recognises six-character codes only", () => {
    expect(isShortCode("/z4v3d6")).toBe(true);
    expect(isShortCode("/about")).toBe(false);
    expect(isShortCode("/abc12/")).toBe(false);
    expect(isShortCode("/abc-12")).toBe(false);
  });
  it("trusts only https destinations on known hosts", () => {
    expect(trusted(new URL("https://www.linkedin.com/in/aman-kumar-keshri"))).toBe(true);
    expect(trusted(new URL("http://www.linkedin.com/"))).toBe(false);
    expect(trusted(new URL("https://linkedin.com.evil.example/"))).toBe(false);
    expect(trusted(new URL("https://user:pass@github.com/"))).toBe(false);
    expect(trusted(new URL("https://evil.vercel.app/"))).toBe(false);
  });
  it("escapes the destination on the warning page", () => {
    const html = leavingPage(new URL('https://evil.example/"><script>alert(1)</script>'));
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("noindex");
  });
});

describe("markdown links", () => {
  it("drops javascript:, data: and other unsafe schemes", async () => {
    const { html } = await renderMarkdown("[a](javascript:alert(1)) [b](data:text/html,x) ![c](javascript:x) [ok](https://example.com) [rel](/work)");
    expect(html).not.toMatch(/javascript:|data:text/);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('href="/work"');
  });
});
