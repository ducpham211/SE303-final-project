import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const ROLES = [
  { value: '', label: 'Tất cả' },
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'OWNER', label: 'Quản lý sân' },
  { value: 'PLAYER', label: 'Người chơi' },
]

const ROLE_BADGE = {
  ADMIN: 'bg-rose-100 text-rose-700 border-rose-200',
  OWNER: 'bg-blue-100 text-blue-700 border-blue-200',
  PLAYER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

function TrustBar({ score }) {
  const pct = Math.min(100, Math.max(0, Number(score ?? 100)))
  const color = pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#dc2626'
  return (
    <div className="flex min-w-[120px] items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right text-xs font-black" style={{ color }}>{pct}</span>
    </div>
  )
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  const copy = async (e) => {
    e.stopPropagation()
    if (!value) return
    await navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-gray-200 px-2 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50"
    >
      {copied ? 'Đã copy' : label}
    </button>
  )
}

function UserDrawer({ user, onClose }) {
  if (!user) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="flex-1" onClick={onClose} aria-label="Đóng" />
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Hồ sơ người dùng</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950">{user.fullName || 'Chưa có tên'}</h2>
            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50">
            Đóng
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-400">Vai trò</p>
            <span className={`mt-2 inline-flex rounded-md border px-2.5 py-1 text-xs font-black ${ROLE_BADGE[user.role] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>
              {user.role || 'N/A'}
            </span>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-400">Điểm uy tín</p>
            <div className="mt-3"><TrustBar score={user.trustScore} /></div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-gray-400">Email</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-800">{user.email || 'N/A'}</p>
              </div>
              <CopyButton value={user.email} label="Copy" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-gray-400">User ID</p>
                <p className="mt-1 truncate font-mono text-xs text-gray-600">{user.id}</p>
              </div>
              <CopyButton value={user.id} label="Copy ID" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [role, setRole] = useState('')
  const [minTrustScore, setMinTrustScore] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'trustScore', dir: 'desc' })
  const [result, setResult] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const requestCountRef = useRef(0)

  const load = useCallback(async () => {
    requestCountRef.current += 1
    const currentRequestId = requestCountRef.current
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getUsers({
        role: role || undefined,
        minTrustScore: minTrustScore === '' ? undefined : Number(minTrustScore),
        page,
        size: 15,
      })
      if (currentRequestId === requestCountRef.current) {
        setResult(data)
      }
    } catch (e) {
      if (currentRequestId === requestCountRef.current) {
        setError(e?.response?.data?.message || 'Không thể tải danh sách người dùng.')
        setResult({ content: [], totalElements: 0, totalPages: 0 })
      }
    } finally {
      if (currentRequestId === requestCountRef.current) {
        setLoading(false)
      }
    }
  }, [role, minTrustScore, page])

  useEffect(() => { setPage(0) }, [role, minTrustScore])
  useEffect(() => { load() }, [load])


  const users = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = (result.content || []).filter(u =>
      !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    )
    return [...filtered].sort((a, b) => {
      const aVal = a[sort.key] ?? ''
      const bVal = b[sort.key] ?? ''
      const result = typeof aVal === 'number' || typeof bVal === 'number'
        ? Number(aVal) - Number(bVal)
        : String(aVal).localeCompare(String(bVal), 'vi')
      return sort.dir === 'asc' ? result : -result
    })
  }, [result.content, search, sort])

  const changeSort = (key) => {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' })
  }

  const pages = useMemo(() => {
    const total = result.totalPages || 0
    return Array.from({ length: total }, (_, i) => i)
      .filter(i => i === 0 || i === total - 1 || Math.abs(i - page) <= 1)
  }, [page, result.totalPages])

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/admin/dashboard" className="text-sm font-bold text-gray-400 hover:text-rose-600">Về dashboard</Link>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Người dùng</h1>
            <p className="mt-1 text-sm text-gray-500">{result.totalElements || 0} tài khoản trong hệ thống.</p>
          </div>
          <button onClick={load} disabled={loading} className="w-fit rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50">
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>


        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 focus-within:border-rose-400">
              <span className="text-sm text-gray-400">Tìm</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tên, email hoặc id..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
              <span className="text-sm font-bold text-gray-500">Uy tín ≥</span>
              <input
                type="number"
                min="0"
                max="100"
                value={minTrustScore}
                onChange={e => setMinTrustScore(e.target.value)}
                className="w-16 bg-transparent text-sm outline-none"
              />
            </label>
            <button
              onClick={() => { setSearch(''); setRole(''); setMinTrustScore(''); setPage(0) }}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Đặt lại
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ROLES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRole(opt.value)}
                className={`rounded-md border px-3 py-1.5 text-sm font-bold ${
                  role === opt.value
                    ? 'border-gray-950 bg-gray-950 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="space-y-2 p-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />)}</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <p className="font-bold text-gray-800">Không tìm thấy người dùng</p>
              <p className="mt-1 text-sm text-gray-500">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs font-black uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3"><button onClick={() => changeSort('fullName')}>Người dùng</button></th>
                    <th className="px-5 py-3"><button onClick={() => changeSort('email')}>Email</button></th>
                    <th className="px-5 py-3"><button onClick={() => changeSort('role')}>Vai trò</button></th>
                    <th className="px-5 py-3"><button onClick={() => changeSort('trustScore')}>Điểm uy tín</button></th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} onClick={() => setSelected(u)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-950 text-sm font-black text-white">
                            {(u.fullName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-gray-950">{u.fullName || 'Chưa có tên'}</p>
                            <p className="font-mono text-xs text-gray-400">#{u.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${ROLE_BADGE[u.role] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-4"><TrustBar score={u.trustScore} /></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <CopyButton value={u.email} label="Email" />
                          <CopyButton value={u.id} label="ID" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {result.totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">Trước</button>
            {pages.map((p, idx) => (
              <button
                key={`${p}-${idx}`}
                onClick={() => setPage(p)}
                className={`h-9 min-w-9 rounded-md border px-3 text-sm font-black ${page === p ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-600'}`}
              >
                {p + 1}
              </button>
            ))}
            <button disabled={page + 1 >= result.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">Tiếp</button>
          </div>
        )}
      </section>

      <UserDrawer user={selected} onClose={() => setSelected(null)} />
    </main>
  )
}
