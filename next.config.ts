import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Photos
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // All Google user content
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Common image hosting
      },
      {
        protocol: 'https',
        hostname: 'github.com', // GitHub raw images
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com', // GitHub raw content
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com', // Placeholder for future CDN
      },
    ],
  },
};

export default nextConfig;
