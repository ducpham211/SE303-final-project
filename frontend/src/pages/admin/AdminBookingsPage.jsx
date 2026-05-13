import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const STATUS_META = {
  PENDING:      { label: 'Chờ cọc',    badge: 'bg-amber-100 text-amber-700'   },
  DEPOSIT_PAID: { label: 'Đã cọc',     badge: 'bg-green-100 text-green-700'   },
  CONFIRMED:    { label: 'Xác nhận',   badge: 'bg-blue-100  text-blue-700'    },
  COMPLETED:    { label: 'Hoàn thành', badge: 'bg-indigo-100 text-indigo-700' },
  CANCELLED:    { label: 'Đã hủy',     badge: 'bg-gray-100  text-gray-500'    },
}

const FILTER_TABS = [
  { key: 'ALL',          label: 'Tất cả'      },
  { key: 'PENDING',      label: 'Chờ cọc'     },
  { key: 'DEPOSIT_PAID', label: 'Đã cọc'      },
  { key: 'COMPLETED',    label: 'Hoàn thành'  },
  { key: 'CANCELLED',    label: 'Đã hủy'      },
]

function fmtCurrency(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)
}
function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('ALL')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    adminService.getTransactions()      // warm-up the dashboard metric
      .catch(() => {})

    // Admin sees all bookings via the shared /api/bookings endpoint
    // (The backend filters based on the JWT role — ADMIN sees all)
    import('../../services/bookingService')
      .then(m => m.default.getMyBookings())
      .then(data => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0)
        )
        setBookings(sorted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const countFor = (key) => key === 'ALL' ? bookings.length : bookings.filter(b => b.status === key).length

  const filtered = (filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter))
    .filter(b => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        (b.fieldName || b.field?.name || '').toLowerCase().includes(q) ||
        (b.bookingId || b.id || '').toLowerCase().includes(q)
      )
    })

  const totalRevenue = bookings
    .filter(b => ['DEPOSIT_PAID', 'COMPLETED'].includes(b.status))
    .reduce((s, b) => s + Number(b.depositAmount || 0), 0)

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-gray-400 hover:text-blue-500 font-medium transition-colors">
            ← Trang chủ
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1a202c] mt-1">Quản lý Lịch đặt sân</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {bookings.length} đơn &middot; Tổng thu:{' '}
            <span className="font-bold text-[#60D86E]">{fmtCurrency(totalRevenue)}</span>
          </p>
        </div>

        {/* Search */}
        <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 mb-4
                          focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên sân hoặc mã đơn..."
            className="flex-1 text-sm outline-none bg-transparent text-[#1a202c] placeholder-gray-400"
          />
        </label>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {FILTER_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === t.key
                  ? 'bg-[#1a202c] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
              {countFor(t.key) > 0 && (
                <span className={`ml-1.5 text-xs ${filter === t.key ? 'opacity-70' : 'opacity-50'}`}>
                  ({countFor(t.key)})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-gray-400 font-medium">Không có đơn đặt nào phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 font-bold border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3">Mã đơn</th>
                    <th className="px-5 py-3">Sân bóng</th>
                    <th className="px-5 py-3">Ngày đặt</th>
                    <th className="px-5 py-3">Giờ chơi</th>
                    <th className="px-5 py-3">Tiền cọc</th>
                    <th className="px-5 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const s = STATUS_META[b.status] || STATUS_META.CANCELLED
                    return (
                      <tr key={b.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-gray-400 text-xs">
                          #{(b.bookingId || b.id || '').slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#1a202c] max-w-[160px] truncate">
                          {b.fieldName || b.field?.name || 'Sân bóng'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{fmtDate(b.bookingDate || b.createdAt)}</td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {fmtTime(b.startTime)}
                          {b.endTime ? ` – ${fmtTime(b.endTime)}` : ''}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#60D86E]">{fmtCurrency(b.depositAmount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                            {s.label}
                          </span>
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
