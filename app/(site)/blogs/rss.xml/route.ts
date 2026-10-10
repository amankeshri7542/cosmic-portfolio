import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL, profile } from "@/content/profile";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = (await getPublishedPosts()).filter((p) => !p.sample);
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blogs/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.dateISO).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>${(p.tags ?? []).map((t) => `\n      <category>${esc(t)}</category>`).join("")}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} — Blog</title>
    <link>${SITE_URL}/blogs</link>
    <atom:link href="${SITE_URL}/blogs/rss.xml" rel="self" type="application/rss+xml" />
    <description>Notes on software, data and the cloud by ${esc(profile.name)}, a full-stack engineer in Bengaluru.</description>
    <language>en</language>${posts[0] ? `\n    <lastBuildDate>${new Date(posts[0].modifiedISO ?? posts[0].dateISO).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } });
}
