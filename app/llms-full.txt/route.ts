import { knowledge } from "@/lib/knowledge";

// Everything in llms.txt plus experience details, case-study notes and the full text of each article.
export async function GET() {
  return new Response(await knowledge(true), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
