/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
