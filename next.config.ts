import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/modelos/:slug",
        destination: "/modelos/:slug/index.html",
      },
      {
        source: "/pacotes/:slug",
        destination: "/pacotes/:slug/index.html",
      },
      {
        source: "/pacotes/:slug/admin",
        destination: "/pacotes/:slug/admin/index.html",
      },
      {
        source: "/pacotes/:slug/checkout",
        destination: "/pacotes/:slug/checkout.html",
      },
    ];
  },
};

export default nextConfig;

