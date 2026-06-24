/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/plumbline-demo',
  assetPrefix: '/plumbline-demo/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
