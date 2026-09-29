/** 테스트 파일 탐색 범위와 @ 경로 별칭을 설정한다. DOM이 필요한 테스트는 파일별 jsdom 환경을 지정한다. */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': root,
    },
  },
})
