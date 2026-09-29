/** standalone 배포 출력과 백엔드 API·공휴일 API 프록시 경로를 설정한다. */
const backend = (process.env.API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  agentRules: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Swagger 문서·정적 파일도 API와 같은 백엔드로 전달한다.
      {
        source: '/swagger-ui.html',
        destination: `${backend}/swagger-ui.html`,
      },
      {
        source: '/swagger-ui/:path*',
        destination: `${backend}/swagger-ui/:path*`,
      },
      {
        source: '/v3/api-docs/:path*',
        destination: `${backend}/v3/api-docs/:path*`,
      },
      {
        source: '/v3/api-docs.yaml',
        destination: `${backend}/v3/api-docs.yaml`,
      },
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
