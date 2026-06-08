import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import teamService from '../../services/teamService'

const LEVEL_LABELS = {
  BEGINNER: { label: 'Mới chơi', color: '#60D86E', bg: '#F0FDF4' },
  INTERMEDIATE: { label: 'Trung bình', color: '#3b82f6', bg: '#EFF6FF' },
  ADVANCED: { label: 'Phủi cứng', color: '#e23670', bg: '#FFF0F5' },
}

/**
 * Team detail page — /doi-bong/:id
 * Shows team info + tabs for Members (placeholder) and Invitations (placeholder).
 */
export default function TeamDetailPage() {
  const { id } = useParams()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('members')

  useEffect(() => {
    const load = async () => {
      try {
        const teams = await teamService.getMyTeams()
        const found = teams?.find((t) => t.id === id)
        setTeam(found || null)
      } catch (err) {
        console.error('TeamDetailPage load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-100 rounded-lg" />
            <div className="h-32 bg-white rounded-2xl border border-gray-100" />
            <div className="h-48 bg-white rounded-2xl border border-gray-100" />
          </div>
        </div>
      </main>
    )
  }

  if (!team) {
    return (
      <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
          <h2 className="text-xl font-bold text-[#1a202c] mb-2">Không tìm thấy đội bóng</h2>
          <p className="text-sm text-gray-400 mb-6">Đội bóng này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Link to="/teams" className="text-sm font-bold text-[#60D86E] hover:underline">
            ← Quay lại danh sách đội
          </Link>
        </div>
      </main>
    )
  }

  const lvl = LEVEL_LABELS[team.level] || LEVEL_LABELS.BEGINNER

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link to="/teams" className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[#60D86E] transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Đội bóng
        </Link>

        {/* Team Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0" style={{ backgroundColor: lvl.color }}>
              {team.name?.[0]?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#1a202c]">{team.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: lvl.bg, color: lvl.color }}>
                  {lvl.label}
                </span>
              </div>
              {team.description && (
                <p className="text-sm text-gray-500 mt-1">{team.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-xs text-gray-400">Đội trưởng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('members')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'members' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Thành viên
          </button>
          <button
            onClick={() => setTab('invitations')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'invitations' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Lời mời đang chờ
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {tab === 'members' ? (
            /* Members Tab — placeholder */
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1a202c] mb-1">Quản lý thành viên</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">
                Tính năng quản lý thành viên đang được phát triển. Bạn sẽ có thể mời và quản lý người chơi trong đội sớm.
              </p>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Mời thành viên (sắp có)
              </button>
            </div>
          ) : (
            /* Invitations Tab — placeholder */
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,4 12,13 2,4" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1a202c] mb-1">Lời mời đang chờ</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Tính năng gửi và nhận lời mời đang được phát triển. Bạn sẽ có thể mời người chơi và phản hồi lời mời sớm.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
