import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:8080/api/v1/:path*",
  //     },
  //   ];
  // },
  output: 'standalone',
};

export default nextConfig;
