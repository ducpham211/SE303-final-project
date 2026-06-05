import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import teamService from '../../services/teamService'
import TeamFormModal from './components/TeamFormModal'

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
  const [deleteId, setDeleteId] = useState(null)
  const [error, setError] = useState(null)

  const loadTeams = async () => {
    try {
      const data = await teamService.getMyTeams()
      setTeams(data || [])
    } catch (err) {
      setError('Không thể tải danh sách đội bóng.')
      console.error('TeamPage load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTeams() }, [])

  const handleCreate = async (formData) => {
    await teamService.createTeam({ ...formData, captainId: user?.id || user?.email })
    await loadTeams()
  }

  const handleUpdate = async (formData) => {
    if (!editTarget) return
    await teamService.updateTeam(editTarget.id, { ...formData, captainId: editTarget.captainId })
    setEditTarget(null)
    await loadTeams()
  }

  const handleDelete = async (teamId) => {
    try {
      await teamService.deleteTeam(teamId)
      setTeams((prev) => prev.filter((t) => t.id !== teamId))
    } catch (err) {
      console.error('Delete team error:', err)
    } finally {
      setDeleteId(null)
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

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

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
                      onClick={() => navigate(`/doi-bong/${team.id}`)}
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
                    {deleteId === team.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">Xác nhận?</span>
                        <button onClick={() => handleDelete(team.id)} className="text-xs font-bold text-red-500 hover:text-red-600">Xóa</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(team.id)} className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">Xóa</button>
                    )}
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
      </div>
    </main>
  )
}
