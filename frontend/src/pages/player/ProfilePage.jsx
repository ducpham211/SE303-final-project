import { useState, useEffect } from 'react'
import useAuthStore from '../../store/useAuthStore'
import userService from '../../services/userService'
import teamService from '../../services/teamService'
import TeamFormModal from './components/TeamFormModal'

const LEVEL_LABELS = {
  BEGINNER: { label: 'Mới chơi', color: '#60D86E', bg: '#F0FDF4' },
  INTERMEDIATE: { label: 'Trung bình', color: '#3b82f6', bg: '#EFF6FF' },
  ADVANCED: { label: 'Phủi cứng', color: '#e23670', bg: '#FFF0F5' },
}

/* ── Profile Tab Content ── */
function ProfileTab() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userService.getMe()
        setProfile(data)
        setFullName(data.fullName || '')
        setPhone(data.phone || '')
      } catch (err) { console.error('ProfileTab load error:', err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) { setMessage({ type: 'error', text: 'Vui lòng nhập họ và tên.' }); return }
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const updated = await userService.updateUser(profile.id, { fullName: fullName.trim(), phone: phone.trim() })
      setProfile(updated)
      // Sync auth store name
      useAuthStore.setState((s) => ({ user: { ...s.user, name: updated.fullName || s.user?.name } }))
      setMessage({ type: 'success', text: 'Cập nhật thành công!' })
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Có lỗi xảy ra.' })
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4 pb-2">
        <div className="w-16 h-16 rounded-full bg-[#60D86E] flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {(profile?.fullName || user?.name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-[#1a202c]">{profile?.fullName || user?.name}</p>
          <p className="text-xs text-gray-400">{profile?.role || user?.role?.replace('ROLE_', '')}</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
        <input type="email" value={profile?.email || ''} disabled
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed" />
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Họ và tên</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={saving}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all" />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Số điện thoại</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901 234 567" disabled={saving}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all" />
      </div>

      {/* Message */}
      {message.text && (
        <p className={`text-xs font-medium ${message.type === 'success' ? 'text-[#60D86E]' : 'text-red-500'}`}>{message.text}</p>
      )}

      <button type="submit" disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#60D86E] hover:bg-[#45c45a] disabled:opacity-50 transition-colors">
        {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
      </button>
    </form>
  )
}

/* ── Teams Tab Content ── */
function TeamsTab() {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const loadTeams = async () => {
    try {
      const data = await teamService.getMyTeams()
      setTeams(data)
    } catch (err) { console.error('TeamsTab load error:', err) }
    finally { setLoading(false) }
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
    } catch (err) { console.error('Delete team error:', err) }
    finally { setDeleteId(null) }
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
      {/* Create Button */}
      <button onClick={() => { setEditTarget(null); setModalOpen(true) }}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-[#60D86E] hover:text-[#60D86E] hover:bg-[#F0FDF4] transition-all mb-4 flex items-center justify-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Tạo đội bóng mới
      </button>

      {/* Team List */}
      {teams.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Bạn chưa có đội bóng nào. Hãy tạo đội đầu tiên!</div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => {
            const lvl = LEVEL_LABELS[team.level] || LEVEL_LABELS.BEGINNER
            return (
              <div key={team.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ backgroundColor: lvl.color }}>
                        {team.name?.[0]?.toUpperCase() || 'T'}
                      </div>
                      <h3 className="font-bold text-[#1a202c] text-sm truncate">{team.name}</h3>
                    </div>
                    {team.description && <p className="text-xs text-gray-400 ml-10 truncate">{team.description}</p>}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: lvl.bg, color: lvl.color }}>
                    {lvl.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-10">
                  <button onClick={() => { setEditTarget(team); setModalOpen(true) }}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">Sửa</button>
                  <span className="text-gray-300">·</span>
                  {deleteId === team.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-500">Xác nhận xóa?</span>
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
  )
}

/* ── Main Profile Page ── */
export default function ProfilePage() {
  const [tab, setTab] = useState('profile')

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Tài khoản</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Hồ sơ của tôi</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
          <button onClick={() => setTab('profile')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'profile' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Hồ sơ cá nhân
          </button>
          <button onClick={() => setTab('teams')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'teams' ? 'bg-white text-[#1a202c] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Đội bóng của tôi
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {tab === 'profile' ? <ProfileTab /> : <TeamsTab />}
        </div>
      </div>
    </main>
  )
}
