import { NextResponse } from "next/server";
import { checkOrigin, clearSessionCookie, destroySession, editorConfigured, login, requireEditor, sessionTokenFrom, setSessionCookie } from "@/lib/editor/auth";
import { handle, json } from "@/lib/editor/http";

export const GET = handle(async (request: Request) => {
  if (!editorConfigured()) return json({ configured: false, authenticated: false });
  const session = await requireEditor(request);
  if (session instanceof Response) return json({ configured: true, authenticated: false });
  return json({ configured: true, authenticated: true, expiresAt: session.expiresAt.toISOString() });
});

export const POST = handle(async (request: Request) => {
  const blocked = checkOrigin(request);
  if (blocked) return blocked;
  const { token, expiresAt } = await login(request);
  const response = NextResponse.json({ ok: true, expiresAt: expiresAt.toISOString() }, { headers: { "Cache-Control": "no-store" } });
  setSessionCookie(response, token);
  return response;
});

export const DELETE = handle(async (request: Request) => {
  const blocked = checkOrigin(request);
  if (blocked) return blocked;
  const token = sessionTokenFrom(request);
  if (token && editorConfigured()) await destroySession(token);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(response);
  return response;
});
