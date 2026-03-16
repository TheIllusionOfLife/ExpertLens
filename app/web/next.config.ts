import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // CSP disabled: AudioWorklet blob URLs require script-src 'blob:' which
          // varies by browser. Revisit with nonce-based CSP via Next.js middleware.
        ],
      },
    ];
  },
};

export default nextConfig;
