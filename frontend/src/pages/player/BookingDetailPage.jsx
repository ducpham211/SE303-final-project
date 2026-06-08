import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import bookingService from '../../services/bookingService'

/**
 * Booking Detail Page — /lich-dat/:id
 *
 * Data strategy (no GET /bookings/:id on backend):
 *   1. Read booking from location.state passed by BookingHistoryPage navigate()
 *   2. If state is missing (e.g. direct URL), call GET /api/bookings then .find() by id
 *
 * Cancel booking: backend endpoint does not exist yet.
 * TODO: requires backend endpoint PUT /api/bookings/:id/cancel (PLAYER role)
 */

const STATUS_META = {
  PENDING:      { label: 'Chờ thanh toán', bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-400' },
  DEPOSIT_PAID: { label: 'Đã cọc',         bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200', dot: 'bg-green-500' },
  CONFIRMED:    { label: 'Đã xác nhận',    bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-500' },
  COMPLETED:    { label: 'Hoàn thành',     bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
  CANCELLED:    { label: 'Đã hủy',         bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200',   dot: 'bg-red-400' },
  NO_SHOW:      { label: 'Không đến sân',  bg: 'bg-gray-50',    text: 'text-gray-500',   border: 'border-gray-200',  dot: 'bg-gray-400' },
}

function formatTime(value) {
  if (!value) return ''
  if (!value.includes('T') && !value.includes('-') && value.includes(':')) {
    return value.slice(0, 5)
  }
  return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'
  })
}

function DetailRow({ label, value, valueClassName = '' }) {
  return (
    <div className="flex justify-between items-start py-3.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className={`text-sm font-semibold text-[#1a202c] text-right pl-4 max-w-[60%] ${valueClassName}`}>
        {value}
      </span>
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [booking, setBooking] = useState(
    // Instant load from list page navigation state — no API call needed
    location.state?.booking ?? null
  )
  const [loading, setLoading] = useState(!location.state?.booking)
  const [error, setError] = useState(null)
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState(null)

  const handleContinuePayment = async () => {
    try {
      setIsPaying(true)
      setPayError(null)
      const paymentRes = await bookingService.createPaymentSession(id)
      if (!paymentRes || !paymentRes.url) throw new Error('Không nhận được URL thanh toán')
      window.location.href = paymentRes.url
    } catch (err) {
      console.error(err)
      setPayError(err.response?.data || err.message || 'Có lỗi xảy ra khi tạo liên kết thanh toán.')
      setIsPaying(false)
    }
  }

  useEffect(() => {
    // Skip fetch if booking was passed via location.state
    if (booking) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        // Backend only has GET /bookings (full list) — filter client-side
        const data = await bookingService.getMyBookings()
        const found = Array.isArray(data)
          ? data.find((b) => (b.bookingId || b.id) === id)
          : null
        if (!found) {
          const err = new Error('not found')
          err.response = { status: 404 }
          throw err
        }
        setBooking(found)
      } catch (err) {
        const status = err?.response?.status
        if (status === 404) {
          setError('Không tìm thấy đơn đặt sân này.')
        } else if (status === 403) {
          setError('Bạn không có quyền xem đơn đặt sân này.')
        } else {
          setError('Không thể tải thông tin đặt sân. Vui lòng thử lại.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between py-3 border-b border-gray-100">
                <div className="w-24 h-4 bg-gray-100 rounded" />
                <div className="w-32 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-red-50 rounded-3xl border border-red-100 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="font-bold text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/booking-history')}
              className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Quay lại lịch đặt
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const s = STATUS_META[booking.status] || STATUS_META.PENDING
  const fieldName = booking.field?.name || booking.fieldName || 'Sân bóng'
  const bookingId = booking.bookingId || booking.id

  const startTime = booking.startTime || booking.timeSlot?.startTime
  const endTime   = booking.endTime   || booking.timeSlot?.endTime
  const slotLabel = startTime && endTime ? `${formatTime(startTime)} – ${formatTime(endTime)}` : '—'

  const depositLabel = booking.depositAmount != null ? formatCurrency(booking.depositAmount) : '—'
  const totalLabel   = booking.totalAmount   != null ? formatCurrency(booking.totalAmount)   : '—'

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8faf8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link
          to="/booking-history"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1a202c] transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quay lại lịch đặt
        </Link>

        {/* Header */}
        <div className="mb-6">
          <span className="text-[#60D86E] text-xs font-bold uppercase tracking-widest">Chi tiết đặt sân</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">{fieldName}</h1>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${s.bg} ${s.border}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
          <span className={`text-sm font-bold ${s.text}`}>{s.label}</span>
        </div>

        {/* Detail card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
          <DetailRow label="Mã đặt sân" value={bookingId} valueClassName="font-mono text-xs break-all" />
          <DetailRow label="Sân bóng" value={fieldName} />
          <DetailRow label="Ngày đặt" value={formatDate(booking.bookingDate)} />
          <DetailRow label="Khung giờ" value={slotLabel} />
          <DetailRow label="Đặt cọc (30%)" value={depositLabel} valueClassName="text-[#60D86E] font-extrabold" />
          <DetailRow label="Tổng tiền slot" value={totalLabel} />
          {booking.note && (
            <DetailRow label="Ghi chú" value={booking.note} />
          )}
        </div>

        {/* Continue Payment CTA — only for PENDING */}
        {booking.status === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex gap-3 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p className="text-sm font-bold text-amber-800 mb-0.5">Chưa hoàn tất thanh toán cọc</p>
                <p className="text-xs text-amber-700">
                  Slot sẽ tự động được giải phóng sau <strong>5 phút</strong> nếu bạn không hoàn tất thanh toán.
                  Hãy tiếp tục đặt cọc để giữ chỗ.
                </p>
              </div>
            </div>

            {payError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">{payError}</p>
            )}

            <button
              onClick={handleContinuePayment}
              disabled={isPaying}
              className="w-full py-3 rounded-full bg-[#1a202c] text-white text-sm font-extrabold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPaying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang chuyển hướng Stripe...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Tiếp tục thanh toán cọc — {depositLabel}
                </>
              )}
            </button>
          </div>
        )}

        {/* TODO: Cancel booking button — requires backend endpoint PUT /api/bookings/:id/cancel (PLAYER role) */}

      </div>
    </main>
  )
}
