import { knowledge } from "@/lib/knowledge";

// A plain-text map of the site for language models and other agents (llmstxt.org).
export async function GET() {
  return new Response(await knowledge(false), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
