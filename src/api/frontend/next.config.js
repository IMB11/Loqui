/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "../public",
  images: {
    unoptimized: true
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
  },
}

module.exports = nextConfig
