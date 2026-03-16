import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const wsUrl = apiUrl.replace(/^http/, "ws");
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // CSP only in production: dev mode requires 'unsafe-eval' for Fast Refresh
          // which defeats the purpose of CSP.
          ...(isDev
            ? []
            : [
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    `connect-src 'self' ${apiUrl} ${wsUrl}`,
                    "script-src 'self' 'unsafe-inline'",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' blob: data:",
                    "media-src 'self' blob:",
                    "worker-src 'self' blob:",
                  ].join("; "),
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
