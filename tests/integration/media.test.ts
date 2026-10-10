import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";
import { analyzeImage, imageInfoMap, isAllowedMediaUrl, listMedia, recordMedia, softDeleteMedia, updateAlt } from "@/lib/editor/media";
import { resetDb } from "../helpers";

const png = (width: number, height: number) => sharp({ create: { width, height, channels: 3, background: "#336699" } }).png().toBuffer();
const URL1 = "https://abc123.public.blob.vercel-storage.com/dev/blog/cat-x1.png";

beforeEach(resetDb);

describe("media", () => {
  it("probes dimensions and builds a 16px webp placeholder", async () => {
    const info = await analyzeImage(await png(320, 200));
    expect(info).toMatchObject({ contentType: "image/png", width: 320, height: 200 });
    expect(info.lqip).toMatch(/^data:image\/webp;base64,/);
    const lqip = await sharp(Buffer.from(info.lqip.split(",")[1], "base64")).metadata();
    expect(lqip.width).toBe(16);
  });

  it("rejects files that are not images", async () => {
    await expect(analyzeImage(Buffer.from("<html></html>"))).rejects.toMatchObject({ status: 422 });
  });

  it("only accepts our own storage URLs", () => {
    expect(isAllowedMediaUrl(URL1)).toBe(true);
    expect(isAllowedMediaUrl("/uploads-dev/a.png")).toBe(true);
    for (const bad of ["http://abc.public.blob.vercel-storage.com/a.png", "https://evil.example/a.png", "https://user:pw@abc.public.blob.vercel-storage.com/a.png", "/uploads-dev/../../etc/passwd", "file:///etc/passwd", "https://169.254.169.254/x"]) {
      expect(isAllowedMediaUrl(bad)).toBe(false);
    }
  });

  it("records, lists, updates alt, maps, and soft-deletes", async () => {
    const media = await recordMedia({ url: URL1, pathname: "dev/blog/cat-x1.png", alt: "A cat" }, await png(64, 48));
    expect(media).toMatchObject({ width: 64, height: 48, alt: "A cat", contentType: "image/png" });
    expect(await imageInfoMap([URL1, "https://nope"])).toEqual({ [URL1]: { width: 64, height: 48, lqip: expect.stringMatching(/^data:image\/webp/) } });

    expect(await recordMedia({ url: URL1 }, await png(64, 48))).toMatchObject({ id: media.id, alt: "A cat" });
    expect((await updateAlt(media.id, " A sleepy cat "))?.alt).toBe("A sleepy cat");
    expect(await listMedia()).toHaveLength(1);
    expect(await softDeleteMedia(media.id)).toBe(true);
    expect(await softDeleteMedia(media.id)).toBe(false);
    expect(await listMedia()).toEqual([]);
    expect(await updateAlt(media.id, "x")).toBeNull();
    expect(Object.keys(await imageInfoMap([URL1]))).toEqual([URL1]);
  });
});
