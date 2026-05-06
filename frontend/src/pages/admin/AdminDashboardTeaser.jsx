import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import bookingService from '../../services/bookingService'
import fieldService from '../../services/fieldService'
import matchService from '../../services/matchService'

const STATUS_META = {
  PENDING:   { label: 'Chờ cọc',    bg: 'bg-amber-100',  text: 'text-amber-700'  },
  PAID:      { label: 'Đã cọc',     bg: 'bg-green-100',  text: 'text-green-700'  },
  COMPLETED: { label: 'Hoàn thành', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  CANCELLED: { label: 'Đã hủy',     bg: 'bg-red-100',    text: 'text-red-600'    },
}

function KpiCard({ label, value, delta, deltaUp, color, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      {loading
        ? <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse mt-1" />
        : <span className="text-3xl font-black" style={{ color }}>{value}</span>
      }
      <span className={`text-xs font-medium ${deltaUp === true ? 'text-green-500' : deltaUp === false ? 'text-red-500' : 'text-gray-400'}`}>
        {deltaUp === true ? '↑ ' : deltaUp === false ? '↓ ' : ''}{delta}
      </span>
    </div>
  )
}

export default function AdminDashboardTeaser() {
  const { user } = useAuthStore()
  const [bookings, setBookings]   = useState([])
  const [fields, setFields]       = useState([])
  const [matchPosts, setMatchPosts] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [bData, fData, mData] = await Promise.all([
          bookingService.getMyBookings(),
          fieldService.getFields(),
          matchService.getMatchPosts(),
        ])
        setBookings(bData)
        setFields(fData)
        setMatchPosts(mData)
      } catch (err) {
        console.error('AdminDashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Tính KPI từ data thật
  const totalRevenue = bookings
    .filter(b => b.status === 'PAID' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.depositAmount) || 0), 0)
  const revenueDisplay = totalRevenue >= 1_000_000
    ? `${(totalRevenue / 1_000_000).toFixed(1)}M`
    : totalRevenue >= 1_000 ? `${(totalRevenue / 1_000).toFixed(0)}K` : `${totalRevenue}`

  // Kèo xịn = match_post có booking_id kèm theo
  const verifiedMatches = matchPosts.filter(m => m.bookingId).length

  // 5 booking gần nhất
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0))
    .slice(0, 5)

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Greeting */}
      <div>
        <span className="text-[#e23670] text-sm font-bold uppercase tracking-widest">Hệ thống quản trị trung tâm</span>
        <h1 className="text-3xl font-extrabold text-[#1a202c] mt-1">
          Xin chào, <span className="text-[#e23670]">{user?.name || 'Admin'}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Giám sát toàn bộ hoạt động đặt sân, ghép kèo và uy tín người dùng.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Tổng đơn" value={bookings.length} delta="tất cả trạng thái" deltaUp={null} color="#60D86E" loading={loading} />
        <KpiCard label="Doanh thu (cọc)" value={revenueDisplay} delta="tổng đã thu" deltaUp={null} color="#3b82f6" loading={loading} />
        <KpiCard label="Kèo xác nhận" value={verifiedMatches} delta="có booking kèm" deltaUp={null} color="#8b5cf6" loading={loading} />
        <KpiCard label="Tổng sân" value={fields.length} delta="đang vận hành" deltaUp={null} color="#1a202c" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Recent bookings — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg text-[#1a202c]">Giao dịch gần đây</h2>
            <Link to="/admin/bookings" className="text-sm font-bold text-[#e23670] hover:underline">Xem tất cả →</Link>
          </div>
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse mb-2" />)
            : recentBookings.length === 0
              ? <p className="text-gray-400 text-sm text-center py-8">Chưa có giao dịch nào.</p>
              : recentBookings.map(b => {
                  const s = STATUS_META[b.status] || STATUS_META.PENDING
                  const fieldName = b.field?.name || b.fieldName || 'Sân bóng'
                  const slotTime  = b.timeSlot ? `${b.timeSlot.startTime}–${b.timeSlot.endTime}` : '—'
                  const deposit   = b.depositAmount ? `${Number(b.depositAmount).toLocaleString('vi-VN')}đ` : '—'
                  return (
                    <div key={b.id} className="flex justify-between items-center py-3.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-semibold text-[#1a202c] text-sm">{fieldName}</p>
                        <p className="text-xs text-gray-400">{b.bookingDate || '—'} · {slotTime}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-[#1a202c] hidden sm:block">{deposit}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                      </div>
                    </div>
                  )
                })
          }
        </div>

        {/* Match posts summary — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg text-[#1a202c]">Kèo ghép ({matchPosts.length})</h2>
            <Link to="/admin/matches" className="text-sm font-bold text-[#8b5cf6] hover:underline">Quản lý →</Link>
          </div>
          {loading
            ? [1,2,3].map(i => <div key={i} className="h-16 bg-purple-50 rounded-2xl animate-pulse mb-3" />)
            : matchPosts.length === 0
              ? <p className="text-gray-400 text-sm text-center py-8">Chưa có bài đăng kèo nào.</p>
              : matchPosts.slice(0, 4).map(m => (
                  <div key={m.id} className={`rounded-2xl p-4 border mb-3 ${m.bookingId ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#1a202c] text-sm truncate max-w-[160px]">{m.teamName || m.title || 'Đội tìm kèo'}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.bookingId ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.bookingId ? '✓ Xịn' : 'Chưa cọc'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{m.postType === 'FIND_OPPONENT' ? 'Tìm đối thủ' : 'Tìm đồng đội'} · Trình độ: {m.skillLevel || '—'}</p>
                  </div>
                ))
          }
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div>
        <h2 className="font-bold text-lg text-[#1a202c] mb-4">Tác vụ quản trị</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/admin/users',     label: 'Quản lý người dùng',  color: '#e23670', bg: '#FFF0F5', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
            { to: '/admin/bookings',  label: 'Tất cả lịch đặt sân', color: '#3b82f6', bg: '#EFF6FF', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
            { to: '/admin/matches',   label: 'Kèo & Ghép trận',     color: '#8b5cf6', bg: '#F5F3FF', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
            { to: '/admin/dashboard', label: 'Báo cáo toàn bộ',     color: '#f59e0b', bg: '#FFFBEB', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></> },
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: item.bg, color: item.color }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
              </div>
              <span className="text-xs font-bold text-gray-600 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </section>
  )
}

