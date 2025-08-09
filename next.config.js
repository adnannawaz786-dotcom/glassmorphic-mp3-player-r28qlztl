/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Webpack configuration for audio files and Web Audio API
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add support for audio file imports
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // Add support for Web Audio API worklets
    config.module.rules.push({
      test: /\.worklet\.js$/,
      use: {
        loader: 'worklet-loader',
        options: {
          name: 'static/js/[name].[hash].worklet.js',
        },
      },
    });

    // Optimize bundle splitting for audio libraries
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        audio: {
          test: /[\\/]node_modules[\\/](web-audio-api|audio-context|tone)[\\/]/,
          name: 'audio',
          chunks: 'all',
          priority: 30,
        },
      };
    }

    return config;
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Image optimization configuration
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression and performance optimizations
  compress: true,
  poweredByHeader: false,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/player',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // Enable static file serving with proper caching
  async rewrites() {
    return [
      {
        source: '/audio/:path*',
        destination: '/api/audio/:path*',
      },
    ];
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  // Configure build output
  distDir: '.next',

  // Enable source maps in development
  productionBrowserSourceMaps: false,

  // Configure page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Trailing slash configuration
  trailingSlash: false,

  // Configure build ID
  generateBuildId: async () => {
    return 'glassmorphic-mp3-player-' + Date.now();
  },
};

module.exports = nextConfig;