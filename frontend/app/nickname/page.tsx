'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import LoginGate from '@/components/login-gate'
import { api, getApiError } from '@/lib/api'

export default function NicknamePage() {
  const { theme } = useTheme()
  const { user, isLoading, pending, login, mutate } = useAuth()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && !user.needsNickname) {
      window.location.replace('/')
    }
  }, [user])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const next = await api.users.setNickname(nickname)
      await mutate(next, { revalidate: false })
      window.location.replace('/')
    } catch (caught) {
      setError(getApiError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <main className="auth-callback">
        {isLoading ? (
          <div className="empty-state">
            <div className="loading-spinner" aria-label="확인 중" />
          </div>
        ) : !user ? (
          <LoginGate onLogin={() => void login()} pending={pending} />
        ) : (
          <form className="nickname-card" onSubmit={(event) => void submit(event)}>
            <div className="eyebrow">WELCOME</div>
            <h1>닉네임을 정해 주세요</h1>
            <p>스터디 모집글에 보일 이름입니다. 카카오 이름은 쓰지 않습니다.</p>
            <label>
              닉네임
              <input
                autoFocus
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="한글·영문·숫자 2~16자"
                maxLength={16}
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary-button" disabled={saving || !nickname.trim()}>
              {saving ? '저장 중...' : '시작하기'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
