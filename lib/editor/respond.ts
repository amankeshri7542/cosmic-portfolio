import { json } from "./http";
import { withStatus, type PostRecord } from "./posts";

type Result =
  | { ok: true; post: PostRecord }
  | { ok: false; conflict: true; current: PostRecord }
  | { ok: false; errors: string[] }
  | { ok: false; error: string };

const ERRORS: Record<string, [number, string]> = {
  not_found: [404, "Post not found."],
  revision_not_found: [404, "Revision not found."],
  slug_taken: [409, "That URL is already used by another post."],
  was_published: [409, "This post has been published before, so it cannot be deleted. Unpublish it instead."],
  not_published: [409, "This post is not published."],
};

/** Maps a data-layer result to the HTTP contract shared by the post routes. */
export function respondPost(result: Result, successStatus = 200) {
  if (result.ok) return json({ post: withStatus(result.post) }, successStatus);
  if ("conflict" in result) {
    return json({ error: "version_conflict", message: "This post changed somewhere else. Reload before saving again.", current: withStatus(result.current) }, 409);
  }
  if ("errors" in result) return json({ error: "validation_failed", message: "Fix these before publishing.", errors: result.errors }, 422);
  const [status, message] = ERRORS[result.error] ?? [400, "Request failed."];
  return json({ error: result.error, message }, status);
}
