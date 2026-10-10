import { authorize } from "@/lib/editor/auth";
import { handle, idParam, intField, readJson } from "@/lib/editor/http";
import { unpublish } from "@/lib/editor/posts";
import { respondPost } from "@/lib/editor/respond";

export const POST = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  await authorize(request, true);
  const id = idParam((await params).id);
  const body = await readJson(request, 10_000);
  return respondPost(await unpublish(id, intField(body, "baseVersion")));
});
