import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { checkOrigin, EditorError, readEditorJSON, requireEditor, validatePost } from "@/lib/editor";

function failure(error: unknown) {
  return NextResponse.json({ error:error instanceof EditorError ? error.message : "Could not save. Your text is still in the editor; try again." }, { status:error instanceof EditorError ? error.status : 503, headers:{ "Cache-Control":"no-store" } });
}
export async function GET() {
  try {
    await requireEditor();
    const posts = await sql`SELECT slug, draft, published, version FROM portfolio_posts ORDER BY updated_at DESC`;
    return NextResponse.json({ posts:posts.rows }, { headers:{ "Cache-Control":"private, no-store" } });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireEditor();
    const data = await readEditorJSON(request);
    const draft = validatePost(data);
    if (!["save", "publish", "unpublish"].includes(String(data.intent))) throw new EditorError("Unknown action.");
    if (!Number.isSafeInteger(data.version) || Number(data.version) < 0) throw new EditorError("Invalid revision.");
    const current = await sql`SELECT published, version FROM portfolio_posts WHERE slug = ${draft.slug}`;
    const previous = current.rows[0];
    if ((previous?.version ?? 0) !== data.version) throw new EditorError("This article changed in another tab. Copy your text before reloading the latest version.", 409);
    const now = new Date().toISOString();
    const dateISO = previous?.published?.dateISO || now;
    const publication = data.intent === "publish" ? { ...draft, dateISO, modifiedISO:now, date:new Date(dateISO).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric", timeZone:"UTC" }) } : data.intent === "unpublish" ? null : previous?.published ?? null;
    const result = previous
      ? await sql`UPDATE portfolio_posts SET draft = ${JSON.stringify(draft)}::jsonb, published = ${publication ? JSON.stringify(publication) : null}::jsonb, version = version + 1, updated_at = now() WHERE slug = ${draft.slug} AND version = ${Number(data.version)} RETURNING slug, draft, published, version`
      : await sql`INSERT INTO portfolio_posts (slug, draft, published) VALUES (${draft.slug}, ${JSON.stringify(draft)}::jsonb, ${publication ? JSON.stringify(publication) : null}::jsonb) ON CONFLICT (slug) DO NOTHING RETURNING slug, draft, published, version`;
    if (!result.rowCount) throw new EditorError("The article URL or revision is already in use. Your text has not been overwritten.", 409);
    return NextResponse.json({ post:result.rows[0] }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error) { return failure(error); }
}
