import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const ROLE_OPTS = [
  { value: '',       label: 'Tất cả vai trò' },
  { value: 'PLAYER', label: 'Người chơi'    },
  { value: 'OWNER',  label: 'Chủ sân'       },
  { value: 'ADMIN',  label: 'Quản trị viên' },
]

const ROLE_BADGE = {
  PLAYER: 'bg-green-100 text-green-700',
  OWNER:  'bg-blue-100  text-blue-700',
  ADMIN:  'bg-rose-100  text-rose-700',
}

/** Visual trust-score bar */
function TrustBar({ score }) {
  const pct   = Math.min(100, Math.max(0, score ?? 100))
  const color = pct >= 70 ? '#60D86E' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300"
             style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>{pct}</span>
    </div>
  )
}

export default function AdminUsersPage() {
  const [page,    setPage]    = useState(0)
  const [role,    setRole]    = useState('')
  const [search,  setSearch]  = useState('')
  const [result,  setResult]  = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers({ role: role || undefined, page, size: 15 })
      setResult(data)
    } catch {
      setResult({ content: [], totalElements: 0, totalPages: 0 })
    } finally { setLoading(false) }
  }, [role, page])

  // Reset page when filter changes
  useEffect(() => { setPage(0) }, [role])
  useEffect(() => { load() },    [load])

  // Client-side search within current page
  const users = (result.content || []).filter(u =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-gray-400 hover:text-rose-500 font-medium transition-colors">
            ← Trang chủ
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1a202c] mt-1">Quản lý Người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {result.totalElements} tài khoản trong hệ thống
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl
                            px-4 py-2.5 flex-1 focus-within:border-rose-400 focus-within:ring-2
                            focus-within:ring-rose-100 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="flex-1 text-sm outline-none bg-transparent text-[#1a202c] placeholder-gray-400"
            />
          </label>
          {/* Role filter */}
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-semibold
                       text-gray-700 outline-none focus:border-rose-400 transition-colors"
          >
            {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {/* Reset */}
          {(search || role) && (
            <button
              onClick={() => { setSearch(''); setRole(''); setPage(0) }}
              className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-semibold
                         text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Đặt lại
            </button>
          )}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e23670" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="font-medium text-gray-700">Không tìm thấy người dùng nào</p>
              <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 font-bold border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3">Người dùng</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Vai trò</th>
                    <th className="px-5 py-3">Điểm uy tín</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      {/* Avatar + name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500
                                          flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
                            {(u.fullName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#1a202c] truncate max-w-[160px]">
                            {u.fullName || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 truncate max-w-[200px]">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <TrustBar score={u.trustScore} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {result.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold
                         disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 font-medium">
              Trang {page + 1} / {result.totalPages}
            </span>
            <button
              disabled={page + 1 >= result.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold
                         disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Tiếp →
            </button>
          </div>
        )}

      </section>
    </main>
  )
}
