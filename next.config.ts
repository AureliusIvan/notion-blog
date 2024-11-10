import {NextConfig} from 'next';

// Type-safe configuration options for Next.js
const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    BLOG_INDEX_ID: process.env.BLOG_INDEX_ID,
  },
  webpack: (config, {isServer, dev}) => {
    // Example: Conditionally add entries or plugins only in production server builds
    if (!dev && isServer) {
      config.entry = async () => {
        const originalEntry = await config.entry();
        return {
          ...originalEntry,
          'build-rss.js': './src/lib/build-rss.ts', // Server-only build entry
        };
      };
    }
    return config;
  },
};

export default nextConfig;
