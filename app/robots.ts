import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/profile";

// Public pages are open to search engines and AI crawlers alike; the editor and APIs are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/write", "/api/", "/preview/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
