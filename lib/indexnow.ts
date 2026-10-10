import "server-only";
import { SITE_URL } from "@/content/profile";

// IndexNow tells Bing (which powers ChatGPT search and Copilot), Yandex and others that a URL changed,
// instead of waiting for the next crawl. The key is public by design: it's served at /<key>.txt.
export const INDEXNOW_KEY = "325fc1975d595ba7fbf642a49af1be2a";

export async function notifyIndexNow(paths: string[]) {
  if (process.env.VERCEL_ENV !== "production" || paths.length === 0) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => new URL(p, SITE_URL).toString()),
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // best effort: crawlers will still find the change through the sitemap
  }
}

/** Notify after the response is sent when running inside a request; otherwise (tests, scripts) skip quietly. */
export async function scheduleIndexNow(paths: string[]) {
  try {
    const { after } = await import("next/server");
    after(() => notifyIndexNow(paths));
  } catch {
    // outside a request scope
  }
}
