import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import teamService from '../../services/teamService'
import useAuthStore from '../../store/useAuthStore'
import Toast from '../../components/common/Toast'
import ConfirmModal from '../../components/common/ConfirmModal'

const LEVEL_LABELS = {
  BEGINNER: { label: 'Mới chơi', color: '#60D86E', bg: '#F0FDF4' },
  INTERMEDIATE: { label: 'Trung bình', color: '#3b82f6', bg: '#EFF6FF' },
  ADVANCED: { label: 'Phủi cứng', color: '#e23670', bg: '#FFF0F5' },
}

export default function TeamDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('members')
  const [toast, setToast] = useState(null)
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadTeamAndMembers = async () => {
    try {
      const teams = await teamService.getMyTeams()
      const found = teams?.find((t) => t.id === id)
      setTeam(found || null)
      
      if (found) {
        const mems = await teamService.getTeamMembers(id)
        setMembers(mems || [])
      }
    } catch (err) {
      console.error('TeamDetailPage load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeamAndMembers()
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
  const logo = localStorage.getItem('logo_' + team.id)
  const isCaptain = user && (user.id === team.captainId || user.email === team.captainId)

  const activeMembers = members.filter(m => m.status === 'ACCEPTED')
  const pendingMembers = members.filter(m => m.status === 'PENDING')

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await teamService.inviteMember(team.id, inviteEmail.trim())
      setToast({ type: 'success', msg: 'Đã gửi lời mời thành công!' })
      setInviteEmail('')
      setInviteModalOpen(false)
      loadTeamAndMembers()
    } catch (err) {
      console.error('Invite member error:', err)
      setToast({ type: 'error', msg: err?.response?.data?.message || 'Không thể mời thành viên này.' })
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!deleteTarget) return
    try {
      await teamService.removeMember(team.id, deleteTarget.userId || deleteTarget.id)
      setToast({ type: 'success', msg: 'Đã xóa thành viên khỏi đội.' })
      loadTeamAndMembers()
    } catch (err) {
      console.error('Kick member error:', err)
      setToast({ type: 'error', msg: 'Không thể xóa thành viên này.' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleRevokeInvite = async (memberId) => {
    try {
      await teamService.removeMember(team.id, memberId)
      setToast({ type: 'success', msg: 'Đã hủy lời mời.' })
      loadTeamAndMembers()
    } catch (err) {
      console.error('Revoke invite error:', err)
      setToast({ type: 'error', msg: 'Có lỗi xảy ra khi hủy lời mời.' })
    }
  }

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[#60D86E] transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Hồ sơ của tôi
        </Link>

        {/* Team Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 overflow-hidden" style={{ backgroundColor: lvl.color }}>
              {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : (team.name?.[0]?.toUpperCase() || 'T')}
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
              {isCaptain && (
                <div className="flex items-center gap-1.5 mt-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="text-xs text-[#60D86E] font-bold">Bạn là Đội trưởng</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('members')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'members' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Thành viên ({activeMembers.length})
          </button>
          <button
            onClick={() => setTab('invitations')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'invitations' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Đã gửi lời mời ({pendingMembers.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {tab === 'members' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1a202c]">Danh sách thành viên</h3>
                {isCaptain && (
                  <button onClick={() => setInviteModalOpen(true)} className="px-3 py-1.5 bg-[#60D86E] text-white text-xs font-bold rounded-lg hover:bg-[#45c45a]">
                    + Mời thành viên
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {activeMembers.length > 0 ? activeMembers.map(m => {
                  const avatar = localStorage.getItem('avatar_' + m.userId);
                  const isUserCaptain = m.userId === team.captainId;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex flex-shrink-0 items-center justify-center font-bold text-gray-500 overflow-hidden">
                          {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : m.userName?.[0]?.toUpperCase() || m.userEmail?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a202c]">{m.userName || m.userEmail || 'Thành viên'}</p>
                          {isUserCaptain && <span className="text-[10px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded font-bold uppercase">Đội trưởng</span>}
                        </div>
                      </div>
                      {isCaptain && !isUserCaptain && (
                        <button onClick={() => setDeleteTarget(m)} className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 bg-red-50 rounded-lg">
                          Xóa
                        </button>
                      )}
                    </div>
                  )
                }) : (
                  <p className="text-sm text-gray-500 text-center py-6">Đội chưa có thành viên nào khác.</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-[#1a202c] mb-4">Lời mời đang chờ phản hồi</h3>
              <div className="space-y-3">
                {pendingMembers.length > 0 ? pendingMembers.map(m => {
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex flex-shrink-0 items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a202c]">{m.userEmail || 'Đang tải...'}</p>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Đã gửi</span>
                        </div>
                      </div>
                      {isCaptain && (
                        <button onClick={() => handleRevokeInvite(m.userId || m.id)} className="text-xs font-bold text-gray-500 hover:text-gray-700">
                          Hủy lời mời
                        </button>
                      )}
                    </div>
                  )
                }) : (
                  <p className="text-sm text-gray-500 text-center py-6">Không có lời mời nào đang chờ.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
            <form onSubmit={handleInvite} className="p-6">
              <h3 className="text-lg font-extrabold text-[#1a202c] mb-2">Mời thành viên mới</h3>
              <p className="text-xs text-gray-500 mb-4">Nhập email của người bạn muốn mời vào đội.</p>
              
              <input 
                type="email" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] mb-4"
              />
              
              <div className="flex gap-2">
                <button type="button" onClick={() => setInviteModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100">
                  Hủy
                </button>
                <button type="submit" disabled={inviting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#60D86E] disabled:opacity-50">
                  {inviting ? 'Đang gửi...' : 'Gửi lời mời'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa thành viên"
        message={`Bạn có chắc chắn muốn xóa thành viên này khỏi đội?`}
        confirmText="Xóa"
        isDestructive={true}
        onConfirm={handleRemoveMember}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  )
}
