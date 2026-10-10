import "server-only";
import { cacheLife } from "next/cache";
import { storyCode } from "@/content/story-code";
import { highlightCode } from "./markdown";

/** The story's code samples, highlighted once and cached (they only change with a deploy). */
export async function getStoryCode() {
  "use cache";
  cacheLife("max");
  return Object.fromEntries(
    await Promise.all(Object.entries(storyCode).map(async ([id, c]) => [id, { ...c, html: await highlightCode(c.code, c.lang) }] as const)),
  );
}
