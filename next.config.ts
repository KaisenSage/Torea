import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "pub-bd618a9723f54128a9dbd24698f83fba.r2.dev",
      },
      {
        protocol: "https",
        hostname: "your.cloudflare.url",
      },
    ],
  },
};

export default nextConfig;
