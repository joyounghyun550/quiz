import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  // 프록시 설정
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://metafairy.me:3600/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
