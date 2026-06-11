import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import userService from '../../services/userService'
import authService from '../../services/authService'
import fairplayService from '../../services/fairplayService'
import uploadService from '../../services/uploadService'
import Toast from '../../components/common/Toast'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  const [savingPassword, setSavingPassword] = useState(false)
  const [toast, setToast] = useState(null)

  const [submittedReportsCount, setSubmittedReportsCount] = useState(0)
  const [avatar, setAvatar] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userService.getMe()
        setProfile(data)
        setFullName(data.fullName || '')
        setPhone(data.phone || '')
        setAvatar(localStorage.getItem('avatar_' + data.id))
        
        try {
          const myReports = await fairplayService.getMySubmitted()
          setSubmittedReportsCount(myReports?.length || 0)
        } catch (e) {
          console.warn('Fairplay fetch error', e)
        }
      } catch (err) { console.error('Profile load error:', err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) { setMessage({ type: 'error', text: 'Vui lòng nhập họ và tên.' }); return }
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const updated = await userService.updateUser(profile.id, { fullName: fullName.trim(), phone: phone.trim() })
      setProfile(updated)
      // Sync auth store name
      useAuthStore.setState((s) => ({ user: { ...s.user, name: updated.fullName || s.user?.name } }))
      setToast({ type: 'success', msg: 'Cập nhật thành công!' })
    } catch (err) {
      console.error('Save profile error:', err)
      setToast({ type: 'error', msg: err?.response?.data?.message || 'Có lỗi xảy ra.' })
    } finally { setSaving(false) }
  }

  const handleRequestPasswordChange = async () => {
    setSavingPassword(true)
    try {
      await authService.forgotPassword(profile.email)
      setToast({ type: 'success', msg: 'Đã gửi mã OTP đến email của bạn. Đang chuyển hướng...' })
      setTimeout(() => {
        navigate('/reset-password', { state: { email: profile.email } })
      }, 1500)
    } catch (err) {
      console.error('Request password change error:', err)
      setToast({ type: 'error', msg: 'Không thể gửi OTP. Vui lòng thử lại.' })
      setSavingPassword(false)
    }
  }

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setToast({ type: 'info', msg: 'Đang tải ảnh...' })
        const url = await uploadService.uploadImage(e.target.files[0])
        localStorage.setItem('avatar_' + profile.id, url)
        setAvatar(url)
        setToast({ type: 'success', msg: 'Cập nhật ảnh đại diện thành công!' })
      } catch (err) {
        console.error('Avatar upload error:', err)
        setToast({ type: 'error', msg: 'Tải ảnh thất bại.' })
      }
    }
  }

  const getReputationStatus = (score) => {
    if (score == null) return { label: 'Chưa có đánh giá', color: '#9ca3af' }
    if (score >= 90) return { label: 'Xuất sắc', color: '#60D86E' }
    if (score >= 70) return { label: 'Tốt', color: '#3b82f6' }
    if (score >= 50) return { label: 'Trung bình', color: '#eab308' }
    return { label: 'Kém', color: '#ef4444' }
  }

  if (loading) {
    return (
      <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </main>
    )
  }

  const rep = getReputationStatus(profile?.trustScore)

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Tài khoản</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Hồ sơ của tôi</h1>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-8">
          {/* ── Thông tin cá nhân ── */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-lg font-bold text-[#1a202c] mb-4">Thông tin cá nhân</h3>
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-2">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full bg-[#60D86E] flex items-center justify-center text-white text-3xl font-black flex-shrink-0 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.fullName || user?.name || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
              <div>
                <p className="font-bold text-[#1a202c] text-lg">{profile?.fullName || user?.name}</p>
                <p className="text-xs text-gray-400 mb-1">{profile?.role || user?.role?.replace('ROLE_', '')}</p>
                <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block cursor-pointer hover:bg-gray-200" onClick={() => fileInputRef.current?.click()}>
                  Tải ảnh lên
                </p>
              </div>
            </div>

            {/* Reputation Info */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Điểm uy tín (Fairplay)</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#1a202c]">{profile?.trustScore != null ? profile.trustScore : '--'}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: `${rep.color}15`, color: rep.color }}>
                    {rep.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Đã báo cáo</p>
                <p className="text-lg font-bold text-[#1a202c]">{submittedReportsCount} trận</p>
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

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* ── Đổi mật khẩu ── */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-[#1a202c] mb-1">Đổi mật khẩu</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vì lý do bảo mật, việc thay đổi mật khẩu yêu cầu xác thực qua Email. Vui lòng nhấn nút bên dưới để nhận mã OTP và tiến hành đổi mật khẩu mới.
            </p>

            <button type="button" onClick={handleRequestPasswordChange} disabled={savingPassword}
              className="w-full py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors">
              {savingPassword ? 'Đang gửi mã OTP...' : 'Nhận OTP để đổi mật khẩu'}
            </button>
          </div>
          <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
        </div>
      </div>
    </main>
  )
}
