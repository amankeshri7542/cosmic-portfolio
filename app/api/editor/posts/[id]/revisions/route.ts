import { authorize } from "@/lib/editor/auth";
import { handle, idParam, json, notFound } from "@/lib/editor/http";
import { getPostById, listRevisions } from "@/lib/editor/posts";

export const GET = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  await authorize(request);
  const id = idParam((await params).id);
  if (!(await getPostById(id))) throw notFound("Post not found.");
  return json({ revisions: await listRevisions(id) });
});
