'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

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

  useEffect(() => {
    setStatus('idle')
  }, [text])

  useEffect(() => {
    if (status !== 'copied') return
    const timeout = window.setTimeout(() => setStatus('idle'), 2000)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function copy() {
    setStatus('copying')
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
      else copyWithoutClipboardApi(text)
      setStatus('copied')
    } catch {
      setStatus('error')
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
