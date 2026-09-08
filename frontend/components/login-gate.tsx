'use client'

type LoginGateProps = {
  onLogin: () => void
  pending?: boolean
}

export default function LoginGate({ onLogin, pending = false }: LoginGateProps) {
  return (
    <div className="empty-state login-gate">
      <div className="empty-icon">G</div>
      <h2>로그인하고 스펙을 정리하세요</h2>
      <p>카카오 계정으로 시작하면 일정과 자료를 이 브라우저에 묶어둡니다.</p>
      <button className="kakao-button" onClick={onLogin} disabled={pending}>
        {pending ? '이동 중...' : '카카오로 시작하기'}
      </button>
    </div>
  )
}
