/** 모든 페이지의 한국어 HTML, 메타데이터, 전역 스타일과 프로덕션 분석 컴포넌트를 설정한다. */
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GongSpec | 공기업 스펙 정리 사이트',
  description: '공기업 스펙 정리 사이트',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#f6f3ee',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="bg-background font-sans">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
