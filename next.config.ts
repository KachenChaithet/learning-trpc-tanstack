import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      }
    ]
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "png.pngtree.com"
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com'
      }
    ]
  }
};

export default nextConfig;
