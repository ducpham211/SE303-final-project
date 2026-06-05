import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import adminService from '../../services/adminService'
import useAuthStore from '../../store/useAuthStore'

function fmtCurrency(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `${(num / 1_000).toFixed(0)}K`
  return String(num)
}

function fmtFullCurrency(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)
}

function StatCard({ label, value, sub, icon, color, bg, to }) {
  const inner = (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
           style={{ backgroundColor: bg, color }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl font-black mt-0.5" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function MetricPanel({ title, kicker, value, sub, icon, color, bg, to, children }) {
  const inner = (
    <section className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{kicker}</p>
            <h2 className="text-lg font-extrabold text-[#1a202c] mt-1">{title}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-3xl sm:text-4xl font-black tracking-normal leading-tight" style={{ color }}>
            {value}
          </p>
          {sub && <p className="text-sm text-gray-500 mt-2">{sub}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          {children}
        </div>
      </div>
    </section>
  )

  return to ? <Link to={to} className="block h-full">{inner}</Link> : inner
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-xl font-black text-[#1a202c] mt-1">{value}</p>
    </div>
  )
}

function QuickAction({ to, label, icon, color, bg }) {
  return (
    <Link to={to}
      className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-gray-100
                 rounded-2xl hover:shadow-md transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
           style={{ backgroundColor: bg, color }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
      </div>
      <span className="text-xs font-bold text-gray-600 text-center leading-tight">{label}</span>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [overview,      setOverview]      = useState(null)
  const [transactions,  setTransactions]  = useState(null)
  const [loading,       setLoading]       = useState(true)

  const { user } = useAuthStore()
  const role = user?.role?.replace('ROLE_', '') || 'ADMIN'

  // Helper to switch role for testing purposes
  const switchRole = (newRole) => {
    const mockUser = {
      ...user,
      name: user?.name || 'Tester',
      role: `ROLE_${newRole}`
    }
    useAuthStore.setState({ user: mockUser, isLoggedIn: true })
  }

  useEffect(() => {
    Promise.all([
      adminService.getOverview(),
      adminService.getTransactions(),
    ])
      .then(([ov, tx]) => { setOverview(ov); setTransactions(tx) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const Skeleton = () => <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Hệ thống quản trị</span>
          <h1 className="text-3xl font-extrabold text-[#1a202c] mt-1">Tổng quan hệ thống</h1>
          <p className="text-gray-500 mt-1 text-sm">Giám sát toàn bộ hoạt động đặt sân, ghép kèo và uy tín người dùng.</p>
        </div>

        {/* Revenue and overview cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1.85fr] gap-4 items-stretch">
          <MetricPanel
            title="Doanh thu giao dịch"
            kicker="Transactions"
            value={loading ? <Skeleton /> : fmtFullCurrency(transactions?.totalSystemRevenue)}
            color="#16a34a" bg="#F0FDF4"
            to="/admin/bookings"
            icon={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}
          >
            <MiniMetric label="Booking thành công" value={loading ? '—' : transactions?.totalSuccessfulBookings ?? '—'} />
          </MetricPanel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Tổng người dùng"
              value={loading ? <Skeleton /> : overview?.totalUsers ?? '—'}
              sub="tài khoản đã đăng ký"
              color="#e23670" bg="#FFF0F5"
              to="/admin/users"
              icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
            />
            <StatCard
              label="Tổng sân bóng"
              value={loading ? <Skeleton /> : overview?.totalFields ?? '—'}
              sub="đang vận hành"
              color="#3b82f6" bg="#EFF6FF"
              to="/admin/fields"
              icon={<><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>}
            />
            <StatCard
              label="Trận đã ghép"
              value={loading ? <Skeleton /> : overview?.totalSuccessfulMatches ?? '—'}
              sub="kèo thành công"
              color="#8b5cf6" bg="#F5F3FF"
              to="/admin/matches"
              icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>}
            />
            <StatCard
              label="Kiểm duyệt vi phạm"
              value="Xem ngay →"
              sub="đánh giá chờ xử lý"
              color="#ef4444" bg="#FEF2F2"
              to="/admin/matches"
              icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
            />
          </div>
        </div>
      </section>

      {/* DEV ROLE SWITCHER - Temporary for UI testing */}
      <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-2 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Dev Mode: Switch View</span>
        <div className="flex gap-2">
          <button 
            onClick={() => switchRole('PLAYER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role !== 'ADMIN' && role !== 'OWNER' ? 'bg-[#60D86E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Player
          </button>
          <button 
            onClick={() => switchRole('OWNER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === 'OWNER' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Owner
          </button>
          <button 
            onClick={() => switchRole('ADMIN')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === 'ADMIN' ? 'bg-[#e23670] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </main>
  )
}
