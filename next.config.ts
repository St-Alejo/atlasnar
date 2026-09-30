import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js injects inline bootstrap scripts, so 'unsafe-inline' is required
// unless nonces are used (which would force every page to be dynamic).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://inaturalist-open-data.s3.amazonaws.com https://static.inaturalist.org https://*.tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self' https://api.inaturalist.org https://api.gbif.org",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://inaturalist-open-data.s3.amazonaws.com/photos/**"),
      new URL("https://static.inaturalist.org/photos/**"),
    ],
  },
  experimental: {
    // One build worker means one RateLimitedQueue per provider during
    // `next build`, so the queue effectively throttles the whole build.
    cpus: 1,
    staticGenerationMaxConcurrency: 4,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
