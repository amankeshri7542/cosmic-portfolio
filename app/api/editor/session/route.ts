import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { checkOrigin, EditorError, login, readEditorJSON, SESSION_COOKIE, tokenHash } from "@/lib/editor";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { password } = await readEditorJSON(request);
    const token = await login(password, request);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly:true, secure:request.headers.get("origin")?.startsWith("https://") === true, sameSite:"strict", path:"/", maxAge:8 * 60 * 60 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof EditorError ? error.message : "Sign-in is temporarily unavailable." }, { status: error instanceof EditorError ? error.status : 503 });
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) await sql`DELETE FROM portfolio_editor_sessions WHERE token_hash = ${tokenHash(token)}`;
    const response = NextResponse.json({ success:true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly:true, secure:request.headers.get("origin")?.startsWith("https://") === true, sameSite:"strict", path:"/", maxAge:0 });
    return response;
  } catch { return NextResponse.json({ error:"Could not sign out. Try again." }, { status:503 }); }
}
