'use client'

/** 현재 사용자 조회와 로그인·로그아웃 상태를 관리한다. 401은 로그인하지 않은 상태로 취급한다. */
import { useState } from 'react'
import useSWR from 'swr'
import { api, isUnauthorized, meKey, type AuthUser } from '@/lib/api'

export function useAuth() {
  const [pending, setPending] = useState(false)
  const { data, error, isLoading, mutate } = useSWR(meKey, () => api.auth.me(), {
    revalidateOnFocus: false,
    shouldRetryOnError: (requestError) => !isUnauthorized(requestError),
  })
  const unauthorized = isUnauthorized(error)
  const user = unauthorized ? null : (data ?? null)

  const login = async () => {
    setPending(true)
    try {
      const { url } = await api.auth.kakaoUrl()
      window.location.assign(url)
    } catch (requestError) {
      setPending(false)
      throw requestError
    }
  }

  const logout = async () => {
    setPending(true)
    try {
      await api.auth.logout()
      await mutate(undefined, { revalidate: false })
    } finally {
      setPending(false)
    }
  }

  return {
    user,
    isLoading,
    isLoggedIn: Boolean(user),
    pending,
    error: unauthorized ? undefined : error,
    login,
    logout,
    mutate,
  }
}

export type { AuthUser }
