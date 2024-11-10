import {NextConfig} from 'next';

// Type-safe configuration options for Next.js
const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    BLOG_INDEX_ID: process.env.BLOG_INDEX_ID,
  },
  webpack: (config, {isServer}) => {
    if (!isServer) return config;

    // Remove or comment out any code that references build-rss
    // const originalEntry = config.entry;
    // config.entry = async () => {
    //   const entries = await originalEntry();
    //   if (!entries['build-rss']) {
    //     entries['build-rss'] = './src/lib/build-rss.ts';
    //   }
    //   return entries;
    // };

    return config;
  },
};

export default nextConfig;
