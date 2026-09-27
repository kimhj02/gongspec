/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EssayCopyButton from '@/components/essay-copy-button'
import EssayBoard from '@/components/essay-board'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('essay copy button', () => {
  it('copies only the selected entry body, preserving whitespace and line breaks', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    const text = '  첫 문장  그대로\n\n둘째 문장\t끝  '
    const noop = () => undefined
    render(<EssayBoard
      items={[{ id: '1', tab: 'essays', title: '서울시', details: { entries: JSON.stringify([
        { item: '지원동기', essay: text },
        { item: '성장과정', essay: '다른 본문' },
      ]) } }]}
      onEdit={noop} onDelete={noop} onDeleteEntry={noop} onTogglePin={noop}
    />)

    await user.click(screen.getByRole('button', { name: '지원동기 본문 복사' }))
    expect(writeText).toHaveBeenCalledExactlyOnceWith(text)
    const copiedButton = screen.getByRole('button', { name: '지원동기 본문 복사' })
    expect(copiedButton.textContent).toBe('')
    expect(copiedButton.getAttribute('title')).toBe('복사됨')
    expect(copiedButton.querySelector('.lucide-check')).toBeTruthy()
    const otherButton = screen.getByRole('button', { name: '성장과정 본문 복사' })
    expect(otherButton.textContent).toBe('')
    expect(otherButton.querySelector('.lucide-copy')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '성장과정 본문 복사' }))
    expect(writeText).toHaveBeenLastCalledWith('다른 본문')
  })

  it('supports keyboard copying and resets the success feedback', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<EssayCopyButton text="본문" label="지원동기" />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(writeText).toHaveBeenCalledExactlyOnceWith('본문')
    expect(screen.getByText('복사됨')).toBeTruthy()
    // Start another copy with fake timers to verify the feedback timeout.
    vi.useFakeTimers()
    await act(async () => { fireEvent.click(screen.getByRole('button')) })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByRole('status').textContent).toBe('')
    expect(screen.getByRole('button').querySelector('.lucide-copy')).toBeTruthy()
  })

  it('does not copy the placeholder when an entry has no body', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    render(<EssayCopyButton text="" label="지원동기" />)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await user.click(button)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('reports clipboard failures and allows retrying', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Permission denied'))
      .mockResolvedValueOnce()
    render(<EssayCopyButton text="본문" label="지원동기" />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('alert').textContent).toContain('복사하지 못했어요')
    expect(screen.queryByText('복사됨')).toBeNull()
    await user.click(screen.getByRole('button'))
    expect(writeText).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('복사됨')).toBeTruthy()
  })

  it.each([true, false])('handles HTTP fallback copy result %s and removes the temporary field', async (success) => {
    vi.stubGlobal('navigator', { clipboard: undefined })
    const original = Object.getOwnPropertyDescriptor(document, 'execCommand')
    const text = '첫 문장\n  둘째 문장'
    const execCommand = vi.fn(() => {
      expect((document.activeElement as HTMLTextAreaElement).value).toBe(text)
      return success
    })
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
    try {
      render(<EssayCopyButton text={text} label="지원동기" />)
      const button = screen.getByRole('button')
      button.focus()
      await act(async () => { fireEvent.click(button) })
      expect(execCommand).toHaveBeenCalledExactlyOnceWith('copy')
      expect(document.querySelector('textarea')).toBeNull()
      expect(document.activeElement).toBe(button)
      if (success) expect(screen.getByText('복사됨')).toBeTruthy()
      else expect(screen.getByRole('alert')).toBeTruthy()
    } finally {
      if (original) Object.defineProperty(document, 'execCommand', original)
      else Reflect.deleteProperty(document, 'execCommand')
    }
  })
})
