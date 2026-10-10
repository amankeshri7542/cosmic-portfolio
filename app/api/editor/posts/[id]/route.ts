import { authorize } from "@/lib/editor/auth";
import { badRequest, handle, idParam, intField, json, notFound, readJson } from "@/lib/editor/http";
import { deletePost, getPostById, saveDraft, withStatus } from "@/lib/editor/posts";
import { respondPost } from "@/lib/editor/respond";
import { sanitizeDraft } from "@/lib/editor/validate";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (request: Request, { params }: Ctx) => {
  await authorize(request);
  const post = await getPostById(idParam((await params).id));
  if (!post) throw notFound("Post not found.");
  return json({ post: withStatus(post) });
});

export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  await authorize(request, true);
  const id = idParam((await params).id);
  const body = await readJson(request, 400_000);
  const baseVersion = intField(body, "baseVersion");
  const parsed = sanitizeDraft(body.draft);
  if ("error" in parsed) return json({ error: "invalid_draft", message: parsed.error }, 422);
  if (body.checkpoint !== undefined && typeof body.checkpoint !== "boolean") throw badRequest("checkpoint must be a boolean.", "invalid_body");
  return respondPost(await saveDraft(id, parsed.draft, baseVersion, { checkpoint: body.checkpoint === true }));
});

export const DELETE = handle(async (request: Request, { params }: Ctx) => {
  await authorize(request, true);
  const result = await deletePost(idParam((await params).id));
  return result.ok ? json({ ok: true }) : respondPost(result);
});
