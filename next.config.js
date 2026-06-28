/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Disable ESLint during builds (especially for production)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds for faster deployment
    ignoreBuildErrors: true,
  },
  // Ensure NextAuth routes work on Netlify
  experimental: {
    serverActions: {
      allowedOrigins: ['vispicy.com', 'www.vispicy.com', 'face-swap.vispicy.com'],
    },
  },
}

module.exports = nextConfig
