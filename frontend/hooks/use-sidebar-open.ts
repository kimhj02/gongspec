import { useEffect, useState } from 'react'

export const SIDEBAR_OPEN_KEY = 'gongspec-sidebar-open'

export function useSidebarOpen() {
  const [open, setOpen] = useState(true)
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
