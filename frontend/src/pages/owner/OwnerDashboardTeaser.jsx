import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import fieldService from '../../services/fieldService'
import bookingService from '../../services/bookingService'

const STATUS_META = {
  PENDING: { label: 'Chờ cọc', badge: 'bg-amber-100 text-amber-700', ring: 'border-amber-200 bg-amber-50' },
  DEPOSIT_PAID: { label: 'Đã cọc', badge: 'bg-green-100 text-green-700', ring: 'border-green-200 bg-green-50' },
  CONFIRMED: { label: 'Đã xác nhận', badge: 'bg-blue-100 text-blue-700', ring: 'border-blue-200 bg-blue-50' },
  COMPLETED: { label: 'Hoàn thành', badge: 'bg-indigo-100 text-indigo-700', ring: 'border-indigo-200 bg-indigo-50' },
  CANCELLED: { label: 'Đã hủy', badge: 'bg-gray-100 text-gray-500', ring: 'border-gray-200 bg-gray-50' },
  NO_SHOW: { label: 'Không đến sân', badge: 'bg-gray-100 text-gray-400', ring: 'border-gray-200 bg-gray-50' },
}

const FIELD_TYPE_LABELS = {
  FIVE_A_SIDE: 'Sân 5',
  SEVEN_A_SIDE: 'Sân 7',
}

const PAID_STATUSES = ['DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED']
const ACTIONABLE_STATUSES = ['DEPOSIT_PAID']

function getBookingId(booking) {
  return booking.bookingId || booking.id || ''
}

function shortId(value) {
  return value ? String(value).slice(0, 8).toUpperCase() : '--'
}

function getTimestamp(value) {
  if (!value) return 0
  const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function fmtDate(value) {
  if (!value) return '--'
  const timestamp = getTimestamp(value)
  if (!timestamp) return '--'
  return new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function fmtTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 5) || '--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function fmtCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)
}

function fmtCompactCurrency(value) {
  const amount = Number(value) || 0
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`
  return `${amount}`
}

function formatSlotTime(booking) {
  if (booking.timeSlot?.startTime && booking.timeSlot?.endTime) {
    return `${fmtTime(booking.timeSlot.startTime)} - ${fmtTime(booking.timeSlot.endTime)}`
  }

  if (booking.startTime && booking.endTime) {
    return `${fmtTime(booking.startTime)} - ${fmtTime(booking.endTime)}`
  }

  return booking.time || '--'
}

function getFieldTypeLabel(type) {
  if (!type) return 'Chưa phân loại'
  return FIELD_TYPE_LABELS[type] || String(type).replace(/_/g, ' ').toLowerCase()
}

function getFieldLabel(booking, fieldById) {
  return (
    booking.fieldName
    || booking.field?.name
    || fieldById.get(booking.fieldId)?.name
    || (booking.fieldId ? `Sân #${shortId(booking.fieldId)}` : 'Sân bóng')
  )
}

function getStatusMeta(status) {
  return STATUS_META[status] || {
    label: status || 'Không rõ',
    badge: 'bg-gray-100 text-gray-500',
    ring: 'border-gray-200 bg-gray-50',
  }
}

function KpiCard({ label, value, sub, color, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      {loading ? (
        <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse mt-1" />
      ) : (
        <span className="text-3xl font-black" style={{ color }}>{value}</span>
      )}
      <span className="text-xs text-gray-400 font-medium">{sub}</span>
    </div>
  )
}

function FieldStatusBadge({ field }) {
  const hasSlotDetails = Array.isArray(field.timeSlots)
  const slots = hasSlotDetails ? field.timeSlots : []
  const activeSlots = slots.filter((slot) => !slot.status || slot.status === 'AVAILABLE').length
  const configured = slots.length > 0

  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-2 ${configured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-bold text-[#1a202c] text-sm truncate">{field.name}</p>
          <p className="text-xs text-gray-400">{getFieldTypeLabel(field.type)}</p>
        </div>
        <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${configured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {hasSlotDetails ? (configured ? `${slots.length} khung giờ` : 'Chưa cấu hình') : 'Xem chi tiết'}
        </span>
      </div>
      {configured && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Khung khả dụng</span>
          <span className="font-bold text-[#1a202c]">{activeSlots}/{slots.length}</span>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status)
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>{meta.label}</span>
}

function sortDashboardBookings(bookingList = []) {
  return [...bookingList].sort((a, b) => {
    const aAction = ACTIONABLE_STATUSES.includes(a.status) ? 1 : 0
    const bAction = ACTIONABLE_STATUSES.includes(b.status) ? 1 : 0
    if (aAction !== bAction) return bAction - aAction
    return getTimestamp(b.bookingDate || b.createdAt) - getTimestamp(a.bookingDate || a.createdAt)
  })
}

export default function OwnerDashboardTeaser() {
  const { user } = useAuthStore()
  const cachedFields = fieldService.peekFields()
  const cachedBookings = bookingService.peekBookings()
  const [fields, setFields] = useState(() => cachedFields || [])
  const [bookings, setBookings] = useState(() => (
    cachedBookings ? sortDashboardBookings(cachedBookings) : []
  ))
  const [loading, setLoading] = useState(() => !(cachedFields && cachedBookings))
  const [error, setError] = useState('')
  const [updatingBookingId, setUpdatingBookingId] = useState('')

  useEffect(() => {
    let alive = true

    const loadDashboard = async () => {
      const hasCachedData = Boolean(fieldService.peekFields() && bookingService.peekBookings())
      setLoading(!hasCachedData)
      setError('')

      try {
        const [fieldList, bookingList] = await Promise.all([
          fieldService.getFields(),
          bookingService.getMyBookings(),
        ])

        if (!alive) return
        setFields(fieldList)
        setBookings(sortDashboardBookings(bookingList))
      } catch (loadError) {
        console.error('OwnerDashboard load error:', loadError)
        if (alive) setError('Không tải được dữ liệu tổng quan OWNER.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      alive = false
    }
  }, [])

  const fieldById = useMemo(() => new Map(fields.map((field) => [field.id, field])), [fields])
  const visibleFields = useMemo(() => fields.slice(0, 8), [fields])

  const summary = useMemo(() => {
    const pendingCount = bookings.filter((booking) => booking.status === 'PENDING').length
    const actionableCount = bookings.filter((booking) => ACTIONABLE_STATUSES.includes(booking.status)).length
    const completedCount = bookings.filter((booking) => booking.status === 'COMPLETED').length
    const depositRevenue = bookings
      .filter((booking) => PAID_STATUSES.includes(booking.status))
      .reduce((sum, booking) => sum + (Number(booking.depositAmount) || 0), 0)

    return {
      pendingCount,
      actionableCount,
      completedCount,
      depositRevenue,
    }
  }, [bookings])

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings])

  const actionList = useMemo(
    () => bookings.filter((booking) => ACTIONABLE_STATUSES.includes(booking.status)).slice(0, 3),
    [bookings]
  )

  const handleBookingAction = async (id, action, nextStatus) => {
    setUpdatingBookingId(id)
    setError('')

    try {
      await action(id)
      setBookings((prev) => prev.map((booking) => (
        getBookingId(booking) === id ? { ...booking, status: nextStatus } : booking
      )))
    } catch (actionError) {
      console.error('OwnerDashboard booking action error:', actionError)
      setError('Không cập nhật được đơn. Kiểm tra lại trạng thái booking rồi thử lại.')
    } finally {
      setUpdatingBookingId('')
    }
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-[#3b82f6] text-sm font-bold uppercase tracking-widest">Trung tâm quản lý sân</span>
          <h1 className="text-3xl font-extrabold text-[#1a202c] mt-1">
            Xin chào, <span className="text-[#3b82f6]">{user?.fullName || user?.name || 'Quản lý sân'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Theo dõi sân, lịch đặt và doanh thu cọc từ dữ liệu hiện tại.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/owner/fields" className="px-4 py-2.5 rounded-2xl bg-[#60D86E] text-white text-sm font-bold hover:bg-[#45c45a] transition-colors">
            Tạo sân
          </Link>
          <Link to="/owner/bookings" className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-[#1a202c] text-sm font-bold hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors">
            Xem lịch đặt
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Tổng sân" value={fields.length} sub="đang quản lý" color="#1a202c" loading={loading} />
        <KpiCard label="Khung giờ" value="—" sub="xem trong Quản lý sân" color="#3b82f6" loading={loading} />
        <KpiCard label="Chờ cọc" value={summary.pendingCount} sub="đơn chưa thanh toán" color="#f59e0b" loading={loading} />
        <KpiCard label="Cần xử lý" value={summary.actionableCount} sub="đơn đã cọc" color="#60D86E" loading={loading} />
        <KpiCard label="Cọc đã thu" value={fmtCompactCurrency(summary.depositRevenue)} sub={fmtCurrency(summary.depositRevenue)} color="#16a34a" loading={loading} />
        <KpiCard label="Hoàn thành" value={summary.completedCount} sub="đơn đã xong" color="#8b5cf6" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg text-[#1a202c]">Sân đang quản lý</h2>
              <p className="text-xs text-gray-400 mt-0.5">Danh sách sân tải nhanh, khung giờ xem trong trang quản lý.</p>
            </div>
            <Link to="/owner/fields" className="text-sm font-bold text-[#3b82f6] hover:underline">Quản lý</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-9 px-4">
              <p className="text-gray-400 text-sm">Chưa có sân nào.</p>
              <Link to="/owner/fields" className="inline-flex mt-3 text-[#3b82f6] text-sm font-bold hover:underline">Tạo sân ngay</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {visibleFields.map((field) => <FieldStatusBadge key={field.id} field={field} />)}
              {fields.length > visibleFields.length && (
                <Link to="/owner/fields" className="text-center text-xs font-bold text-[#3b82f6] hover:underline py-1">
                  Xem thêm {fields.length - visibleFields.length} sân
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg text-[#1a202c]">Đơn đã cọc cần xử lý</h2>
              <p className="text-xs text-gray-400 mt-0.5">Các đơn sẵn sàng check-in hoặc no-show.</p>
            </div>
            <Link to="/owner/bookings" className="text-sm font-bold text-amber-600 hover:underline">Tất cả</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((item) => <div key={item} className="h-24 bg-amber-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : actionList.length === 0 ? (
            <div className="text-center py-9 px-4">
              <p className="text-gray-400 text-sm">Không có đơn đã cọc cần xử lý.</p>
              <Link to="/owner/bookings" className="inline-flex mt-3 text-amber-600 text-sm font-bold hover:underline">Mở lịch đặt sân</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {actionList.map((booking) => {
                const id = getBookingId(booking)
                const updating = updatingBookingId === id
                const remaining = Math.max((Number(booking.totalAmount) || 0) - (Number(booking.depositAmount) || 0), 0)

                return (
                  <div key={id} className="rounded-2xl p-4 border border-amber-100 bg-amber-50">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#1a202c] text-sm truncate">{getFieldLabel(booking, fieldById)}</span>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          #{shortId(id)} · {fmtDate(booking.bookingDate || booking.createdAt)} · {formatSlotTime(booking)}
                        </p>
                        <p className="text-xs font-bold text-[#60D86E] mt-1">
                          Cọc {fmtCurrency(booking.depositAmount)} · Còn thu {fmtCurrency(remaining)}
                        </p>
                      </div>
                      <div className="flex gap-1.5 sm:mt-1">
                        <button
                          type="button"
                          onClick={() => handleBookingAction(id, bookingService.checkIn, 'COMPLETED')}
                          disabled={updating}
                          className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Check-in
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBookingAction(id, bookingService.markNoShow, 'CANCELLED')}
                          disabled={updating}
                          className="px-3 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-lg hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          No-show
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg text-[#1a202c]">Giao dịch gần đây</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cùng nguồn dữ liệu với màn hình lịch đặt sân.</p>
            </div>
            <Link to="/owner/bookings" className="text-sm font-bold text-[#3b82f6] hover:underline">Xem tất cả</Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => <div key={item} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Chưa có giao dịch nào.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map((booking) => {
                const id = getBookingId(booking)
                const total = Number(booking.totalAmount) || 0
                const deposit = Number(booking.depositAmount) || 0

                return (
                  <div key={id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1a202c] text-sm truncate">{getFieldLabel(booking, fieldById)}</p>
                      <p className="text-xs text-gray-400">
                        #{shortId(id)} · {fmtDate(booking.bookingDate || booking.createdAt)} · {formatSlotTime(booking)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <p className="font-bold text-sm text-[#1a202c]">{fmtCurrency(total)}</p>
                        <p className="text-xs text-[#60D86E] font-bold">Cọc {fmtCurrency(deposit)}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-lg text-[#1a202c] mb-4">Tác vụ nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: '/owner/fields', label: 'Sân & khung giờ', color: '#60D86E', bg: '#F0FDF4', icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
              { to: '/owner/bookings', label: 'Lịch đặt sân', color: '#3b82f6', bg: '#EFF6FF', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
              { to: '/messages', label: 'Tin nhắn', color: '#f59e0b', bg: '#FFFBEB', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center gap-3 min-h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ backgroundColor: item.bg, color: item.color }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
                </div>
                <span className="text-xs font-bold text-gray-600 text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
