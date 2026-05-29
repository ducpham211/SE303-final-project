import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import fieldService from '../../services/fieldService'
import bookingService from '../../services/bookingService'

const STATUS_META = {
  PENDING:   { label: 'Chờ cọc',    ring: 'border-amber-200  bg-amber-50',  badge: 'bg-amber-100 text-amber-700'  },
  PAID:      { label: 'Đã cọc',     ring: 'border-green-200  bg-green-50',  badge: 'bg-green-100 text-green-700'  },
  COMPLETED: { label: 'Hoàn thành', ring: 'border-blue-200   bg-blue-50',   badge: 'bg-blue-100  text-blue-700'   },
  CANCELLED: { label: 'Đã hủy',     ring: 'border-gray-200   bg-gray-50',   badge: 'bg-gray-100  text-gray-500'   },
}

function KpiCard({ label, value, sub, color, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      {loading
        ? <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse mt-1" />
        : <span className="text-3xl font-black" style={{ color }}>{value}</span>
      }
      <span className="text-xs text-gray-400 font-medium">{sub}</span>
    </div>
  )
}

function FieldStatusBadge({ field }) {
  // field.status không có trong API hiện tại — dùng timeSlots để suy luận
  // Nếu không có timeSlots → chưa cấu hình
  const configured = field.timeSlots?.length > 0
  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-1.5 ${configured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <span className="font-bold text-[#1a202c] text-sm">{field.name}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${configured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {configured ? `${field.timeSlots.length} khung giờ` : 'Chưa cấu hình'}
        </span>
      </div>
      <p className="text-xs text-gray-400 capitalize">{field.fieldType?.replace('_', ' ').toLowerCase() || '—'}</p>
    </div>
  )
}

export default function OwnerDashboardTeaser() {
  const { user } = useAuthStore()
  const [fields, setFields]     = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [fData, bData] = await Promise.all([
          fieldService.getFields(),
          bookingService.getMyBookings(),
        ])
        setFields(fData)
        // Sắp xếp: PENDING lên đầu, rồi đến mới nhất
        const sorted = [...bData].sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
          if (b.status === 'PENDING' && a.status !== 'PENDING') return 1
          return new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0)
        })
        setBookings(sorted)
      } catch (err) {
        console.error('OwnerDashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Tính KPI từ data thật
  const pendingCount   = bookings.filter(b => b.status === 'PENDING').length
  const paidCount      = bookings.filter(b => b.status === 'PAID').length
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length
  const totalRevenue   = bookings
    .filter(b => b.status === 'PAID' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.depositAmount) || 0), 0)
  const revenueDisplay = totalRevenue >= 1_000_000
    ? `${(totalRevenue / 1_000_000).toFixed(1)}M`
    : totalRevenue >= 1_000 ? `${(totalRevenue / 1_000).toFixed(0)}K` : `${totalRevenue}`

  // Chỉ lấy 5 booking gần nhất để hiển thị
  const recentBookings = bookings.slice(0, 5)
  const pendingList    = bookings.filter(b => b.status === 'PENDING').slice(0, 3)

  const handleCheckIn  = async (id) => { try { await bookingService.checkIn(id);   setBookings(prev => prev.map(b => b.id === id ? {...b, status:'PAID'} : b)) } catch {} }
  const handleNoShow   = async (id) => { try { await bookingService.markNoShow(id); setBookings(prev => prev.map(b => b.id === id ? {...b, status:'CANCELLED'} : b)) } catch {} }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Greeting */}
      <div>
        <span className="text-[#3b82f6] text-sm font-bold uppercase tracking-widest">Trung tâm sân bóng</span>
        <h1 className="text-3xl font-extrabold text-[#1a202c] mt-1">
          Xin chào, <span className="text-[#3b82f6]">{user?.name || 'Chủ sân'}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động của trung tâm dựa trên dữ liệu thực.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Tổng sân" value={fields.length} sub="sân đang quản lý" color="#1a202c" loading={loading} />
        <KpiCard label="Đơn chờ cọc" value={pendingCount} sub="Cần xử lý" color="#f59e0b" loading={loading} />
        <KpiCard label="Doanh thu (cọc)" value={revenueDisplay} sub="đã thu từ đặt cọc" color="#60D86E" loading={loading} />
        <KpiCard label="Hoàn thành" value={completedCount} sub="trận đấu" color="#3b82f6" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Field list */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg text-[#1a202c]">Danh sách sân ({fields.length})</h2>
            <Link to="/owner/fields" className="text-sm font-bold text-[#3b82f6] hover:underline">Quản lý →</Link>
          </div>
          {loading
            ? [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse mb-3" />)
            : fields.length === 0
              ? <p className="text-gray-400 text-sm text-center py-8">Chưa có sân nào. <Link to="/owner/fields" className="text-[#3b82f6] font-bold">Tạo sân ngay →</Link></p>
              : <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                  {fields.map(f => <FieldStatusBadge key={f.id} field={f} />)}
                </div>
          }
        </div>

        {/* Pending bookings */}
        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg text-[#1a202c]">Đơn đặt chờ cọc ({pendingCount})</h2>
            <Link to="/owner/bookings" className="text-sm font-bold text-amber-600 hover:underline">Tất cả →</Link>
          </div>
          {loading
            ? [1,2].map(i => <div key={i} className="h-20 bg-amber-50 rounded-2xl animate-pulse mb-3" />)
            : pendingList.length === 0
              ? <p className="text-gray-400 text-sm text-center py-8">Không có đơn chờ xử lý 🎉</p>
              : pendingList.map(b => {
                  const fieldName = b.field?.name || b.fieldName || 'Sân bóng'
                  const slotTime  = b.timeSlot ? `${b.timeSlot.startTime}–${b.timeSlot.endTime}` : b.time || '—'
                  const deposit   = b.depositAmount ? `${Number(b.depositAmount).toLocaleString('vi-VN')}đ` : '—'
                  return (
                    <div key={b.id} className="rounded-2xl p-4 border border-amber-100 bg-amber-50 flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#1a202c] text-sm">{fieldName}</span>
                        <span className="text-xs text-gray-500">{b.bookingDate || '—'} · {slotTime}</span>
                        <span className="text-xs font-bold text-[#60D86E]">{deposit}</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <button onClick={() => handleCheckIn(b.id)} className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">Check-in</button>
                        <button onClick={() => handleNoShow(b.id)} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors">No-show</button>
                      </div>
                    </div>
                  )
                })
          }
        </div>
      </div>

      {/* Recent bookings table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-[#1a202c]">Giao dịch gần đây</h2>
          <Link to="/owner/bookings" className="text-sm font-bold text-[#3b82f6] hover:underline">Xem tất cả →</Link>
        </div>
        {loading
          ? [1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse mb-2" />)
          : recentBookings.length === 0
            ? <p className="text-gray-400 text-sm text-center py-6">Chưa có giao dịch nào.</p>
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
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>{s.label}</span>
                    </div>
                  </div>
                )
              })
        }
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-lg text-[#1a202c] mb-4">Tác vụ nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/owner/fields',   label: 'Cấu hình sân & Khung giờ', color: '#60D86E', bg: '#F0FDF4', icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/> },
            { to: '/owner/bookings', label: 'Quản lý lịch đặt',          color: '#3b82f6', bg: '#EFF6FF', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
            { to: '/owner/revenue',  label: 'Báo cáo doanh thu',          color: '#8b5cf6', bg: '#F5F3FF', icon: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></> },
            { to: '/tin-nhan',       label: 'Tin nhắn khách hàng',        color: '#f59e0b', bg: '#FFFBEB', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
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
