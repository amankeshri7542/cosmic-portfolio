import { describe, expect, it } from "vitest";
import { collapseRedirects } from "@/lib/editor/redirects";

describe("collapseRedirects", () => {
  it("adds old -> new", () => {
    expect(collapseRedirects([], "a", "b")).toEqual({ upsert: [{ from: "a", to: "b" }], remove: [] });
  });

  it("points earlier redirects straight at the new slug", () => {
    const { upsert } = collapseRedirects([{ from: "a", to: "b" }], "b", "c");
    expect(upsert).toEqual(expect.arrayContaining([{ from: "a", to: "c" }, { from: "b", to: "c" }]));
    expect(upsert).toHaveLength(2);
  });

  it("drops the redirect shadowed by the new slug and avoids loops", () => {
    const existing = [{ from: "a", to: "c" }, { from: "b", to: "c" }];
    const { upsert, remove } = collapseRedirects(existing, "c", "a");
    expect(remove).toEqual(["a"]);
    expect(upsert).toEqual(expect.arrayContaining([{ from: "b", to: "a" }, { from: "c", to: "a" }]));
    expect(upsert.some((r) => r.from === r.to)).toBe(false);
  });

  it("does nothing when the slug did not change", () => {
    expect(collapseRedirects([{ from: "x", to: "a" }], "a", "a")).toEqual({ upsert: [], remove: [] });
  });
});
