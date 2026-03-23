const path = require('path');

const createRemotePatternsFromEnv = () => {
  const patterns = [];
  const candidates = [
    process.env.NEXT_PUBLIC_CDN_DOMAIN,
    process.env.CDN_DOMAIN,
    process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT,
    process.env.CLOUDFLARE_R2_ENDPOINT,
  ].filter(Boolean);

  for (const rawUrl of candidates) {
    try {
      const parsed = new URL(rawUrl);
      patterns.push({
        protocol: parsed.protocol.replace(':', ''),
        hostname: parsed.hostname,
        port: parsed.port || '',
        pathname: '/**',
      });
    } catch {
      // ignore invalid URL values
    }
  }

  return patterns;
};

const envRemotePatterns = createRemotePatternsFromEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Image optimization
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
      ...envRemotePatterns,
    ],
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          admin: {
            test: /[\\/]src[\\/](components|pages)[\\/].*admin.*[\\/]/,
            name: 'admin',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@backend': path.resolve(__dirname, 'backend/src'),
    };
    
    return config;
  },
  
  // Proxy API requests to admin backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5002/api/:path*',
      },
    ];
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
};

module.exports = nextConfig;
