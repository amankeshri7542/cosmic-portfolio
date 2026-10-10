import { authorize } from "@/lib/editor/auth";
import { badRequest, handle, isUuid, json, notFound, readJson } from "@/lib/editor/http";
import { listMedia, mediaDriver, recordMedia, softDeleteMedia, updateAlt, uploadPrefix } from "@/lib/editor/media";

const str = (value: unknown, key: string, max: number) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > max) throw badRequest(`${key} must be a string of at most ${max} characters.`, "invalid_body");
  return value;
};

export const GET = handle(async (request: Request) => {
  await authorize(request);
  return json({ media: await listMedia(), driver: mediaDriver(), prefix: uploadPrefix() });
});

export const POST = handle(async (request: Request) => {
  await authorize(request, true);
  const body = await readJson(request, 10_000);
  const url = str(body.url, "url", 2000);
  if (!url) throw badRequest("url is required.", "invalid_body");
  const bytes = typeof body.bytes === "number" && Number.isFinite(body.bytes) ? body.bytes : null;
  const media = await recordMedia({ url, pathname: str(body.pathname, "pathname", 500) ?? null, contentType: str(body.contentType, "contentType", 100) ?? null, bytes, alt: str(body.alt, "alt", 500) ?? "" });
  return json({ media }, 201);
});

export const PATCH = handle(async (request: Request) => {
  await authorize(request, true);
  const body = await readJson(request, 10_000);
  const alt = str(body.alt, "alt", 500);
  if (typeof body.id !== "string" || !isUuid(body.id) || alt === undefined) throw badRequest("id and alt are required.", "invalid_body");
  const media = await updateAlt(body.id, alt);
  if (!media) throw notFound("Image not found.");
  return json({ media });
});

export const DELETE = handle(async (request: Request) => {
  await authorize(request, true);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!isUuid(id) || !(await softDeleteMedia(id))) throw notFound("Image not found.");
  return json({ ok: true });
});
