/** @type {import('next').NextConfig} */
const nextConfig = {
  // Opt @supabase/supabase-js out of server bundling to avoid
  // "Cannot find module './vendor-chunks/@supabase.js'" - Next.js will require
  // it from node_modules instead of creating a vendor chunk.
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig

