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

// Content-Security-Policy. Next.js bootstraps with inline scripts and these pages are static (no per-request
// nonce), so scripts allow 'self' + inline; everything else is locked down. Production only: dev needs eval.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://vercel.com https://*.blob.vercel-storage.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // CSS is not inlined: at ~67 KB it was sent three times per page (a <style> tag plus twice in the RSC
  // payload), which outweighed the saved request. As files it is cached across pages.
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
      // Six-character short codes are resolved in proxy.ts, which only redirects to known destinations.
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
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
