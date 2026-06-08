import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import bookingService from '../../services/bookingService'
import ReviewModal from './components/ReviewModal'
import Toast from '../../components/common/Toast'

const STATUS_META = {
  PENDING:      { label: 'Chờ thanh toán', bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  DEPOSIT_PAID: { label: 'Đã cọc',       bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-200' },
  CONFIRMED:    { label: 'Đã xác nhận',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200' },
  COMPLETED:    { label: 'Hoàn thành',    bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  CANCELLED:    { label: 'Đã hủy',        bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200' },
}

const FILTER_TABS = [
  { key: 'ALL',          label: 'Tất cả' },
  { key: 'PENDING',      label: 'Chờ thanh toán' },
  { key: 'DEPOSIT_PAID', label: 'Đã cọc' },
  { key: 'CONFIRMED',    label: 'Đã xác nhận' },
  { key: 'COMPLETED',    label: 'Hoàn thành' },
  { key: 'CANCELLED',    label: 'Đã hủy' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 flex-1"><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
        <div className="w-20 h-6 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-4"><div className="h-3 bg-gray-100 rounded w-24" /><div className="h-3 bg-gray-100 rounded w-28" /></div>
    </div>
  )
}

function BookingCard({ booking, onReviewClick, onPayClick }) {
  const s = STATUS_META[booking.status] || STATUS_META.PENDING
  const fieldName = booking.field?.name || booking.fieldName || 'Sân bóng'
  const slotTime = booking.startTime && booking.endTime
    ? `${booking.startTime} – ${booking.endTime}`
    : booking.timeSlot ? `${booking.timeSlot.startTime} – ${booking.timeSlot.endTime}` : '—'
  const dateStr = booking.bookingDate || '—'
  const deposit = booking.depositAmount ? `${Number(booking.depositAmount).toLocaleString('vi-VN')}đ` : '—'
  const total = booking.totalAmount ? `${Number(booking.totalAmount).toLocaleString('vi-VN')}đ` : null

  return (
    <div className={`bg-white rounded-2xl border ${s.border} p-5 hover:shadow-md transition-all duration-200`}>
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
            <h3 className="font-bold text-[#1a202c] text-sm truncate">{fieldName}</h3>
          </div>
          {booking.note && <p className="text-xs text-gray-400 mt-1 ml-4 truncate">{booking.note}</p>}
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
        <span className="flex items-center gap-1.5 font-semibold text-[#1a202c]">
            {booking.status === 'COMPLETED' ? 'Đã thanh toán:' : 'Đã cọc:'}{' '}
            {booking.status === 'COMPLETED' ? total : deposit}
          </span>
          {booking.status !== 'COMPLETED' && total && (
            <span className="text-gray-400">Tổng: {total}</span>
          )}
      </div>

      {/* Action row */}
      {(booking.status === 'PENDING' || booking.status === 'COMPLETED') && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          {booking.status === 'PENDING' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPayClick?.(booking)
              }}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#1a202c] text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Tiếp tục thanh toán — {deposit}
            </button>
          )}
          {booking.status === 'COMPLETED' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReviewClick(booking)
              }}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#fbbf24] text-[#1a202c] hover:bg-[#f59e0b] transition-colors"
            >
              Đánh giá sân
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function BookingHistoryPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null)
  const [payingId, setPayingId] = useState(null)
  const [toast, setToast] = useState(null)

  const handlePayBooking = async (booking) => {
    const bookingId = booking.bookingId || booking.id
    try {
      setPayingId(bookingId)
      const res = await bookingService.createPaymentSession(bookingId)
      if (!res?.url) throw new Error('Không nhận được URL thanh toán')
      window.location.href = res.url
    } catch (err) {
      console.error(err)
      setToast({ msg: err.response?.data?.message || err.message || 'Có lỗi xảy ra. Vui lòng thử lại.', type: 'error' })
      setPayingId(null)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookingService.getMyBookings()
        const priorityOrder = { PENDING: 0, DEPOSIT_PAID: 1, CONFIRMED: 2, COMPLETED: 3, CANCELLED: 4 }
        const sorted = [...data].sort((a, b) => {
          const pa = priorityOrder[a.status] ?? 6
          const pb = priorityOrder[b.status] ?? 6
          if (pa !== pb) return pa - pb
          return new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0)
        })
        setBookings(sorted)
      } catch (err) { console.error('BookingHistoryPage: load error', err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter)
  const activeCount = bookings.filter((b) => ['PENDING', 'DEPOSIT_PAID', 'CONFIRMED'].includes(b.status)).length
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Quản lý lịch đặt</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Lịch đặt sân</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi và quản lý tất cả các đơn đặt sân của bạn.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-black text-[#1a202c]">{loading ? '–' : bookings.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Tổng đơn</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm text-center">
            <p className="text-2xl font-black text-[#60D86E]">{loading ? '–' : activeCount}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Đang hoạt động</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm text-center">
            <p className="text-2xl font-black text-blue-500">{loading ? '–' : completedCount}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Hoàn thành</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === 'ALL' ? bookings.length : bookings.filter((b) => b.status === tab.key).length
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${filter === tab.key ? 'bg-[#60D86E] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#60D86E] hover:text-[#60D86E]'}`}>
                {tab.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Booking List */}
        <div className="space-y-3">
          {loading && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-400 font-medium">{filter === 'ALL' ? 'Bạn chưa có lịch đặt sân nào.' : 'Không có đơn nào ở trạng thái này.'}</p>
              {filter === 'ALL' && <Link to="/fields" className="mt-3 inline-block text-sm font-bold text-[#60D86E] hover:underline">Đặt sân ngay →</Link>}
            </div>
          )}
          {!loading && filtered.map((b) => {
            const bId = b.bookingId || b.id
            const isPaying = payingId === bId
            return (
              <div
                key={bId}
                onClick={() => navigate(`/booking-history/${bId}`, { state: { booking: b } })}
                className="cursor-pointer"
              >
                <BookingCard
                  booking={isPaying ? { ...b, _paying: true } : b}
                  onReviewClick={setSelectedReviewBooking}
                  onPayClick={handlePayBooking}
                />
              </div>
            )
          })}
        </div>
      </div>

      <ReviewModal
        isOpen={!!selectedReviewBooking}
        onClose={() => setSelectedReviewBooking(null)}
        fieldId={selectedReviewBooking?.field?.id || selectedReviewBooking?.fieldId}
        bookingId={selectedReviewBooking?.bookingId || selectedReviewBooking?.id}
      />
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </main>
  )
}
