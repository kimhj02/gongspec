'use client'

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
