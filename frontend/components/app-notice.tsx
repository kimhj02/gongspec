'use client'

/** 저장 성공·실패 등의 안내 메시지와 닫기 버튼을 표시한다. */
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
