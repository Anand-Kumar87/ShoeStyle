/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Image configuration - Add external domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'as2.ftcdn.net',
            },
            {
                protocol: 'https',
                hostname: '**.ftcdn.net', // Allow all ftcdn subdomains
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
        formats: ['image/webp', 'image/avif'],
    },

    // Reduce webpack cache size (FIX for memory issue)
    webpack: (config, { dev, isServer }) => {
        // Disable persistent caching in development
        if (dev) {
            config.cache = false;
        }

        // Reduce memory usage
        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            chunkIds: 'deterministic',
        };

        return config;
    },

    // Experimental features
    experimental: {
        optimizeCss: false, // Disable CSS optimization in dev
    },
};

module.exports = nextConfig;