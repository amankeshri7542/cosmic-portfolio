import { authorize } from "@/lib/editor/auth";
import { ApiError, badRequest, handle, json, readJson } from "@/lib/editor/http";
import { imageInfoMap } from "@/lib/editor/media";
import { markdownImages } from "@/lib/editor/validate";
import { renderMarkdown } from "@/lib/markdown";
import { wordCount } from "@/lib/post-types";

const MAX_MARKDOWN = 200_000;

export const POST = handle(async (request: Request) => {
  await authorize(request, true);
  const body = await readJson(request, MAX_MARKDOWN * 2 + 1_000);
  if (typeof body.markdown !== "string") throw badRequest("markdown must be a string.", "invalid_body");
  if (body.markdown.length > MAX_MARKDOWN) throw new ApiError(413, "payload_too_large", "Markdown is limited to 200 KB.");
  const images = await imageInfoMap(markdownImages(body.markdown).map((i) => i.url));
  const { html, toc } = await renderMarkdown(body.markdown, { images });
  return json({ html, toc, words: wordCount(body.markdown) });
});
