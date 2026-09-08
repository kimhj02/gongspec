/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './use-debounce'
import { useTheme } from './use-theme'

afterEach(() => {
  cleanup()
})

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits before updating the search query', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: '' },
    })

    rerender({ value: '정' })
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('정')
  })
})

describe('useTheme', () => {
  afterEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('theme-dark')
  })

  it('restores the saved theme without overwriting it on first paint', () => {
    window.localStorage.setItem('gongspec-theme', 'dark')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
    expect(window.localStorage.getItem('gongspec-theme')).toBe('dark')
  })
})
