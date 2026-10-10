import type { NextConfig } from "next";
import { execSync } from "node:child_process";

const SHORTENER = process.env.SHORTENER_ORIGIN ?? "https://url-shortner-woad-tau.vercel.app";

function gitSha() {
  try { return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return "local"; }
}

// Old public image paths → re-encoded files. Keeps any external links to the old assets working.
const movedImages: Record<string, string> = {
  "/shivtraders.png": "/work/shiv-cement.webp",
  "/alexaAI.png": "/work/alexa.webp",
  "/mythos.jpeg": "/work/mythos.webp",
  "/foxpop.png": "/work/foxpop.webp",
  "/image.png": "/work/medscan.webp",
  "/url.png": "/work/url-shortener.webp",
  "/prompt.png": "/work/prompt-enhancer.webp",
  "/aws-serverless.png": "/work/notifications.webp",
  "/diagram-export-18-04-2026-22_29_24.png": "/work/shiv-cement-architecture.webp",
};

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // ~14 KB of CSS in total: inlining it removes five render-blocking requests on slow networks.
  experimental: { inlineCss: true },
  env: { BUILD_SHA: gitSha(), BUILD_TIME: new Date().toISOString() },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
      ...Object.entries(movedImages).map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: "/rss.xml", destination: "/blogs/rss.xml", permanent: true },
      { source: "/feed.xml", destination: "/blogs/rss.xml", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // The URL shortener (a separate Vercel app) is mounted under this domain.
      beforeFiles: [
        { source: "/url-shortner", destination: `${SHORTENER}/url-shortner` },
        { source: "/url-shortner/:path*", destination: `${SHORTENER}/url-shortner/:path*` },
        { source: "/api/shorten", destination: `${SHORTENER}/api/shorten` },
      ],
      afterFiles: [],
      // Six-character short codes only resolve when no page or file matches, so real routes always win.
      fallback: [{ source: "/:shortCode(\\w{6})", destination: `${SHORTENER}/:shortCode` }],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/write/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/write", headers: [{ key: "X-Frame-Options", value: "DENY" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/editor/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/preview/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Referrer-Policy", value: "no-referrer" }] },
      { source: "/sky/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/models/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
