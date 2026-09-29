/** 사이드바 열림 상태를 복원한 뒤 변경 내용을 localStorage에 저장한다. */
import { useEffect, useState } from 'react'

export const SIDEBAR_OPEN_KEY = 'gongspec-sidebar-open'

export function useSidebarOpen() {
  const [open, setOpen] = useState(true)
  // 초기 복원이 끝난 뒤부터 저장해야 기존 접힘 상태가 기본값으로 덮어써지지 않는다.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(SIDEBAR_OPEN_KEY)
    if (saved === '0') setOpen(false)
    else if (saved === '1') setOpen(true)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, open ? '1' : '0')
  }, [open, ready])

  return { sidebarOpen: open, toggleSidebar: () => setOpen((current) => !current) }
}
