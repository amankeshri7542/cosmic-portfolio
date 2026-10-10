import { NextResponse, type NextRequest } from "next/server";
import { slugRedirects } from "@/lib/redirect-map";
import { SHORTENER, isShortCode, leavingPage, trusted } from "@/lib/shortlinks";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isShortCode(pathname)) return shortLink(pathname);
  return blogRedirect(request);
}

/** Renamed articles answer with a real 308 before rendering starts. */
async function blogRedirect(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice("/blogs/".length);
  if (!slug || slug.includes("/") || slug === "rss.xml") return NextResponse.next();
  const to = (await slugRedirects()).get(slug);
  if (!to) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/blogs/${to}`;
  return NextResponse.redirect(url, 308);
}

/** Resolve a short code without following it, then redirect only to known destinations. */
async function shortLink(pathname: string) {
  let res: Response;
  try {
    res = await fetch(`${SHORTENER}${pathname}`, { redirect: "manual", signal: AbortSignal.timeout(4000) });
  } catch {
    return new NextResponse("Short link service unavailable. Try again shortly.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const location = res.headers.get("location");
  if (res.status < 300 || res.status >= 400 || !location) return NextResponse.next(); // unknown code → this site's 404
  let dest: URL;
  try {
    dest = new URL(location, SHORTENER);
  } catch {
    return NextResponse.next();
  }
  if (dest.protocol !== "https:" && dest.protocol !== "http:") return NextResponse.next(); // never javascript:, data:, …
  if (trusted(dest)) return NextResponse.redirect(dest, 302);
  return new NextResponse(leavingPage(dest), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" },
  });
}

export const config = { matcher: ["/blogs/:slug", "/:code([A-Za-z0-9_]{6})"] };
