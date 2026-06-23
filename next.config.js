/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

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
                hostname: 'via.placeholder.com',
            }
        ],
        formats: ['image/webp', 'image/avif'],
    },

    // 🔥 NAYA FIX: Next.js 16 Turbopack Crash Error ko theek karne ke liye
    turbopack: {},

    // Reduce webpack cache size (For production / when not using Turbopack)
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            config.cache = false;
        }

        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            chunkIds: 'deterministic',
        };

        return config;
    },

    // Experimental features
    experimental: {
        optimizeCss: false,
    },
};

module.exports = nextConfig;