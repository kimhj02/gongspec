/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { AppLayout, SidebarToggle } from '@/components/sidebar-toggle'
import { SIDEBAR_OPEN_KEY, useSidebarOpen } from '@/hooks/use-sidebar-open'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

function SidebarDemo() {
  const { sidebarOpen, toggleSidebar } = useSidebarOpen()
  return (
    <>
      <AppLayout
        sidebarOpen={sidebarOpen}
        onToggle={toggleSidebar}
        sidebar={
          <>
            <div className="sidebar-heading">
              <span>일정</span>
              <SidebarToggle open={sidebarOpen} onToggle={toggleSidebar} />
            </div>
            <nav>메뉴</nav>
          </>
        }
      >
        <main>본문</main>
      </AppLayout>
    </>
  )
}

describe('sidebar toggle', () => {
  it('hides the sidebar and shows it again', async () => {
    const user = userEvent.setup()
    render(<SidebarDemo />)

    expect(screen.getByText('메뉴')).toBeTruthy()
    expect(document.querySelector('.app-layout.sidebar-closed')).toBeNull()

    await user.click(screen.getByRole('button', { name: '사이드바 닫기' }))
    expect(document.querySelector('.app-layout.sidebar-closed')).toBeTruthy()
    expect(screen.getByRole('button', { name: '사이드바 열기' })).toBeTruthy()
    expect(window.localStorage.getItem(SIDEBAR_OPEN_KEY)).toBe('0')

    await user.click(screen.getByRole('button', { name: '사이드바 열기' }))
    expect(document.querySelector('.app-layout.sidebar-closed')).toBeNull()
    expect(screen.getByText('메뉴')).toBeTruthy()
    expect(window.localStorage.getItem(SIDEBAR_OPEN_KEY)).toBe('1')
  })

  it('restores a closed sidebar from storage', async () => {
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, '0')
    render(<SidebarDemo />)

    expect(await screen.findByRole('button', { name: '사이드바 열기' })).toBeTruthy()
    expect(document.querySelector('.app-layout.sidebar-closed')).toBeTruthy()
  })
})
