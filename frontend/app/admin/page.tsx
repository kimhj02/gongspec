'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Moon, Sun } from 'lucide-react'
import LoginGate from '@/components/login-gate'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { adminReportsKey, api, getApiError, type CommunityReport } from '@/lib/api'

export default function AdminPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, isLoading, pending, login, error } = useAuth()
  const reports = useSWR(user?.admin ? adminReportsKey : null, () => api.admin.reports(), { revalidateOnFocus: false })

  useEffect(() => {
    if (user?.needsNickname) window.location.replace('/nickname')
  }, [user])

  const toggleHidden = async (item: CommunityReport) => {
    if (item.targetType === 'POST') {
      await (item.hidden ? api.admin.unhidePost(item.targetId) : api.admin.hidePost(item.targetId))
    } else {
      await (item.hidden ? api.admin.unhideComment(item.targetId) : api.admin.hideComment(item.targetId))
    }
    await reports.mutate()
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div>
              <strong>GongSpec</strong>
              <span>관리자</span>
            </div>
          </div>
          <div className="top-actions">
            <a className="auth-action" href="/">
              홈
            </a>
            <button className="icon-button" aria-label="테마 전환" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </div>
      </header>
      <main className="admin-page">
        {isLoading ? (
          <div className="empty-state">
            <div className="loading-spinner" aria-label="확인 중" />
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>관리자 화면을 열지 못했어요</h2>
            <p>{getApiError(error)}</p>
          </div>
        ) : !user ? (
          <LoginGate onLogin={() => void login()} pending={pending} />
        ) : !user.admin ? (
          <div className="empty-state">
            <h2>관리자만 볼 수 있습니다</h2>
            <p>이 화면은 신고된 글과 댓글을 숨기는 용도입니다.</p>
          </div>
        ) : reports.error ? (
          <div className="empty-state">
            <h2>신고 목록을 불러오지 못했어요</h2>
            <p>{getApiError(reports.error)}</p>
            <button className="primary-button" onClick={() => void reports.mutate()}>
              다시 시도
            </button>
          </div>
        ) : reports.isLoading && !reports.data ? (
          <div className="empty-state">
            <div className="loading-spinner" aria-label="불러오는 중" />
          </div>
        ) : reports.data?.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>대상</th>
                  <th>내용</th>
                  <th>사유</th>
                  <th>신고자</th>
                  <th>숨김</th>
                </tr>
              </thead>
              <tbody>
                {reports.data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.targetType === 'POST' ? '글' : '댓글'}</td>
                    <td>
                      <strong>{item.postTitle}</strong>
                      {item.commentBody ? <p>{item.commentBody}</p> : null}
                    </td>
                    <td>{item.reason}</td>
                    <td>{item.reporterNickname || '닉네임 없음'}</td>
                    <td>
                      <button type="button" className="secondary-button" onClick={() => void toggleHidden(item)}>
                        {item.hidden ? '숨김 해제' : '숨기기'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h2>신고가 없습니다</h2>
            <p>스터디 모집글이나 댓글 신고가 오면 여기에 모입니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}
