const { readFileSync } = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Update webpack config to handle WebSocket connections
  webpack: (config, { isServer, dev }) => {
    // Add WebSocket configurations
    config.infrastructureLogging = {
      level: 'error',
    };
    
    if (!isServer && dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  // Update async rewrites to handle both HTTP and HTTPS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://127.0.0.1:8443/api/:path*',
      },
      {
        source: '/_next/webpack-hmr',
        destination: 'http://localhost:3000/_next/webpack-hmr',
      },
    ];
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: 'https://127.0.0.1:8443',
  },
}

module.exports = nextConfig 