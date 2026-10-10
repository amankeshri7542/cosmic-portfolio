import { authorize } from "@/lib/editor/auth";
import { handle, idParam, json, notFound } from "@/lib/editor/http";
import { getRevision } from "@/lib/editor/posts";

export const GET = handle(async (request: Request, { params }: { params: Promise<{ id: string; revId: string }> }) => {
  await authorize(request);
  const { id, revId } = await params;
  const revision = await getRevision(idParam(id), Number(revId));
  if (!revision) throw notFound("Revision not found.");
  return json({ revision });
});
