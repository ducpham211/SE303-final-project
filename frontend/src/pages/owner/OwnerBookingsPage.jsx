import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import bookingService from '../../services/bookingService'

const STATUS_META = {
  PENDING: { label: 'Chờ cọc', badge: 'bg-amber-100 text-amber-700' },
  DEPOSIT_PAID: { label: 'Đã cọc', badge: 'bg-green-100 text-green-700' },
  CONFIRMED: { label: 'Đã xác nhận', badge: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Hoàn thành', badge: 'bg-indigo-100 text-indigo-700' },
  CANCELLED: { label: 'Đã hủy', badge: 'bg-gray-100 text-gray-500' },
}

const FILTER_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ cọc' },
  { key: 'DEPOSIT_PAID', label: 'Đã cọc' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
]

const ACTIONABLE_STATUS = 'DEPOSIT_PAID'

const ACTION_BUTTONS = [
  {
    key: 'check-in',
    label: 'Check-in',
    nextStatus: 'COMPLETED',
    run: (id) => bookingService.checkIn(id),
    className: 'bg-emerald-500 text-white hover:bg-emerald-600',
    successText: 'Đã check-in và hoàn tất đơn.',
  },
  {
    key: 'check-out',
    label: 'Thu nốt',
    nextStatus: 'COMPLETED',
    run: (id) => bookingService.checkOut(id, 'CASH'),
    className: 'bg-blue-500 text-white hover:bg-blue-600',
    successText: 'Đã check-out và ghi nhận phần tiền còn lại.',
  },
  {
    key: 'complete',
    label: 'Hoàn tất',
    nextStatus: 'COMPLETED',
    run: (id) => bookingService.completeBooking(id),
    className: 'bg-indigo-500 text-white hover:bg-indigo-600',
    successText: 'Đã xác nhận thu đủ tiền và hoàn tất đơn.',
  },
  {
    key: 'no-show',
    label: 'No-show',
    nextStatus: 'CANCELLED',
    run: (id) => bookingService.markNoShow(id),
    className: 'bg-white text-red-600 border border-red-100 hover:bg-red-50',
    confirmText: 'Đánh dấu khách không đến sẽ hủy đơn và nhả sân. Bạn chắc chắn muốn tiếp tục?',
    successText: 'Đã đánh dấu khách không đến.',
  },
]

function fmtCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)
}

function fmtDate(value) {
  if (!value) return '--'
  const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function shortId(value) {
  return value ? value.slice(0, 8).toUpperCase() : '--'
}

function getBookingId(booking) {
  return booking.bookingId || booking.id || ''
}

function getFieldLabel(booking) {
  return booking.fieldName || booking.field?.name || (booking.fieldId ? `Sân #${shortId(booking.fieldId)}` : 'Sân bóng')
}

function getSearchText(booking) {
  const status = STATUS_META[booking.status]?.label || booking.status || ''
  return [
    getBookingId(booking),
    booking.fieldId,
    booking.userId,
    booking.note,
    booking.bookingDate,
    booking.startTime,
    booking.endTime,
    getFieldLabel(booking),
    status,
  ].filter(Boolean).join(' ').toLowerCase()
}

function getApiErrorMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  return error?.message || 'Không cập nhật được đơn. Kiểm tra lại trạng thái booking rồi thử lại.'
}

function sortBookings(bookingList = []) {
  return [...bookingList].sort(
    (a, b) => new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0)
  )
}

export default function OwnerBookingsPage() {
  const cachedBookings = bookingService.peekBookings()
  const [bookings, setBookings] = useState(() => (
    cachedBookings ? sortBookings(cachedBookings) : []
  ))
  const [loading, setLoading] = useState(() => !cachedBookings)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [updatingBookingId, setUpdatingBookingId] = useState('')
  const [actionMessage, setActionMessage] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(!bookingService.peekBookings())

    bookingService.getMyBookings()
      .then((data) => {
        if (alive) setBookings(sortBookings(data))
      })
      .catch(() => {
        if (alive) setError('Không tải được lịch đặt sân.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase()

    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
      const matchesDate = !dateFilter || booking.bookingDate === dateFilter
      const matchesSearch = !q || getSearchText(booking).includes(q)
      return matchesStatus && matchesDate && matchesSearch
    })
  }, [bookings, dateFilter, search, statusFilter])

  const totalDeposit = useMemo(
    () => bookings
      .filter((booking) => ['DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED'].includes(booking.status))
      .reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0),
    [bookings]
  )

  const filteredDeposit = useMemo(
    () => filteredBookings
      .filter((booking) => ['DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED'].includes(booking.status))
      .reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0),
    [filteredBookings]
  )

  const countFor = (key) => {
    if (key === 'ALL') return bookings.length
    return bookings.filter((booking) => booking.status === key).length
  }

  const hasActiveFilter = statusFilter !== 'ALL' || search.trim() || dateFilter

  const clearFilters = () => {
    setStatusFilter('ALL')
    setSearch('')
    setDateFilter('')
  }

  const handleBookingAction = async (booking, action) => {
    const id = getBookingId(booking)
    if (!id || updatingBookingId) return

    if (action.confirmText && !window.confirm(action.confirmText)) return

    setUpdatingBookingId(id)
    setError('')
    setActionMessage(null)

    try {
      const result = await action.run(id)
      setBookings((prev) => prev.map((item) => (
        getBookingId(item) === id ? { ...item, status: action.nextStatus } : item
      )))
      setActionMessage({
        type: 'success',
        text: typeof result === 'string' ? result : action.successText,
      })
    } catch (actionError) {
      console.error('Owner booking action error:', actionError)
      setActionMessage({
        type: 'error',
        text: getApiErrorMessage(actionError),
      })
    } finally {
      setUpdatingBookingId('')
    }
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-blue-500 font-medium transition-colors">
              Quay lại trang tổng quan
            </Link>
            <h1 className="text-2xl font-extrabold text-[#1a202c] mt-1">Lịch đặt sân</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {bookings.length} đơn &middot; Đã thu cọc:{' '}
              <span className="font-bold text-[#60D86E]">{fmtCurrency(totalDeposit)}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kết quả</p>
              <p className="text-xl font-black text-[#1a202c]">{filteredBookings.length}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cọc theo lọc</p>
              <p className="text-xl font-black text-[#60D86E]">{fmtCurrency(filteredDeposit)}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className={`rounded-2xl px-4 py-3 text-sm font-medium border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {actionMessage.text}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto] gap-3">
            <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#60D86E] focus-within:ring-2 focus-within:ring-[#60D86E]/20 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo mã đơn, mã sân, người đặt, ghi chú..."
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#1a202c] placeholder-gray-400"
              />
            </label>

            <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#60D86E] focus-within:ring-2 focus-within:ring-[#60D86E]/20 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#1a202c]"
              />
            </label>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilter}
              className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Xóa lọc
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => {
              const active = statusFilter === tab.key
              const count = countFor(tab.key)

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    active
                      ? 'bg-[#1a202c] text-white shadow-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-xs ${active ? 'opacity-70' : 'opacity-50'}`}>
                      ({count})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-14 px-4">
              <p className="text-gray-400 font-medium">Chưa có đơn đặt sân nào.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-14 px-4">
              <p className="text-gray-400 font-medium">Không có đơn nào khớp bộ lọc.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm font-bold text-[#60D86E] hover:text-[#45c45a]"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 font-bold border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3">Mã đơn</th>
                    <th className="px-5 py-3">Sân</th>
                    <th className="px-5 py-3">Ngày</th>
                    <th className="px-5 py-3">Giờ</th>
                    <th className="px-5 py-3">Tổng tiền</th>
                    <th className="px-5 py-3">Tiền cọc</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Ghi chú</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const status = STATUS_META[booking.status] || STATUS_META.PENDING
                    const id = getBookingId(booking)
                    const updating = updatingBookingId === id
                    const canManage = booking.status === ACTIONABLE_STATUS

                    return (
                      <tr key={id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-gray-400 text-xs">#{shortId(id)}</td>
                        <td className="px-5 py-3.5 font-semibold text-[#1a202c] max-w-[180px] truncate">
                          {getFieldLabel(booking)}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{fmtDate(booking.bookingDate || booking.createdAt)}</td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {fmtTime(booking.startTime)}
                          {booking.endTime ? ` - ${fmtTime(booking.endTime)}` : ''}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#1a202c] whitespace-nowrap">{fmtCurrency(booking.totalAmount)}</td>
                        <td className="px-5 py-3.5 font-bold text-[#60D86E] whitespace-nowrap">{fmtCurrency(booking.depositAmount)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.badge}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 max-w-[220px] truncate">
                          {booking.note || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {canManage ? (
                            <div className="flex flex-wrap justify-end gap-1.5 min-w-[245px]">
                              {ACTION_BUTTONS.map((action) => (
                                <button
                                  key={action.key}
                                  type="button"
                                  onClick={() => handleBookingAction(booking, action)}
                                  disabled={updating || Boolean(updatingBookingId && updatingBookingId !== id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${action.className}`}
                                >
                                  {updating ? 'Đang xử lý' : action.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-right text-xs font-semibold text-gray-400 whitespace-nowrap">
                              {booking.status === 'PENDING'
                                ? 'Chờ khách cọc'
                                : booking.status === 'COMPLETED'
                                  ? 'Đã hoàn tất'
                                  : 'Không còn thao tác'}
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
