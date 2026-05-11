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
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
