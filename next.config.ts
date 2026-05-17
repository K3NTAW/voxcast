import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./lib/csp";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  serverExternalPackages: ["@prisma/client", "@auth/prisma-adapter"],
  async headers() {
    return [
      { source: "/:path*", headers: buildSecurityHeaders() },
      {
        source: "/overlay/:token*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
