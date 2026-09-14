const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    turbopack: {},
    output: process.env.NEXT_OUTPUT_STANDALONE === 'true' ? 'standalone' : undefined,

    // 🔥 Eslint block removed because Next.js 16 doesn't support it here anymore

    // Image configuration - Add external domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'as2.ftcdn.net',
            },
            {
                protocol: 'https',
                hostname: '**.ftcdn.net',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'www.nike.ae',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'ozgndkqgoclzzdhitoww.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            }
        ],
        formats: ['image/webp', 'image/avif'],
    },

    // Root configuration to prevent workspace root ambiguity
    outputFileTracingRoot: path.resolve(__dirname),

    // Webpack configuration
    webpack: (config, { dev, isServer }) => {
        if (!dev) {
            config.optimization = {
                ...config.optimization,
                moduleIds: 'deterministic',
                chunkIds: 'deterministic',
            };
        }

        return config;
    },

    // Experimental features
    experimental: {
        optimizeCss: false,
    },
};

module.exports = nextConfig;