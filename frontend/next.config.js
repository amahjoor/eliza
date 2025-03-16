/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'eliza-storage.s3.amazonaws.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
