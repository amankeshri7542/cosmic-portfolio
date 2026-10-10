import { describe, expect, it } from "vitest";
import { ApiError, readJson } from "@/lib/editor/http";

const post = (body: BodyInit, headers: Record<string, string> = { "content-type": "application/json" }) =>
  new Request("http://localhost/x", { method: "POST", headers, body });

describe("readJson", () => {
  it("parses a JSON object", async () => {
    expect(await readJson(post('{"a":1}'))).toEqual({ a: 1 });
  });
  it("415 for other content types", async () => {
    await expect(readJson(post("{}", { "content-type": "text/plain" }))).rejects.toMatchObject({ status: 415 });
  });
  it("413 when the stream exceeds the cap", async () => {
    await expect(readJson(post(JSON.stringify({ a: "x".repeat(2000) })), 1000)).rejects.toMatchObject({ status: 413 });
  });
  it("400 for malformed JSON, arrays and scalars", async () => {
    for (const body of ["{", "[]", "3", "null"]) await expect(readJson(post(body))).rejects.toBeInstanceOf(ApiError);
  });
});
