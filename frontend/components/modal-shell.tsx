'use client'

/** 모달 배경과 접근성 이름을 제공하고 Escape·배경 클릭으로 닫는다. 종료 시 이전 포커스 복원을 시도한다. */
import { useEffect, type ReactNode } from 'react'

export default function ModalShell({
  children,
  onClose,
  labelledBy,
  className = '',
  elevated = false,
}: {
  children: ReactNode
  onClose: () => void
  labelledBy?: string
  className?: string
  elevated?: boolean
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (elevated) event.stopImmediatePropagation()
      else if (document.querySelector('.modal-backdrop.is-elevated')) return
      onClose()
    }
    document.addEventListener('keydown', onKeyDown, elevated)
    const previous = document.activeElement as HTMLElement | null
    return () => {
      document.removeEventListener('keydown', onKeyDown, elevated)
      previous?.focus()
    }
  }, [elevated, onClose])

  return (
    <div className={`modal-backdrop ${elevated ? 'is-elevated' : ''}`.trim()} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal-card ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  )
}
