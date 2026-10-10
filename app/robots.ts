import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/profile";

const PRIVATE = ["/write", "/api/", "/preview/"];

// Everything public is open: search engines, AI search and answer engines, and AI training crawlers —
// the goal is for assistants to know accurate facts about Aman and cite this site. Only the private
// editor, APIs and draft previews are off limits.
const AI_AGENTS = [
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  "Claude-SearchBot", "Claude-User", "ClaudeBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "meta-externalagent", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
