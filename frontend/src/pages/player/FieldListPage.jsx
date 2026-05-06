import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import fieldService from '../../services/fieldService'
import bookingService from '../../services/bookingService'
import useAuthStore from '../../store/useAuthStore'

const TIME_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 90;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
});

/**
 * Simplified Booking Page — /dat-san
 * 
 * Single-complex model: user selects field type → date → time slot → book.
 * No need to pick "cụm sân" because there's only one complex.
 * The API GET /fields?type=X returns individual sub-fields,
 * and GET /fields/:id/availability?date=X returns their time slots.
 */

function SkeletonSlot() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="p-4 flex flex-col gap-2">
        <div className="w-24 h-5 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-full h-9 bg-gray-200 rounded-full mt-2" />
      </div>
    </div>
  )
}

export default function FieldListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isLoggedIn } = useAuthStore()

  // Filter state
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'FIVE_A_SIDE')
  const [selectedDate, setSelectedDate] = useState(() => {
    return searchParams.get('date') || new Date().toISOString().split('T')[0]
  })
  const [filterStartTime, setFilterStartTime] = useState(searchParams.get('startTime') || '')
  
  const [isTimeOpen, setIsTimeOpen] = useState(false)

  // Data state
  const [fields, setFields] = useState([])               // named fields
  const [slotsByField, setSlotsByField] = useState({})   // { fieldId: groupedSlots[] }
  const [loading, setLoading] = useState(true)
  const [loadingFields, setLoadingFields] = useState(new Set()) // fieldIds đang load
  const [error, setError] = useState(null)

  // Cache in-memory: tránh re-fetch khi quay lại cùng type/date
  const cache = React.useRef({}) // { 'TYPE|date': { fields, slotsMap } }

  // Booking modal state
  const [selectedSlot, setSelectedSlot] = useState(null)  // { ...slot, fieldName, fieldId }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bookingNote, setBookingNote] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  const fieldTypes = [
    { value: 'FIVE_A_SIDE', label: 'Sân 5', icon: '5v5' },
    { value: 'SEVEN_A_SIDE', label: 'Sân 7', icon: '7v7' },
    { value: 'ELEVEN_A_SIDE', label: 'Sân 11', icon: '11v11' }
  ]

  const today = new Date().toISOString().split('T')[0]

  // Fetch fields when type changes
  useEffect(() => {
    fetchFieldsAndSlots()
  }, [filterType, selectedDate])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (selectedDate) params.set('date', selectedDate)
    if (filterStartTime) params.set('startTime', filterStartTime)
    setSearchParams(params, { replace: true })
  }, [filterType, selectedDate, filterStartTime, setSearchParams])

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Parse thời gian: hỗ trợ cả ISO string và "HH:mm" */
  const parseTimeMs = (value, dateStr) => {
    if (!value) return 0
    // Nếu đã là ISO (có chứa 'T' hoặc '-')
    if (value.includes('T') || value.includes('-')) {
      const ms = new Date(value).getTime()
      return isNaN(ms) ? 0 : ms
    }
    // Dạng "HH:mm" — ghép với ngày đang xem để so sánh đúng
    const [h, m] = value.split(':').map(Number)
    const d = new Date(dateStr)
    d.setHours(h, m, 0, 0)
    return d.getTime()
  }

  const formatTime = (value) => {
    if (!value) return ''
    if (value.includes('T') || value.includes('-')) {
      return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    // Đã là "HH:mm"
    return value.slice(0, 5)
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  /** Gộp slots của 1 sân theo khung giờ, lọc giờ đã qua */
  const buildGroups = (slots, isToday, cutoffMs) => {
    const groupMap = {}
    slots.forEach(slot => {
      // Lọc giờ đã qua (chỉ khi xem ngày hôm nay)
      if (isToday) {
        const slotMs = parseTimeMs(slot.startTime, selectedDate)
        if (slotMs < cutoffMs) return
      }

      const startLabel = formatTime(slot.startTime)
      const endLabel   = formatTime(slot.endTime)
      const key = `${startLabel}-${endLabel}`

      // Sort key: minutes-since-midnight — KHÔNG phụ thuộc ngày tham chiếu trong DB
      const [hh, mm] = startLabel.split(':').map(Number)
      const sortKey = hh * 60 + mm

      if (!groupMap[key]) {
        groupMap[key] = {
          key,
          startTime:      slot.startTime,
          endTime:        slot.endTime,
          sortKey,          // dùng để sort
          price:          slot.price,
          availableSlots: [],
          totalSlots:     0,
        }
      }
      groupMap[key].totalSlots++
      if (slot.available) groupMap[key].availableSlots.push(slot)
    })
    return Object.values(groupMap).sort((a, b) => a.sortKey - b.sortKey)
  }

  const fetchFieldsAndSlots = async () => {
    const cacheKey = `${filterType}|${selectedDate}`

    // Dùng cache nếu có
    if (cache.current[cacheKey]) {
      const { fields: cachedFields, slotsMap } = cache.current[cacheKey]
      setFields(cachedFields)
      setSlotsByField(slotsMap)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSelectedSlot(null)
      setSlotsByField({})

      // 1. Lấy danh sách sân
      const fieldsData = await fieldService.getFields({ type: filterType })
      setFields(fieldsData)

      const now = new Date()
      const isToday = selectedDate === now.toISOString().split('T')[0]
      const cutoffMs = isToday ? now.getTime() : 0

      // 2. Progressive: fetch từng sân và hiện ngay khi có dữ liệu
      const slotsMap = {}
      const pending = new Set(fieldsData.map(f => f.id))
      setLoadingFields(new Set(pending))

      await Promise.all(
        fieldsData.map(async (field) => {
          try {
            const slots = await fieldService.getFieldAvailability(field.id, selectedDate)
            const groups = buildGroups(Array.isArray(slots) ? slots : [], isToday, cutoffMs)
            slotsMap[field.id] = groups
            // Cập nhật state ngay — sân nào xong trước hiện trước
            setSlotsByField(prev => ({ ...prev, [field.id]: groups }))
          } catch {
            slotsMap[field.id] = []
          } finally {
            setLoadingFields(prev => { const s = new Set(prev); s.delete(field.id); return s })
          }
        })
      )

      // Lưu cache
      cache.current[cacheKey] = { fields: fieldsData, slotsMap }
    } catch (err) {
      setError('Không thể tải danh sách sân. Vui lòng thử lại sau.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Click vào một group khung giờ của sân → tự chọn slot đầu tiên còn trống
  const handleGroupClick = (group, field) => {
    if (group.availableSlots.length === 0) return
    const slot = group.availableSlots[0]
    setSelectedSlot({ ...slot, fieldName: field.name, fieldId: field.id })
  }

  const handleBookClick = () => {
    if (!isLoggedIn) {
      navigate('/dang-nhap')
      return
    }
    setBookingError(null)
    setIsModalOpen(true)
  }

  const confirmBooking = async () => {
    try {
      setIsBooking(true)
      setBookingError(null)

      // 1. Create booking
      const bookingRes = await bookingService.createBooking(selectedSlot.id, bookingNote)
      if (!bookingRes || !bookingRes.bookingId) throw new Error('Không nhận được mã đơn đặt')

      // 2. Create Stripe payment session
      const paymentRes = await bookingService.createPaymentSession(bookingRes.bookingId)
      if (!paymentRes || !paymentRes.url) throw new Error('Không nhận được URL thanh toán')

      // 3. Redirect to Stripe
      window.location.href = paymentRes.url
    } catch (err) {
      console.error(err)
      setBookingError(err.response?.data || err.message || 'Có lỗi xảy ra khi tạo đơn.')
      setIsBooking(false)
    }
  }

  // Tổng số khung giờ trống (unique) trên tất cả các sân
  const totalAvailable = Object.values(slotsByField).flat().filter(g => g.availableSlots.length > 0).length

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a202c]">Đặt sân</h1>
          <p className="text-gray-500 mt-2">Chọn loại sân, ngày, và khung giờ phù hợp với bạn.</p>
        </div>

        {/* ── Controls: Type Filter + Date Picker ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">

          {/* Field Type Tabs */}
          <div className="flex gap-2">
            {fieldTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  filterType === type.value
                    ? 'bg-[#1a202c] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a202c]'
                }`}
              >
                {type.label}
                <span className={`ml-1.5 text-xs ${filterType === type.value ? 'text-gray-300' : 'text-gray-400'}`}>
                  {type.icon}
                </span>
              </button>
            ))}
          </div>

          {/* Filters: Date, Time, Duration */}
          <div className="sm:ml-auto flex flex-wrap gap-3">
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-[#1a202c] font-medium outline-none focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/20 transition-all font-sans text-sm"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTimeOpen(!isTimeOpen)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-[#1a202c] font-medium outline-none focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/20 transition-all font-sans text-sm flex items-center justify-between w-28 h-full"
              >
                {filterStartTime || 'Giờ đặt'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 text-gray-400">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {isTimeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTimeOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-0 w-full min-w-[120px] bg-white shadow-lg border border-gray-300 z-50 max-h-60 overflow-y-auto py-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => { setFilterStartTime(''); setIsTimeOpen(false); }}
                      className="w-full px-4 py-1.5 text-left hover:bg-[#60D86E] hover:text-white text-sm text-gray-800 transition-none"
                    >
                      Giờ đặt
                    </button>
                    {TIME_OPTIONS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => { setFilterStartTime(time); setIsTimeOpen(false); }}
                        className={`w-full px-4 py-1.5 text-left text-sm transition-none ${
                          filterStartTime === time 
                            ? 'bg-[#60D86E] text-white' 
                            : 'text-gray-800 hover:bg-[#60D86E] hover:text-white'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {error ? (
          <div className="bg-red-50 text-red-500 p-6 rounded-3xl text-center border border-red-100 flex flex-col items-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="font-semibold">{error}</p>
            <button onClick={fetchFieldsAndSlots} className="mt-4 px-6 py-2 bg-white text-red-500 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors">Thử lại</button>
          </div>
        ) : loading ? (
          <div>
            {/* Loading skeleton */}
            <div className="mb-4 w-48 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[1,2,3,4,5,6,7,8,9,10].map(i => <SkeletonSlot key={i} />)}
            </div>
          </div>
        ) : fields.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 mb-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <h3 className="text-xl font-bold text-[#1a202c]">Không tìm thấy sân nào</h3>
            <p className="text-gray-500 mt-2">Loại sân này hiện chưa có. Vui lòng thử loại khác.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Summary bar */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#60D86E] animate-pulse" />
              <span className="text-sm font-semibold text-gray-600">
                {totalAvailable} khung giờ trống — {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
              </span>
            </div>

            {/* Mỗi sân là một block, trong đó slot được gộp theo khung giờ */}
            {fields.map(field => {
              let groups = slotsByField[field.id] || []

              // Áp filter giờ bắt đầu
              if (filterStartTime) {
                groups = groups.filter(g => formatTime(g.startTime) === filterStartTime)
              }

              if (groups.length === 0) return null

              const availableCount = groups.filter(g => g.availableSlots.length > 0).length

              return (
                <div key={field.id} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
                  {/* Header sân */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f9eb] flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1a202c] text-base">{field.name}</h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {availableCount} / {groups.length} khung giờ trống
                        <span className="ml-1 text-gray-300">· badge = số sân con còn trống</span>
                      </span>
                    </div>
                  </div>

                  {/* Grid khung giờ đã gộp */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {groups.map(group => {
                      const available = group.availableSlots.length
                      const total     = group.totalSlots
                      const full      = available === 0
                      const isSelected = selectedSlot && group.availableSlots.some(s => s.id === selectedSlot.id)
                      return (
                        <button
                          key={group.key}
                          disabled={full}
                          onClick={() => handleGroupClick(group, field)}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl w-full text-center transition-all duration-200 border-2 ${
                            full
                              ? 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed'
                              : isSelected
                                ? 'bg-[#60D86E] border-[#60D86E] text-white shadow-md -translate-y-1'
                                : 'bg-white border-gray-100 text-[#1a202c] hover:border-[#60D86E] hover:text-[#60D86E] hover:-translate-y-0.5 hover:shadow-sm'
                          }`}
                        >
                          <span className={`font-bold text-base mb-0.5 ${full ? 'opacity-50' : ''}`}>
                            {formatTime(group.startTime)}
                          </span>
                          <span className={`text-[11px] font-semibold ${
                            full ? 'opacity-50' : isSelected ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {full ? 'Hết sân' : formatCurrency(group.price)}
                          </span>
                          {/* Badge số sân con còn trống */}
                          {!full && (
                            <span className={`absolute -top-1.5 -right-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-white text-[#60D86E]' : 'bg-[#60D86E] text-white'
                            }`}>
                              {available}/{total}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Sticky Bottom Bar (when a slot is selected) ── */}
        {selectedSlot && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1a202c] text-white py-4 px-4 sm:px-8 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.15)]" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#60D86E]/20 items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-400">{selectedSlot.fieldName}</p>
                  <p className="font-bold">
                    {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                    <span className="ml-3 text-[#60D86E] font-extrabold">{formatCurrency(selectedSlot.price)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleBookClick}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#60D86E] text-[#1a202c] font-extrabold text-sm hover:bg-[#45c45a] hover:text-white transition-all active:scale-95 whitespace-nowrap"
              >
                {isLoggedIn ? 'Xác nhận & Cọc 30%' : 'Đăng nhập để đặt sân'}
              </button>
            </div>
          </div>
        )}

      </section>

      {/* ── Booking Confirmation Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isBooking && setIsModalOpen(false)}></div>

          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl" style={{ animation: 'paymentCardIn 0.3s ease-out' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isBooking}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <h3 className="text-xl font-extrabold text-[#1a202c] pr-8">Xác nhận đặt sân</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Vui lòng kiểm tra kỹ thông tin trước khi thanh toán cọc.</p>

            <div className="bg-[#f8faf8] rounded-2xl p-4 border border-[#e8f9eb] mb-5">
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium text-sm">Sân bóng</span>
                <span className="text-[#1a202c] font-bold text-right pl-4">{selectedSlot?.fieldName}</span>
              </div>
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium text-sm">Thời gian</span>
                <span className="text-[#1a202c] font-bold text-right pl-4">
                  {formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)}
                  <br/>
                  <span className="text-xs font-normal text-gray-500">{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                </span>
              </div>
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium text-sm">Tổng tiền slot</span>
                <span className="text-[#1a202c] font-bold">{formatCurrency(selectedSlot?.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-extrabold">Tiền cọc (30%)</span>
                <span className="text-[#60D86E] font-extrabold text-xl">{formatCurrency((selectedSlot?.price || 0) * 0.3)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a202c] mb-2" htmlFor="note">Ghi chú (Tùy chọn)</label>
              <textarea
                id="note"
                rows="2"
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                placeholder="Yêu cầu thêm về bóng, nước uống..."
                className="w-full px-4 py-3 rounded-2xl bg-[#f8faf8] border border-gray-200 text-sm outline-none focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/20 transition-all resize-none"
              ></textarea>
            </div>

            {bookingError && (
              <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                {bookingError}
              </div>
            )}

            <button
              disabled={isBooking}
              onClick={confirmBooking}
              className="w-full py-3.5 rounded-full bg-[#1a202c] text-white font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {isBooking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang chuyển hướng Stripe...
                </>
              ) : 'Thanh toán & Đặt sân'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Thanh toán bảo mật an toàn
            </p>
          </div>
        </div>
      )}

      {/* Inline keyframe for bottom bar slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
