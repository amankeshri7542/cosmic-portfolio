import { randomBytes, scryptSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { checkOrigin, hashPassword, parsePasswordHash, verifyPassword } from "@/lib/editor/auth";

const legacy = (pw: string, decodeSalt = false) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, decodeSalt ? Buffer.from(salt, "hex") : salt, 64).toString("hex")}`;
};

describe("verifyPassword", () => {
  it("accepts a legacy salt:key hash (hex salt used as the salt string)", async () => {
    const hash = legacy("hunter2-hunter2");
    expect(await verifyPassword("hunter2-hunter2", hash)).toBe(true);
    expect(await verifyPassword("hunter3-hunter2", hash)).toBe(false);
  });

  it("accepts a legacy hash made from the decoded salt bytes", async () => {
    expect(await verifyPassword("pw-pw-pw-pw", legacy("pw-pw-pw-pw", true))).toBe(true);
  });

  it("round-trips the scrypt$N$r$p$salt$hash format", async () => {
    const hash = await hashPassword("a long enough passphrase", { n: 1024 });
    expect(hash).toMatch(/^scrypt\$1024\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    expect(await verifyPassword("a long enough passphrase", hash)).toBe(true);
    expect(await verifyPassword("a long enough passphrasE", hash)).toBe(false);
  });

  it("rejects missing, malformed and oversized input", async () => {
    expect(await verifyPassword("x", undefined)).toBe(false);
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("", legacy("x"))).toBe(false);
    expect(await verifyPassword("x".repeat(300), legacy("x".repeat(300)))).toBe(false);
  });

  it("refuses unreasonable scrypt parameters", () => {
    expect(parsePasswordHash("scrypt$3$8$1$aa$bb")).toBeNull();
    expect(parsePasswordHash(`scrypt$${2 ** 24}$8$1$aa$bb`)).toBeNull();
    expect(parsePasswordHash("scrypt$16384$8$1$aa$bb")).not.toBeNull();
  });
});

describe("checkOrigin", () => {
  const req = (headers: Record<string, string>, url = "http://localhost:3010/api/editor/posts") => new Request(url, { method: "POST", headers });

  it("allows a matching origin", () => {
    expect(checkOrigin(req({ origin: "http://localhost:3010" }))).toBeNull();
  });
  it("rejects a missing or foreign origin", async () => {
    expect((await checkOrigin(req({})))?.status).toBe(403);
    expect(checkOrigin(req({ origin: "https://evil.example" }))?.status).toBe(403);
    expect(checkOrigin(req({ origin: "http://localhost:3011" }))?.status).toBe(403);
  });
  it("requires Sec-Fetch-Site to be same-origin when present", () => {
    expect(checkOrigin(req({ origin: "http://localhost:3010", "sec-fetch-site": "same-origin" }))).toBeNull();
    expect(checkOrigin(req({ origin: "http://localhost:3010", "sec-fetch-site": "same-site" }))?.status).toBe(403);
    expect(checkOrigin(req({ origin: "http://localhost:3010", "sec-fetch-site": "cross-site" }))?.status).toBe(403);
  });
  it("uses the forwarded host and protocol behind a proxy", () => {
    const headers = { origin: "https://www.example.com", "x-forwarded-host": "www.example.com", "x-forwarded-proto": "https" };
    expect(checkOrigin(req(headers, "http://internal:3000/api/editor/posts"))).toBeNull();
    expect(checkOrigin(req({ ...headers, origin: "http://www.example.com" }, "http://internal:3000/x"))?.status).toBe(403);
  });
});
