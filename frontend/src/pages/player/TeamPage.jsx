import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import teamService from '../../services/teamService'
import uploadService from '../../services/uploadService'
import TeamFormModal from './components/TeamFormModal'
import Toast from '../../components/common/Toast'
import ConfirmModal from '../../components/common/ConfirmModal'

const LEVEL_LABELS = {
  BEGINNER: { label: 'Mới chơi', color: '#60D86E', bg: '#F0FDF4' },
  INTERMEDIATE: { label: 'Trung bình', color: '#3b82f6', bg: '#EFF6FF' },
  ADVANCED: { label: 'Phủi cứng', color: '#e23670', bg: '#FFF0F5' },
}

function TeamsTab() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const loadTeams = async () => {
    try {
      const data = await teamService.getMyTeams()
      setTeams(data || [])
    } catch (err) {
      setToast({ msg: 'Không thể tải danh sách đội bóng.', type: 'error' })
      console.error('TeamsTab load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTeams() }, [])

  const handleCreate = async (formData) => {
    try {
      const newTeam = await teamService.createTeam({ ...formData, captainId: user?.id || user?.email })
      if (formData.imageFile) {
        const url = await uploadService.uploadImage(formData.imageFile)
        localStorage.setItem('logo_' + newTeam.id, url)
      }
      setToast({ msg: 'Tạo đội bóng thành công!', type: 'success' })
      await loadTeams()
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Không thể tạo đội bóng.', type: 'error' })
    }
  }

  const handleUpdate = async (formData) => {
    if (!editTarget) return
    try {
      const updatedTeam = await teamService.updateTeam(editTarget.id, { ...formData, captainId: editTarget.captainId })
      if (formData.imageFile) {
        const url = await uploadService.uploadImage(formData.imageFile)
        localStorage.setItem('logo_' + updatedTeam.id, url)
      }
      setToast({ msg: 'Cập nhật thành công!', type: 'success' })
      setEditTarget(null)
      await loadTeams()
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Không thể cập nhật đội bóng.', type: 'error' })
    }
  }

  const handleDelete = async (teamId) => {
    try {
      await teamService.deleteTeam(teamId)
      setTeams((prev) => prev.filter((t) => t.id !== teamId))
      setToast({ msg: 'Đã xóa đội bóng.', type: 'success' })
    } catch (err) {
      console.error('Delete team error:', err)
      setToast({ msg: 'Không thể xóa đội bóng.', type: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Create Button */}
      <button
        onClick={() => { setEditTarget(null); setModalOpen(true) }}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-[#60D86E] hover:text-[#60D86E] hover:bg-[#F0FDF4] transition-all mb-6 flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Tạo đội bóng mới
      </button>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#1a202c] mb-1">Chưa có đội bóng</h3>
          <p className="text-sm text-gray-400">Tạo đội bóng đầu tiên để bắt đầu tìm đối thủ!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => {
            const lvl = LEVEL_LABELS[team.level] || LEVEL_LABELS.BEGINNER
            const logo = localStorage.getItem('logo_' + team.id)
            return (
              <div key={team.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 overflow-hidden bg-[#60D86E]" style={{ backgroundColor: lvl.color }}>
                        {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : (team.name?.[0]?.toUpperCase() || 'T')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#1a202c] truncate">{team.name}</h3>
                        {team.description && <p className="text-xs text-gray-400 truncate">{team.description}</p>}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ml-3" style={{ backgroundColor: lvl.bg, color: lvl.color }}>
                    {lvl.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 ml-[52px]">
                  <button
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="text-xs font-bold text-[#60D86E] hover:text-[#45c45a] transition-colors"
                  >
                    Quản lý →
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => { setEditTarget(team); setModalOpen(true) }}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Sửa
                  </button>
                  <span className="text-gray-200">|</span>
                  <button onClick={() => setDeleteTarget(team)} className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">Xóa</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TeamFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        initialData={editTarget}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa đội bóng"
        message={`Bạn có chắc chắn muốn xóa đội "${deleteTarget?.name}"?`}
        confirmText="Xóa"
        isDestructive={true}
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  )
}

function InvitationsTab() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadInvitations = async () => {
    try {
      const data = await teamService.getMyInvitations()
      setInvitations(data)
    } catch (err) {
      console.error('Invitations load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvitations() }, [])

  const handleRespond = async (invitationId, accept) => {
    try {
      await teamService.respondToInvitation(invitationId, accept)
      setToast({ type: 'success', msg: accept ? 'Đã tham gia đội!' : 'Đã từ chối lời mời.' })
      await loadInvitations()
    } catch (err) {
      console.error('Respond invitation error:', err)
      setToast({ type: 'error', msg: 'Có lỗi xảy ra.' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div>
      {invitations.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Bạn không có lời mời vào đội nào.</div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const logo = localStorage.getItem('logo_' + inv.teamId)
            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 overflow-hidden bg-[#60D86E]">
                    {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : (inv.teamName?.[0]?.toUpperCase() || 'T')}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a202c] text-sm truncate">{inv.teamName}</h3>
                    <p className="text-xs text-gray-400">{inv.captainName || 'Đội trưởng'} đã mời bạn</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleRespond(inv.id, false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Từ chối
                  </button>
                  <button 
                    onClick={() => handleRespond(inv.id, true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#60D86E] hover:bg-[#45c45a] transition-colors"
                  >
                    Chấp nhận
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  )
}

export default function TeamPage() {
  const [tab, setTab] = useState('teams')

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Cộng đồng</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Quản lý Đội bóng</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý đội bóng của bạn và phản hồi các lời mời.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto no-scrollbar">
          <button onClick={() => setTab('teams')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'teams' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Đội bóng của tôi
          </button>
          <button onClick={() => setTab('invitations')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'invitations' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Lời mời vào đội
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {tab === 'teams' && <TeamsTab />}
          {tab === 'invitations' && <InvitationsTab />}
        </div>
      </div>
    </main>
  )
}
