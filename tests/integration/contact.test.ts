import { beforeEach, describe, expect, it, vi } from "vitest";
import { sql } from "@/lib/db";
import { GET, POST } from "@/app/api/contact/route";
import { issueContactToken } from "@/lib/contact";
import { request, resetDb } from "../helpers";

vi.mock("next/server", async (importOriginal) => ({ ...(await importOriginal<typeof import("next/server")>()), connection: async () => {} }));

const old = () => issueContactToken(Date.now() - 10_000);
const good = (over: Record<string, unknown> = {}) => ({ name: "Ada", email: "ada@example.com", message: "Hello, I would like to talk about a project.", company: "", t: old(), ...over });
const send = (body: unknown, ip = "203.0.113.5") => POST(request("/api/contact", { method: "POST", body, headers: { "x-forwarded-for": ip } }));
const rows = () => sql()<{ status: string; name: string }[]>`SELECT status, name FROM portfolio_contact_messages ORDER BY id`;

beforeEach(async () => {
  await resetDb();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("contact form", () => {
  it("issues a token", async () => {
    const body = await (await GET()).json();
    expect(body.t).toMatch(/^[0-9a-z]+\.[a-f0-9]{32}$/);
  });

  it("stores the message, sends it, and marks it sent", async () => {
    const res = await send(good());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(await rows()).toEqual([{ status: "sent", name: "Ada" }]);
  });

  it("gives bots a fake 200 and stores nothing", async () => {
    for (const body of [good({ company: "Acme" }), good({ t: issueContactToken() }), good({ t: "garbage" }), good({ t: undefined })]) {
      const res = await send(body);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    }
    expect(await rows()).toEqual([]);
  });

  it("asks humans with an expired form to reload", async () => {
    const res = await send(good({ t: issueContactToken(Date.now() - 3 * 3600_000) }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "token_expired" });
  });

  it("validates fields with 422", async () => {
    const res = await send(good({ email: "nope", message: "short" }));
    expect(res.status).toBe(422);
    expect((await res.json()).fields).toHaveProperty("email");
  });

  it("files abusive messages as spam but still answers 200", async () => {
    const res = await send(good({ message: "you stupid idiot, what a bullshit site" }));
    expect(res.status).toBe(200);
    expect(await rows()).toEqual([{ status: "spam", name: "Ada" }]);
  });

  it("rate limits to 3 per hour per IP", async () => {
    for (let i = 0; i < 3; i++) expect((await send(good())).status).toBe(200);
    const res = await send(good());
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("3600");
    expect((await send(good(), "198.51.100.77")).status).toBe(200);
    expect((await sql()`SELECT ip_hash FROM portfolio_contact_messages`)[0].ip_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
