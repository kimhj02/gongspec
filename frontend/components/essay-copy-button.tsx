'use client'

/** 본문만 클립보드에 복사하며 진행·성공·실패 상태를 표시하고 오래된 비동기 결과는 무시한다. */
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

// Clipboard API가 없는 환경에서는 임시 textarea를 사용한 뒤 사용자의 포커스와 선택 범위를 복원한다.
function copyWithoutClipboardApi(text: string) {
  const focused = document.activeElement
  const selection = window.getSelection()
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)) : []
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;'
  document.body.appendChild(textarea)
  try {
    textarea.focus({ preventScroll: true })
    textarea.select()
    if (!document.execCommand('copy')) throw new Error('Copy failed')
  } finally {
    textarea.remove()
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
    selection?.removeAllRanges()
    ranges.forEach((range) => selection?.addRange(range))
  }
}

export default function EssayCopyButton({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  // 본문 변경·언마운트 이전에 시작한 복사가 늦게 끝나더라도 현재 버튼 상태를 덮어쓰지 않게 한다.
  const requestId = useRef(0)

  useEffect(() => {
    setStatus('idle')
    return () => { requestId.current += 1 }
  }, [text])

  useEffect(() => {
    if (status !== 'copied') return
    const timeout = window.setTimeout(() => setStatus('idle'), 2000)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function copy() {
    const currentRequestId = ++requestId.current
    setStatus('copying')
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
      else copyWithoutClipboardApi(text)
      if (currentRequestId === requestId.current) setStatus('copied')
    } catch {
      if (currentRequestId === requestId.current) setStatus('error')
    }
  }

  return (
    <div className="essay-copy-control">
      <button
        type="button"
        className={`essay-copy-button ${status === 'copied' ? 'is-copied' : ''}`}
        onClick={copy}
        disabled={!text || status === 'copying'}
        aria-label={`${label} 본문 복사`}
        title={status === 'copied' ? '복사됨' : '본문만 복사'}
      >
        {status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      </button>
      <span className="essay-copy-status" role="status">{status === 'copied' ? '복사됨' : ''}</span>
      {status === 'error' && <span className="essay-copy-error" role="alert">복사하지 못했어요. 다시 시도해 주세요.</span>}
    </div>
  )
}
