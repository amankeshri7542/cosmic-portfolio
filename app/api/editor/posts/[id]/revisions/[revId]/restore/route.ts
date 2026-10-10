import { authorize } from "@/lib/editor/auth";
import { handle, idParam, intField, notFound, readJson } from "@/lib/editor/http";
import { restoreRevision } from "@/lib/editor/posts";
import { respondPost } from "@/lib/editor/respond";

export const POST = handle(async (request: Request, { params }: { params: Promise<{ id: string; revId: string }> }) => {
  await authorize(request, true);
  const { id, revId } = await params;
  const rev = Number(revId);
  if (!Number.isSafeInteger(rev)) throw notFound("Revision not found.");
  const body = await readJson(request, 10_000);
  return respondPost(await restoreRevision(idParam(id), rev, intField(body, "baseVersion")));
});
