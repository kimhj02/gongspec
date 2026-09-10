'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/hooks/use-theme'
import { api, getApiError } from '@/lib/api'

const EXCHANGE_LOCK = 'gongspec:kakao-oauth'

export default function KakaoCallbackPage() {
  const { theme } = useTheme()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const kakaoError = params.get('error')
    const code = params.get('code')
    const state = params.get('state')

    if (kakaoError || !code || !state) {
      setError('카카오 로그인이 취소되었거나 인증 정보가 없습니다.')
      return
    }

    const lockKey = `${EXCHANGE_LOCK}:${code}:${state}`
    if (sessionStorage.getItem(lockKey)) {
      return
    }
    sessionStorage.setItem(lockKey, '1')

    api.auth
      .callback({ code, state })
      .then((user) => {
        window.location.replace(user.needsNickname ? '/nickname' : '/')
      })
      .catch((requestError) => {
        sessionStorage.removeItem(lockKey)
        setError(getApiError(requestError))
      })
  }, [])

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <main className="auth-callback">
        {error ? (
          <div className="empty-state">
            <h2>로그인에 실패했습니다</h2>
            <p>{error}</p>
            <Link className="primary-button" href="/">
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="empty-state">
            <div className="loading-spinner" aria-label="로그인 처리 중" />
            <p>카카오 로그인 확인 중입니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}
