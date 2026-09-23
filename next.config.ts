import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 blocks _next/* when you open via 127.0.0.1 while the
  // dev server identity is localhost (or the reverse) — that 403'd
  // the product page JS and made the catalog look empty.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.9"],
  images: {
    // Local backend media is on 127.0.0.1 — Next 16 blocks that by default.
    dangerouslyAllowLocalIP: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "backend.betterbuildsc.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
