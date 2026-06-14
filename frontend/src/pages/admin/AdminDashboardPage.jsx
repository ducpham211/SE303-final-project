import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

function fmtCurrency(n) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)
}

function KpiCard({ label, value, helper, tone = 'slate', to, loading }) {
  const tones = {
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    violet: 'border-violet-100 bg-violet-50 text-violet-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-gray-100 bg-gray-50 text-gray-700',
  }

  const content = (
    <div className="h-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
          )}
          {helper && <p className="mt-2 text-sm text-gray-500">{helper}</p>}
        </div>
        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
          {to ? 'Chi tiết' : 'Live'}
        </span>
      </div>
    </div>
  )

  return to ? <Link to={to} className="block h-full">{content}</Link> : content
}

function QuickAction({ to, label, desc, tone }) {
  const tones = {
    rose: 'hover:border-rose-200 hover:bg-rose-50',
    blue: 'hover:border-blue-200 hover:bg-blue-50',
    violet: 'hover:border-violet-200 hover:bg-violet-50',
    amber: 'hover:border-amber-200 hover:bg-amber-50',
  }

  return (
    <Link
      to={to}
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition ${tones[tone]}`}
    >
      <p className="text-sm font-extrabold text-gray-950">{label}</p>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestCountRef = useRef(0)

  const metrics = useMemo(() => ([
    {
      label: 'Doanh thu hệ thống',
      value: fmtCurrency(transactions?.totalSystemRevenue),
      helper: `${transactions?.totalSuccessfulBookings ?? 0} booking thành công`,
      tone: 'green',
    },
    {
      label: 'Người dùng',
      value: overview?.totalUsers ?? 0,
      helper: 'Tài khoản đang có trong hệ thống',
      tone: 'rose',
      to: '/admin/users',
    },
    {
      label: 'Sân bóng',
      value: overview?.totalFields ?? 0,
      helper: 'Sân được ghi nhận',
      tone: 'blue',
      to: '/admin/fields',
    },
    {
      label: 'Trận ghép thành công',
      value: overview?.totalSuccessfulMatches ?? 0,
      helper: 'Kèo đã hoàn tất',
      tone: 'violet',
      to: '/admin/matches',
    },
  ]), [overview, transactions])

  const load = async () => {
    requestCountRef.current += 1
    const currentRequestId = requestCountRef.current
    setLoading(true)
    setError('')
    try {
      const [ov, tx] = await Promise.all([
        adminService.getOverview(),
        adminService.getTransactions(),
      ])
      if (currentRequestId === requestCountRef.current) {
        setOverview(ov)
        setTransactions(tx)
      }
    } catch (e) {
      if (currentRequestId === requestCountRef.current) {
        setError(e?.response?.data?.message || 'Không thể tải dữ liệu dashboard.')
      }
    } finally {
      if (currentRequestId === requestCountRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => { load() }, [])

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Admin Console</p>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Tổng quan hệ thống</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Theo dõi người dùng, sân bóng, giao dịch và các mục cần kiểm duyệt.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="w-fit rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(metric => (
            <KpiCard key={metric.label} {...metric} loading={loading} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-950">Thao tác nhanh</h2>
                <p className="mt-1 text-sm text-gray-500">Đi tới các luồng quản trị đang dùng được.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <QuickAction to="/admin/users" label="Quản lý người dùng" desc="Lọc vai trò, điểm uy tín và kiểm tra hồ sơ." tone="rose" />
              <QuickAction to="/admin/fields" label="Kiểm duyệt sân" desc="Xem danh sách sân, loại sân và ảnh đại diện." tone="blue" />
              <QuickAction to="/admin/matches" label="Bài đăng ghép kèo" desc="Theo dõi bài tìm đối thủ và trạng thái kèo." tone="violet" />
              <QuickAction to="/admin/reviews" label="Xử lý vi phạm" desc="Duyệt review bị AI chuyển sang admin." tone="amber" />
            </div>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-amber-700">Cần xử lý</p>
            <h2 className="mt-2 text-2xl font-black text-gray-950">Kiểm duyệt Fair-Play</h2>
            <p className="mt-2 text-sm text-amber-800">
              Các đánh giá ở trạng thái chờ xử lý cần admin xác nhận phạt hoặc bác bỏ.
            </p>
            <Link
              to="/admin/reviews"
              className="mt-5 inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Mở hàng chờ
            </Link>
          </section>
        </div>
      </section>
    </main>
  )
}
