import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.clover.com https://checkout.sandbox.clover.com https://*.clover.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net;",
              "frame-src 'self' https://checkout.clover.com https://checkout.sandbox.clover.com https://*.clover.com;",
              "connect-src 'self' https://checkout.clover.com https://checkout.sandbox.clover.com https://*.clover.com https://api.clover.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' data: https://fonts.gstatic.com;",
              "img-src 'self' data: blob: https://* http://*;"
            ].join(" ")
          },
        ],
      },
    ];
  },
};

export default nextConfig;
