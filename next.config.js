const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this directory so Next.js build-trace collection
  // works correctly on Vercel (avoids the "multiple lockfiles" root-detection
  // warning and ensures server-component traces are complete).
  outputFileTracingRoot: path.join(__dirname),

  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
