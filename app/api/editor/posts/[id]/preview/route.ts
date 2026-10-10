import { authorize } from "@/lib/editor/auth";
import { badRequest, handle, idParam, json, notFound, readJson } from "@/lib/editor/http";
import { createPreview, revokePreviews } from "@/lib/editor/posts";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (request: Request, { params }: Ctx) => {
  await authorize(request, true);
  const id = idParam((await params).id);
  const body = await readJson(request, 1_000);
  if (body.days !== undefined && (typeof body.days !== "number" || body.days < 1 || body.days > 30)) throw badRequest("days must be between 1 and 30.", "invalid_body");
  const preview = await createPreview(id, typeof body.days === "number" ? body.days : 7);
  if (!preview) throw notFound("Post not found.");
  return json({ url: `/preview/${preview.token}`, expiresAt: preview.expiresAt }, 201);
});

export const DELETE = handle(async (request: Request, { params }: Ctx) => {
  await authorize(request, true);
  return json({ ok: true, revoked: await revokePreviews(idParam((await params).id)) });
});
