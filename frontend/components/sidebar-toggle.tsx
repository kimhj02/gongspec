'use client'

import type { ReactNode } from 'react'

export function SidebarToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="sidebar-toggle"
      aria-label={open ? '사이드바 닫기' : '사이드바 열기'}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className={`sidebar-caret ${open ? 'is-open' : 'is-closed'}`} aria-hidden="true" />
    </button>
  )
}

export function AppLayout({
  sidebarOpen,
  onToggle,
  sidebar,
  children,
}: {
  sidebarOpen: boolean
  onToggle: () => void
  sidebar: ReactNode
  children: ReactNode
}) {
  return (
    <div className={`app-layout${sidebarOpen ? '' : ' sidebar-closed'}`}>
      <aside className="sidebar" hidden={!sidebarOpen}>
        {sidebar}
      </aside>
      {sidebarOpen ? null : <SidebarToggle open={false} onToggle={onToggle} />}
      {children}
    </div>
  )
}
