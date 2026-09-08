'use client'

import { X } from 'lucide-react'
import ModalShell from '@/components/modal-shell'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = '삭제',
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <ModalShell elevated onClose={onClose} labelledBy="confirm-title" className="small-modal">
      <div className="modal-header">
        <div className="page-intro-copy">
          <div className="eyebrow">CONFIRM</div>
          <h2 id="confirm-title">{title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>
      </div>
      <p className="confirm-copy">{message}</p>
      <div className="modal-footer">
        <button type="button" className="secondary-button" onClick={onClose}>
          취소
        </button>
        <button type="button" className="primary-button danger-button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  )
}
