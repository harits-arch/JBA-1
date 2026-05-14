import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: projectRoot
  },
  async redirects() {
    return [
      {
        source: "/admin/logs",
        destination: "/admin",
        permanent: false
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  }
};

export default nextConfig;
