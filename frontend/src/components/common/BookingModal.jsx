import { useState } from 'react'

/**
 * Shared Booking Confirmation Modal
 *
 * Props:
 *   isOpen       {boolean}
 *   onClose      {() => void}
 *   onConfirm    {(note: string) => Promise<void>}   — caller handles API calls
 *   isBooking    {boolean}                            — loading state
 *   bookingError {string|null}
 *   fieldName    {string}
 *   startTime    {string}
 *   endTime      {string}
 *   date         {string}   YYYY-MM-DD
 *   price        {number}
 *   // Extended mode (FieldDetailPage): pass addons + teamSize state
 *   showAddons   {boolean}  default false
 *   addons       {object}   { water, bibs, referee, goalkeeper }
 *   onAddonsChange {(addons) => void}
 *   teamSize     {number}
 *   onTeamSizeChange {(n) => void}
 */

const ADDON_PRICES = {
  water: 50000,
  bibs: 30000,
  referee: 150000,
  goalkeeper: 100000,
}

const ADDON_LABELS = {
  water: 'Nước (+50k)',
  bibs: 'Áo bíp (+30k)',
  referee: 'Trọng tài (+150k)',
  goalkeeper: 'Thủ môn (+100k)',
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0)

const formatTime = (value) => {
  if (!value) return ''
  if (!value.includes('T') && !value.includes('-') && value.includes(':')) return value.slice(0, 5)
  return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  isBooking = false,
  bookingError = null,
  fieldName = '',
  startTime = '',
  endTime = '',
  date = '',
  price = 0,
  // Extended (add-ons) — optional
  showAddons = false,
  addons = { water: false, bibs: false, referee: false, goalkeeper: false },
  onAddonsChange,
  teamSize = 10,
  onTeamSizeChange,
}) {
  const [note, setNote] = useState('')

  if (!isOpen) return null

  // Calculate totals including add-ons
  const addonTotal = showAddons
    ? Object.entries(addons).reduce((sum, [key, on]) => sum + (on ? ADDON_PRICES[key] : 0), 0)
    : 0
  const total = price + addonTotal
  const deposit = total * 0.3
  const splitAmount = Math.ceil(total / Math.max(1, teamSize))

  const handleConfirm = () => {
    let finalNote = note.trim()
    if (showAddons) {
      const addonLabels = Object.entries(addons)
        .filter(([, on]) => on)
        .map(([key]) => ADDON_LABELS[key])
      if (addonLabels.length > 0) {
        finalNote = `Dịch vụ thêm: ${addonLabels.join(', ')}. ${finalNote}`.trim()
      }
    }
    onConfirm(finalNote)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-24 pb-12">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isBooking && onClose()}
      />

      <div
        className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl my-auto"
        style={{ animation: 'bookingModalIn 0.25s ease-out' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          disabled={isBooking}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h3 className="text-xl font-extrabold text-[#1a202c] pr-8">Xác nhận đặt sân</h3>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Bạn sẽ thanh toán cọc 30% qua Stripe ngay bây giờ, phần còn lại thanh toán tại sân.
        </p>

        {/* Booking summary */}
        <div className="bg-[#f8faf8] rounded-2xl p-4 border border-[#e8f9eb] mb-5">
          <Row label="Sân bóng" value={fieldName} />
          <Row
            label="Thời gian"
            value={
              <>
                {formatTime(startTime)} – {formatTime(endTime)}
                <br />
                <span className="text-xs font-normal text-gray-500">
                  {date ? new Date(date).toLocaleDateString('vi-VN') : ''}
                </span>
              </>
            }
          />
          <Row label="Tiền slot" value={formatCurrency(price)} />
          {showAddons && addonTotal > 0 && (
            <Row label="Dịch vụ thêm" value={`+${formatCurrency(addonTotal)}`} />
          )}
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200/50">
            <span className="text-gray-700 font-extrabold">Cọc ngay (30%)</span>
            <span className="text-[#60D86E] font-extrabold text-xl">{formatCurrency(deposit)}</span>
          </div>
        </div>

        {/* Add-ons (extended mode) */}
        {showAddons && (
          <>
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-[#1a202c] mb-3">Dịch vụ đi kèm (Thanh toán tại sân)</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(ADDON_PRICES).map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#60D86E] rounded border-gray-300 focus:ring-[#60D86E]"
                      checked={!!addons[key]}
                      onChange={(e) => onAddonsChange?.({ ...addons, [key]: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">{ADDON_LABELS[key]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Split bill calculator */}
            <div className="mb-5 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-blue-900">Máy tính chia tiền (Dự kiến)</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                  Tổng: {formatCurrency(total)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1/2">
                  <label className="block text-xs text-gray-500 mb-1">Số người đá</label>
                  <input
                    type="number" min="1" max="50"
                    value={teamSize}
                    onChange={(e) => onTeamSizeChange?.(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs text-gray-500 mb-1">Mỗi người đóng</label>
                  <div className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm font-bold text-blue-700">
                    {formatCurrency(splitAmount)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment via Stripe — informational only */}
        <div className="mb-5 flex items-center gap-3 p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="flex-shrink-0">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-green-800">Thanh toán cọc qua Stripe</p>
            <p className="text-xs text-green-700 mt-0.5">Thẻ Visa / Mastercard · Apple Pay · Google Pay</p>
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1a202c] mb-2" htmlFor="booking-modal-note">
            Ghi chú (Tùy chọn)
          </label>
          <textarea
            id="booking-modal-note"
            rows="2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Yêu cầu thêm về bóng, nước uống..."
            className="w-full px-4 py-3 rounded-2xl bg-[#f8faf8] border border-gray-200 text-sm outline-none focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/20 transition-all resize-none"
          />
        </div>

        {bookingError && (
          <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
            {bookingError}
          </div>
        )}

        <button
          disabled={isBooking}
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-full bg-[#1a202c] text-white font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          {isBooking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang chuyển hướng Stripe...
            </>
          ) : (
            `Đặt cọc ${formatCurrency(deposit)} & Đặt sân`
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Thanh toán bảo mật an toàn
        </p>
      </div>

      <style>{`
        @keyframes bookingModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  )
}

/** Small helper for summary rows */
function Row({ label, value }) {
  return (
    <div className="flex justify-between mb-3 pb-3 border-b border-gray-200/50 last:border-0 last:mb-0 last:pb-0">
      <span className="text-gray-500 font-medium text-sm">{label}</span>
      <span className="text-[#1a202c] font-bold text-right pl-4">{value}</span>
    </div>
  )
}
