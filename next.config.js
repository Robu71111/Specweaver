/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for Mermaid dynamic import
    esmExternals: "loose",
  },
};

module.exports = nextConfig;
