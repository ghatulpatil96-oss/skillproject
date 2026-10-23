/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    outputFileTracingIncludes: {
      "/*": ["./scripts/schema.sql"],
    },
  },
};
module.exports = nextConfig;
