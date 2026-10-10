import { authorize } from "@/lib/editor/auth";
import { badRequest, handle, json, readJson } from "@/lib/editor/http";
import { createPost, listPosts, withStatus } from "@/lib/editor/posts";

export const GET = handle(async (request: Request) => {
  await authorize(request);
  return json({ posts: await listPosts() });
});

export const POST = handle(async (request: Request) => {
  await authorize(request, true);
  const body = await readJson(request, 10_000);
  if (body.title !== undefined && typeof body.title !== "string") throw badRequest("title must be a string.", "invalid_body");
  return json({ post: withStatus(await createPost({ title: body.title })) }, 201);
});
