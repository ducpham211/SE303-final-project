import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import bookingService from '../../services/bookingService'
import ReviewModal from './components/ReviewModal'
import Toast from '../../components/common/Toast'

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_META = {
  PENDING:      { label: 'Chờ thanh toán', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   border: 'border-amber-200' },
  DEPOSIT_PAID: { label: 'Đã cọc',         bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500',   border: 'border-green-200' },
  CONFIRMED:    { label: 'Đã xác nhận',    bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    border: 'border-blue-200' },
  COMPLETED:    { label: 'Hoàn thành',     bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  CANCELLED:    { label: 'Đã hủy',         bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     border: 'border-red-200' },
}

const STATUS_TABS = [
  { key: 'ALL',          label: 'Tất cả' },
  { key: 'PENDING',      label: 'Chờ TT' },
  { key: 'DEPOSIT_PAID', label: 'Đã cọc' },
  { key: 'CONFIRMED',    label: 'Xác nhận' },
  { key: 'COMPLETED',    label: 'Hoàn thành' },
  { key: 'CANCELLED',    label: 'Đã hủy' },
]

const DATE_OPTS = [
  { key: 'ALL',    label: 'Tất cả' },
  { key: 'TODAY',  label: 'Hôm nay' },
  { key: 'WEEK',   label: 'Tuần này' },
  { key: 'MONTH',  label: 'Tháng này' },
  { key: 'CUSTOM', label: 'Tùy chọn' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const s = String(dateStr)
  const clean = s.includes('T') ? s.split('T')[0] : s.includes(' ') ? s.split(' ')[0] : s
  const [y, m, d] = clean.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function getDateRange(mode, customStart, customEnd) {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (mode === 'TODAY') return { start: today, end: today }
  if (mode === 'WEEK') {
    const dow    = today.getDay() === 0 ? 6 : today.getDay() - 1
    const monday = new Date(today); monday.setDate(today.getDate() - dow)
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
    return { start: monday, end: sunday }
  }
  if (mode === 'MONTH') {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end:   new Date(today.getFullYear(), today.getMonth() + 1, 0),
    }
  }
  if (mode === 'CUSTOM' && customStart && customEnd) {
    const s = parseLocalDate(customStart), e = parseLocalDate(customEnd)
    if (s && e && e >= s) return { start: s, end: e }
  }
  return null
}

function getBookingDate(b) {
  return parseLocalDate(b.bookingDate || b.startTime || b.timeSlot?.startTime)
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
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

// ─── BookingCard ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onReviewClick, onPayClick }) {
  const s         = STATUS_META[booking.status] || STATUS_META.PENDING
  const fieldName = booking.field?.name || booking.fieldName || 'Sân bóng'
  const slotTime  = booking.startTime && booking.endTime
    ? `${booking.startTime.slice(0,5)} – ${booking.endTime.slice(0,5)}`
    : booking.timeSlot
      ? `${booking.timeSlot.startTime?.slice(0,5)} – ${booking.timeSlot.endTime?.slice(0,5)}`
      : '—'
  const dateStr  = booking.bookingDate
    ? new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
    : '—'
  const deposit  = booking.depositAmount ? `${Number(booking.depositAmount).toLocaleString('vi-VN')}đ` : '—'
  const total    = booking.totalAmount   ? `${Number(booking.totalAmount).toLocaleString('vi-VN')}đ` : null

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
        {booking.status !== 'COMPLETED' && total && <span className="text-gray-400">Tổng: {total}</span>}
      </div>

      {(booking.status === 'PENDING' || booking.status === 'COMPLETED') && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          {booking.status === 'PENDING' && (
            <button
              onClick={(e) => { e.stopPropagation(); onPayClick?.(booking) }}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#1a202c] text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Tiếp tục thanh toán — {deposit}
            </button>
          )}
          {booking.status === 'COMPLETED' && (
            <button
              onClick={(e) => { e.stopPropagation(); onReviewClick(booking) }}
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

// ─── Unified Filter Panel ────────────────────────────────────────────────────
function FilterPanel({
  statusFilter, setStatusFilter,
  dateMode, setDateMode,
  customStart, setCustomStart,
  customEnd, setCustomEnd,
  dateFiltered,
}) {
  const isCustomOpen  = dateMode === 'CUSTOM'
  const customInvalid = isCustomOpen && customStart && customEnd && customEnd < customStart
  const hasFilter     = statusFilter !== 'ALL' || dateMode !== 'ALL'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">

      {/* ── Row 1: Thời gian ── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Thời gian
          </span>
          {hasFilter && (
            <button
              onClick={() => { setStatusFilter('ALL'); setDateMode('ALL'); setCustomStart(''); setCustomEnd('') }}
              className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-semibold"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DATE_OPTS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setDateMode(opt.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                dateMode === opt.key
                  ? 'bg-[#1a202c] text-white border-[#1a202c] shadow-sm'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom date inputs — animated */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: isCustomOpen ? '80px' : '0', opacity: isCustomOpen ? 1 : 0 }}
        >
          <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[11px] text-gray-400 font-medium whitespace-nowrap">Từ</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#60D86E] focus:ring-1 focus:ring-[#60D86E]/30 transition-all font-sans"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[11px] text-gray-400 font-medium whitespace-nowrap">Đến</label>
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={e => setCustomEnd(e.target.value)}
                className={`flex-1 text-xs border rounded-lg px-2.5 py-1.5 outline-none transition-all font-sans ${
                  customInvalid
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 focus:border-[#60D86E] focus:ring-1 focus:ring-[#60D86E]/30'
                }`}
              />
            </div>
            {customInvalid && <p className="text-[11px] text-red-500 font-medium self-center">Ngày không hợp lệ</p>}
          </div>
        </div>
      </div>

      {/* ── Row 2: Trạng thái ── */}
      <div className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Trạng thái
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'ALL'
              ? dateFiltered.length
              : dateFiltered.filter(b => b.status === tab.key).length
            const meta = STATUS_META[tab.key]
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                  statusFilter === tab.key
                    ? 'bg-[#60D86E] text-white border-[#60D86E] shadow-sm'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#60D86E] hover:text-[#60D86E]'
                }`}
              >
                {meta && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusFilter === tab.key ? 'bg-white' : meta.dot}`} />}
                {tab.label}
                <span className={`text-[10px] font-extrabold ${statusFilter === tab.key ? 'text-white/80' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingHistoryPage() {
  const navigate = useNavigate()
  const [bookings, setBookings]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [statusFilter, setStatusFilter]       = useState('ALL')
  const [dateMode, setDateMode]               = useState('ALL')
  const [customStart, setCustomStart]         = useState('')
  const [customEnd, setCustomEnd]             = useState('')
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null)
  const [payingId, setPayingId]               = useState(null)
  const [toast, setToast]                     = useState(null)

  const handlePayBooking = async (booking) => {
    const bookingId = booking.bookingId || booking.id
    try {
      setPayingId(bookingId)
      const res = await bookingService.createPaymentSession(bookingId)
      if (!res?.url) throw new Error('Không nhận được URL thanh toán')
      window.location.href = res.url
    } catch (err) {
      console.error(err)
      setToast({ msg: err.response?.data?.message || err.message || 'Có lỗi xảy ra.', type: 'error' })
      setPayingId(null)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookingService.getMyBookings()
        const order = { PENDING: 0, DEPOSIT_PAID: 1, CONFIRMED: 2, COMPLETED: 3, CANCELLED: 4 }
        const sorted = [...data].sort((a, b) => {
          const pa = order[a.status] ?? 6, pb = order[b.status] ?? 6
          if (pa !== pb) return pa - pb
          return new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0)
        })
        setBookings(sorted)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // ── Derived data ──────────────────────────────────────────────────────────
  const dateRange = getDateRange(dateMode, customStart, customEnd)

  const dateFiltered = React.useMemo(() => {
    if (!dateRange) return bookings
    return bookings.filter(b => {
      const d = getBookingDate(b)
      return !d || (d >= dateRange.start && d <= dateRange.end)
    })
  }, [bookings, dateRange])

  const filtered       = statusFilter === 'ALL' ? dateFiltered : dateFiltered.filter(b => b.status === statusFilter)
  const activeCount    = dateFiltered.filter(b => ['PENDING', 'DEPOSIT_PAID', 'CONFIRMED'].includes(b.status)).length
  const completedCount = dateFiltered.filter(b => b.status === 'COMPLETED').length
  const activeDateLabel = DATE_OPTS.find(o => o.key === dateMode)?.label || 'Tất cả'
  const activeStatusLabel = STATUS_TABS.find(t => t.key === statusFilter)?.label

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-8">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Quản lý lịch đặt</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">Lịch đặt sân</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi và quản lý tất cả các đơn đặt sân của bạn.</p>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-black text-[#1a202c]">{loading ? '–' : dateFiltered.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{dateMode === 'ALL' ? 'Tổng đơn' : activeDateLabel}</p>
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

        {/* ── Unified Filter Panel ── */}
        <FilterPanel
          statusFilter={statusFilter}  setStatusFilter={setStatusFilter}
          dateMode={dateMode}          setDateMode={setDateMode}
          customStart={customStart}    setCustomStart={setCustomStart}
          customEnd={customEnd}        setCustomEnd={setCustomEnd}
          dateFiltered={dateFiltered}
        />

        {/* ── Booking List ── */}
        <div className="space-y-3">
          {loading && [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-gray-300">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="text-gray-400 font-medium text-sm">
                {dateMode !== 'ALL' || statusFilter !== 'ALL'
                  ? `Không có đơn nào${dateMode !== 'ALL' ? ` trong "${activeDateLabel}"` : ''}${statusFilter !== 'ALL' ? ` — trạng thái "${activeStatusLabel}"` : ''}.`
                  : 'Bạn chưa có lịch đặt sân nào.'}
              </p>
              {(dateMode !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setDateMode('ALL'); setStatusFilter('ALL') }}
                  className="mt-3 text-sm font-bold text-[#60D86E] hover:underline"
                >
                  Xem tất cả đơn đặt →
                </button>
              )}
              {dateMode === 'ALL' && statusFilter === 'ALL' && (
                <Link to="/fields" className="mt-3 inline-block text-sm font-bold text-[#60D86E] hover:underline">
                  Đặt sân ngay →
                </Link>
              )}
            </div>
          )}

          {!loading && filtered.map(b => {
            const bId     = b.bookingId || b.id
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
