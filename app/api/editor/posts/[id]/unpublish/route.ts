import { authorize } from "@/lib/editor/auth";
import { handle, idParam, intField, readJson } from "@/lib/editor/http";
import { unpublish } from "@/lib/editor/posts";
import { respondPost } from "@/lib/editor/respond";
import { scheduleIndexNow } from "@/lib/indexnow";

export const POST = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  await authorize(request, true);
  const id = idParam((await params).id);
  const body = await readJson(request, 10_000);
  const result = await unpublish(id, intField(body, "baseVersion"));
  // Tell search engines (and the AI answers built on them) about the change once the response is sent.
  if (result.ok) await scheduleIndexNow([`/blogs/${result.post.slug}`, "/blogs", "/blogs/rss.xml", "/llms.txt"]);
  return respondPost(result);
});
