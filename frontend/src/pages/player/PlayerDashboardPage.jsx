import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import bookingService from '../../services/bookingService'
import Toast from '../../components/common/Toast'

const STATUS_META = {
  PENDING:      { label: 'Chờ thanh toán', bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  DEPOSIT_PAID: { label: 'Đã cọc',        bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-200' },
  CONFIRMED:    { label: 'Đã xác nhận',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200' },
  COMPLETED:    { label: 'Hoàn thành',    bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  CANCELLED:    { label: 'Đã hủy',        bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200' },
}

export default function PlayerDashboardPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await bookingService.getMyBookings()
        setBookings(data || [])
      } catch (err) {
        setToast({ msg: 'Không thể tải thông tin lịch đặt sân.', type: 'error' })
        console.error('PlayerDashboardPage load error', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const activeStatuses = ['PENDING', 'DEPOSIT_PAID', 'CONFIRMED']
  const activeCount = bookings.filter(b => activeStatuses.includes(b.status)).length
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length

  const upcomingBookings = bookings
    .filter(b => activeStatuses.includes(b.status))
    .sort((a, b) => new Date(a.bookingDate || a.createdAt || 0) - new Date(b.bookingDate || b.createdAt || 0))
    .slice(0, 3)

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Tổng quan</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Chào mừng quay trở lại. Đây là tóm tắt hoạt động của bạn.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm text-center transition-transform hover:-translate-y-1">
            <p className="text-3xl sm:text-4xl font-black text-[#1a202c]">{loading ? '–' : bookings.length}</p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Tổng đặt sân</p>
          </div>
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-green-100 shadow-sm text-center transition-transform hover:-translate-y-1">
            <p className="text-3xl sm:text-4xl font-black text-[#60D86E]">{loading ? '–' : activeCount}</p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Đang hoạt động</p>
          </div>
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-sm text-center transition-transform hover:-translate-y-1">
            <p className="text-3xl sm:text-4xl font-black text-blue-500">{loading ? '–' : completedCount}</p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Hoàn thành</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#1a202c]">Lịch sắp tới</h2>
              <Link to="/booking-history" className="text-sm font-bold text-[#60D86E] hover:underline">Xem tất cả</Link>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <p className="text-gray-500 font-medium">Bạn không có lịch đặt sân nào sắp tới.</p>
                 <Link to="/fields" className="mt-4 inline-block text-sm font-bold text-white bg-[#60D86E] px-5 py-2.5 rounded-full hover:bg-[#45c45a] transition-colors">
                   Tìm sân ngay
                 </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map(booking => {
                  const s = STATUS_META[booking.status] || STATUS_META.PENDING
                  const fieldName = booking.field?.name || booking.fieldName || 'Sân bóng'
                  const slotTime = booking.startTime && booking.endTime
                    ? `${booking.startTime} – ${booking.endTime}`
                    : booking.timeSlot ? `${booking.timeSlot.startTime} – ${booking.timeSlot.endTime}` : '—'
                  const dateStr = booking.bookingDate || '—'

                  return (
                    <div 
                      key={booking.bookingId || booking.id}
                      onClick={() => navigate(`/booking-history/${booking.bookingId || booking.id}`, { state: { booking } })}
                      className={`bg-white rounded-2xl border ${s.border} p-5 hover:shadow-md transition-all duration-200 cursor-pointer group`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <h3 className="font-bold text-[#1a202c] text-sm group-hover:text-[#60D86E] transition-colors">{fieldName}</h3>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 ml-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {slotTime}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#1a202c]">Thao tác nhanh</h2>
            <div className="flex flex-col gap-3">
              <Link to="/fields" className="bg-[#1a202c] text-white rounded-2xl p-4 flex items-center justify-between hover:bg-[#2d3748] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  </div>
                  <span className="font-bold text-sm">Đặt sân ngay</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
              
              <Link to="/booking-history" className="bg-white border border-gray-100 text-[#1a202c] rounded-2xl p-4 flex items-center justify-between hover:border-[#60D86E] hover:text-[#60D86E] transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <span className="font-bold text-sm">Xem lịch đặt</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>
          </div>
        </div>

      </div>
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </main>
  )
}
