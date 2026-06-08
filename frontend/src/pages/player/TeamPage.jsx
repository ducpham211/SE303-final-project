import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import teamService from '../../services/teamService'
import TeamFormModal from './components/TeamFormModal'
import Toast from '../../components/common/Toast'
import ConfirmModal from '../../components/common/ConfirmModal'

const LEVEL_LABELS = {
  BEGINNER: { label: 'Mới chơi', color: '#60D86E', bg: '#F0FDF4' },
  INTERMEDIATE: { label: 'Trung bình', color: '#3b82f6', bg: '#EFF6FF' },
  ADVANCED: { label: 'Phủi cứng', color: '#e23670', bg: '#FFF0F5' },
}

/**
 * Team list page — /doi-bong
 * Displays all teams the player captains, with create/edit/delete actions.
 */
export default function TeamPage() {
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
      console.error('TeamPage load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTeams() }, [])

  const handleCreate = async (formData) => {
    try {
      await teamService.createTeam({ ...formData, captainId: user?.id || user?.email })
      setToast({ msg: 'Tạo đội bóng thành công!', type: 'success' })
      await loadTeams()
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Không thể tạo đội bóng.', type: 'error' })
    }
  }

  const handleUpdate = async (formData) => {
    if (!editTarget) return
    try {
      await teamService.updateTeam(editTarget.id, { ...formData, captainId: editTarget.captainId })
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
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Quản lý</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Đội bóng của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các đội bóng để tham gia ghép kèo.</p>
        </div>

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
          /* Empty state */
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
          /* Team List */
          <div className="space-y-4">
            {teams.map((team) => {
              const lvl = LEVEL_LABELS[team.level] || LEVEL_LABELS.BEGINNER
              return (
                <div key={team.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ backgroundColor: lvl.color }}>
                          {team.name?.[0]?.toUpperCase() || 'T'}
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
    </main>
  )
}
