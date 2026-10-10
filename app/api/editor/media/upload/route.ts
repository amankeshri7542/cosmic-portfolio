import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authorize } from "@/lib/editor/auth";
import { ApiError, badRequest, handle, json, readJson } from "@/lib/editor/http";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, mediaDriver, storeLocalUpload, uploadPrefix } from "@/lib/editor/media";

/** What the client should do: `blob` = client upload via @vercel/blob/client, `local` = multipart POST here. */
export const GET = handle(async (request: Request) => {
  await authorize(request);
  return json({ driver: mediaDriver(), prefix: uploadPrefix(), maxBytes: MAX_UPLOAD_BYTES, allowedTypes: ALLOWED_TYPES });
});

async function blobToken(request: Request) {
  const body = (await readJson(request, 20_000)) as unknown as HandleUploadBody;
  if (body.type !== "blob.generate-client-token") throw badRequest("Unsupported upload event.", "invalid_body");
  try {
    return json(
      await handleUpload({
        request,
        body,
        onBeforeGenerateToken: async (pathname) => {
          if (!pathname.startsWith(uploadPrefix()) || pathname.includes("..") || pathname.length > 300) {
            throw new ApiError(422, "invalid_pathname", `Uploads must go under ${uploadPrefix()}.`);
          }
          return { allowedContentTypes: ALLOWED_TYPES, maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: true };
        },
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "upload_rejected", "The upload could not be authorised.");
  }
}

async function localUpload(request: Request) {
  if (!/^multipart\/form-data\b/i.test(request.headers.get("content-type") ?? "")) throw new ApiError(415, "unsupported_media_type", "Send multipart/form-data with a file field.");
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES + 100_000) throw new ApiError(413, "payload_too_large", "Images must be 8 MB or smaller.");
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw badRequest("Attach an image as the file field.", "invalid_body");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, "payload_too_large", "Images must be 8 MB or smaller.");
  const alt = form?.get("alt");
  const media = await storeLocalUpload(Buffer.from(await file.arrayBuffer()), file.name, typeof alt === "string" ? alt : "");
  return json({ media }, 201);
}

export const POST = handle(async (request: Request) => {
  await authorize(request, true);
  const driver = mediaDriver();
  if (driver === "none") throw new ApiError(503, "storage_unavailable", "Image storage is not configured.");
  return driver === "blob" ? blobToken(request) : localUpload(request);
});
