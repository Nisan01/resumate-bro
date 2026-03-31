import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
