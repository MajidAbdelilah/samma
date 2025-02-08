const { readFileSync } = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://127.0.0.1:8443/api/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://127.0.0.1:8443',
  },
  webpack: (config, { isServer }) => {
    // Add any webpack configurations if needed
    return config;
  },
}

module.exports = nextConfig 