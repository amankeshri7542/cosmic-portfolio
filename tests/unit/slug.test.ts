import { describe, expect, it } from "vitest";
import { slugify, validSlug } from "@/lib/post-types";

describe("slug helpers", () => {
  it("validates slugs", () => {
    for (const ok of ["a", "hello-world", "a1-b2-c3", "x".repeat(100)]) expect(validSlug(ok)).toBe(true);
    for (const bad of ["", "Hello", "-a", "a-", "a--b", "a_b", "a b", "ünï", "x".repeat(101), "../etc"]) expect(validSlug(bad)).toBe(false);
  });

  it("slugifies titles", () => {
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
    expect(slugify("Café déjà vu")).toBe("cafe-deja-vu");
    expect(slugify("---")).toBe("");
    expect(slugify("日本語")).toBe("");
    expect(validSlug(slugify("A ".repeat(100)))).toBe(true);
  });
});
