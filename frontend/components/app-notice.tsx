'use client'

import { X } from 'lucide-react'

export type Notice = { type: 'error' | 'success'; message: string }

export default function AppNotice({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return (
    <div className={`app-notice ${notice.type}`} role="status">
      <span>{notice.message}</span>
      <button onClick={onClose} aria-label="알림 닫기">
        <X size={14} />
      </button>
    </div>
  )
}
