import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-markdown', 'highlight.js'],
    optimizeCss: true,
    turbo: {
      root: '/home/ev3lynx/dev/project-s3',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
