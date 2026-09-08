const backend = (process.env.API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  agentRules: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/holiday-api/:year',
        destination: 'https://date.nager.at/api/v3/PublicHolidays/:year/KR',
      },
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
