import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookingService from '../../../services/bookingService'
import useAuthStore from '../../../store/useAuthStore'

const STATUS_META = {
  PENDING:   { label: 'Chờ cọc',    bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  PAID:      { label: 'Đã cọc',     bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  COMPLETED: { label: 'Hoàn thành', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  CANCELLED: { label: 'Đã hủy',     bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400'    },
}

function BookingRow({ booking }) {
  const s = STATUS_META[booking.status] || STATUS_META.PENDING
  // Lấy thông tin từ response của API
  const fieldName = booking.field?.name || booking.fieldName || 'Sân bóng'
  const slotTime  = booking.timeSlot
    ? `${booking.timeSlot.startTime} – ${booking.timeSlot.endTime}`
    : booking.time || '—'
  const dateStr   = booking.bookingDate || booking.date || '—'
  const deposit   = booking.depositAmount
    ? `${Number(booking.depositAmount).toLocaleString('vi-VN')}đ`
    : '—'

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <div className="min-w-0">
          <p className="font-semibold text-[#1a202c] text-sm truncate">{fieldName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr} · {slotTime}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-[#1a202c] hidden sm:block">{deposit}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 animate-pulse gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="w-16 h-6 bg-gray-100 rounded-full" />
    </div>
  )
}

export default function DashboardTeaser() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookingService.getMyBookings()
        // Sắp xếp: mới nhất lên đầu, chỉ lấy 4 để hiển thị
        const sorted = [...data].sort((a, b) =>
          new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0)
        )
        setBookings(sorted.slice(0, 4))
      } catch (err) {
        // Không throw, chỉ để trống danh sách
        console.warn('DashboardTeaser: could not load bookings', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Tính nhanh số liệu từ danh sách bookings đã load
  const upcoming = bookings.filter(b => b.status === 'PAID' || b.status === 'PENDING').length
  const completed = bookings.filter(b => b.status === 'COMPLETED').length

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Tài khoản của bạn</span>
            <h2 className="text-2xl font-extrabold text-[#1a202c] mt-0.5">
              Xin chào, {user?.name || 'bạn'} 👋
            </h2>
          </div>
          <Link to="/booking-history" className="text-sm font-bold text-[#60D86E] hover:underline hidden sm:block">
            Xem tất cả lịch →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#F0FDF4] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#60D86E]/20 flex items-center justify-center text-[#60D86E] flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Sắp diễn ra</p>
              <p className="text-2xl font-black text-[#1a202c]">{loading ? '–' : upcoming}</p>
            </div>
          </div>

          <div className="bg-[#EFF6FF] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Đã hoàn thành</p>
              <p className="text-2xl font-black text-[#1a202c]">{loading ? '–' : completed}</p>
            </div>
          </div>

          <Link to="/fields" className="bg-[#1a202c] rounded-2xl p-5 flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span className="text-white font-bold">Đặt sân mới</span>
          </Link>
        </div>

        {/* Booking list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-2">
          <div className="flex justify-between items-center py-3 border-b border-gray-100 mb-1">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest">Lịch đặt gần đây</h3>
          </div>

          {loading && [1,2,3].map(i => <SkeletonRow key={i} />)}

          {!loading && bookings.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">Bạn chưa có lịch đặt sân nào.</p>
              <Link to="/fields" className="mt-3 inline-block text-sm font-bold text-[#60D86E] hover:underline">
                Đặt sân ngay →
              </Link>
            </div>
          )}

          {!loading && bookings.map(b => <BookingRow key={b.id} booking={b} />)}
        </div>

        <div className="mt-4 sm:hidden text-center">
          <Link to="/booking-history" className="text-sm font-bold text-[#60D86E] hover:underline">
            Xem tất cả lịch đặt →
          </Link>
        </div>
      </div>
    </section>
  )
}
