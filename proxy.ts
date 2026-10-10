import { NextResponse, type NextRequest } from "next/server";
import { slugRedirects } from "@/lib/redirect-map";

export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice("/blogs/".length);
  if (!slug || slug.includes("/") || slug === "rss.xml") return NextResponse.next();
  const to = (await slugRedirects()).get(slug);
  if (!to) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/blogs/${to}`;
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/blogs/:slug"] };
