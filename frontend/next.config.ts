import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Reddit and other external sources
  images: {
    domains: ["www.reddit.com"],
  },
  // Required for standalone Docker output
  output: "standalone",
};

export default nextConfig;
