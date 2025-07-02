/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // permite cualquier dominio
      },
    ],
  },
};

module.exports = nextConfig;
