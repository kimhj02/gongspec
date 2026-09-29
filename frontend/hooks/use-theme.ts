/** 저장된 테마를 복원하고 HTML 색상 모드 및 localStorage를 함께 갱신한다. */
import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'gongspec-theme'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('theme-dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  // 저장된 값 복원 전 기본 테마를 localStorage에 기록하면 사용자의 선택을 덮어쓰므로 준비 상태를 구분한다.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const next = saved === 'dark' || saved === 'light' ? saved : 'light'
    setTheme(next)
    applyTheme(next)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
  }, [ready, theme])

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))

  return { theme, toggleTheme }
}
