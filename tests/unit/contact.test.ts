import { describe, expect, it } from "vitest";
import { checkContactToken, issueContactToken, MIN_FILL_MS, MAX_FILL_MS, spamScore, validateContact } from "@/lib/contact";

describe("contact token", () => {
  const t0 = 1_800_000_000_000;
  const token = issueContactToken(t0, "secret");

  it("is invalid when too fast, ok in the window, expired after 2h", () => {
    expect(checkContactToken(token, t0 + MIN_FILL_MS - 1, "secret")).toBe("too_fast");
    expect(checkContactToken(token, t0 + MIN_FILL_MS, "secret")).toBe("ok");
    expect(checkContactToken(token, t0 + MAX_FILL_MS, "secret")).toBe("ok");
    expect(checkContactToken(token, t0 + MAX_FILL_MS + 1, "secret")).toBe("expired");
  });

  it("rejects tampered, foreign and garbage tokens", () => {
    const [issued, mac] = token.split(".");
    expect(checkContactToken(`${(parseInt(issued, 36) - 10_000).toString(36)}.${mac}`, t0 + 5000, "secret")).toBe("invalid");
    expect(checkContactToken(token, t0 + 5000, "other-secret")).toBe("invalid");
    for (const bad of ["", "abc", "a.b.c", ".", "zzzz.", `${issued}.`]) expect(checkContactToken(bad, t0 + 5000, "secret")).toBe("invalid");
  });
});

describe("validateContact", () => {
  const ok = { name: "Ada", email: "ada@example.com", message: "Hello there, this is long enough." };

  it("accepts and normalises a good message", () => {
    expect(validateContact({ ...ok, name: "  Ada\r\nLovelace " })).toEqual({ ok: true, value: { ...ok, name: "Ada Lovelace" } });
  });
  it("reports each bad field", () => {
    const r = validateContact({ name: "", email: "nope", message: "short" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fields).sort()).toEqual(["email", "message", "name"]);
  });
  it("enforces length limits", () => {
    expect(validateContact({ ...ok, name: "x".repeat(81) }).ok).toBe(false);
    expect(validateContact({ ...ok, email: `${"a".repeat(250)}@b.co` }).ok).toBe(false);
    expect(validateContact({ ...ok, message: "x".repeat(4001) }).ok).toBe(false);
    expect(validateContact({ ...ok, message: "x".repeat(4000) }).ok).toBe(true);
    expect(validateContact({ ...ok, name: 5 as unknown as string }).ok).toBe(false);
  });
});

describe("spamScore", () => {
  it("scores abusive words (including leetspeak) and link stuffing", () => {
    expect(spamScore("Lovely portfolio, great work on the classic design.")).toBe(0);
    expect(spamScore("you are an idiot")).toBe(1);
    expect(spamScore("f*ck this sh1t")).toBe(2);
    expect(spamScore("see http://a.example http://b.example http://c.example http://d.example")).toBe(2);
  });
});
