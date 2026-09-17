import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ] },
      { source: "/write", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
      { source: "/api/editor/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.openai.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.leonardo.ai',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
