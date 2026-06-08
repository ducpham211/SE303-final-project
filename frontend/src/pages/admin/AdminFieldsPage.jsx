import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const TYPE_LABEL = {
  FIVE_A_SIDE: 'Sân 5',
  SEVEN_A_SIDE: 'Sân 7',
  ELEVEN_A_SIDE: 'Sân 11',
}

const TYPE_BADGE = {
  FIVE_A_SIDE: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  SEVEN_A_SIDE: 'border-blue-200 bg-blue-100 text-blue-700',
  ELEVEN_A_SIDE: 'border-violet-200 bg-violet-100 text-violet-700',
}

function FieldImage({ field, compact = false }) {
  const [failed, setFailed] = useState(false)
  const size = compact ? 'h-12 w-20 rounded-md' : 'aspect-[16/9] rounded-md'
  return (
    <div className={`${size} overflow-hidden bg-gray-100`}>
      {field.coverImage && !failed ? (
        <img src={field.coverImage} alt={field.name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f3f4f6,#e5e7eb)] text-xs font-bold text-gray-400">
          FIELD
        </div>
      )}
    </div>
  )
}

function FieldDrawer({ field, onClose }) {
  if (!field) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="flex-1" onClick={onClose} aria-label="Đóng" />
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-blue-600">Chi tiết sân</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950">{field.name || 'Sân bóng'}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Đóng</button>
        </div>
        <div className="mt-6"><FieldImage field={field} /></div>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-400">Loại sân</p>
            <span className={`mt-2 inline-flex rounded-md border px-2.5 py-1 text-xs font-black ${TYPE_BADGE[field.type] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>
              {TYPE_LABEL[field.type] || field.type || 'N/A'}
            </span>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-400">Field ID</p>
            <p className="mt-1 break-all font-mono text-xs text-gray-600">{field.id}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-400">Ảnh đại diện</p>
            <p className="mt-1 break-all text-sm text-gray-600">{field.coverImage || 'Chưa có ảnh'}</p>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [view, setView] = useState('table')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getFields()
      setFields(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải danh sách sân.')
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])


  const typeOptions = useMemo(() => Array.from(new Set(fields.map(f => f.type).filter(Boolean))), [fields])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return fields.filter(field => {
      const matchesSearch = !q || field.name?.toLowerCase().includes(q) || field.id?.toLowerCase().includes(q)
      const matchesType = !type || field.type === type
      return matchesSearch && matchesType
    })
  }, [fields, search, type])

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/admin/dashboard" className="text-sm font-bold text-gray-400 hover:text-blue-600">Về dashboard</Link>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Sân bóng</h1>
            <p className="mt-1 text-sm text-gray-500">{fields.length} sân trong hệ thống.</p>
          </div>
          <button onClick={load} disabled={loading} className="w-fit rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50">
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>


        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px_auto]">
            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 focus-within:border-blue-400">
              <span className="text-sm text-gray-400">Tìm</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên sân hoặc id..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
            <select value={type} onChange={e => setType(e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 outline-none">
              <option value="">Tất cả loại sân</option>
              {typeOptions.map(t => <option key={t} value={t}>{TYPE_LABEL[t] || t}</option>)}
            </select>
            <div className="flex rounded-md border border-gray-200 p-1">
              {['table', 'grid'].map(v => (
                <button key={v} onClick={() => setView(v)} className={`rounded px-3 py-1.5 text-sm font-bold ${view === v ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {v === 'table' ? 'Table' : 'Grid'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 animate-pulse rounded-lg bg-white" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-5 rounded-lg border border-gray-200 bg-white px-4 py-16 text-center shadow-sm">
            <p className="font-bold text-gray-800">Không tìm thấy sân phù hợp</p>
            <p className="mt-1 text-sm text-gray-500">Thử đổi từ khóa hoặc bộ lọc loại sân.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(field => (
              <button key={field.id} onClick={() => setSelected(field)} className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition hover:border-blue-200 hover:shadow-md">
                <FieldImage field={field} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-black text-gray-950">{field.name || 'Sân bóng'}</h2>
                      <p className="mt-1 font-mono text-xs text-gray-400">#{field.id?.slice(0, 8)}</p>
                    </div>
                    <span className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-black ${TYPE_BADGE[field.type] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{TYPE_LABEL[field.type] || field.type || 'N/A'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 text-left text-xs font-black uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Sân</th>
                    <th className="px-5 py-3">Loại</th>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(field => (
                    <tr key={field.id} onClick={() => setSelected(field)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FieldImage field={field} compact />
                          <span className="font-bold text-gray-950">{field.name || 'Sân bóng'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className={`rounded-md border px-2.5 py-1 text-xs font-black ${TYPE_BADGE[field.type] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{TYPE_LABEL[field.type] || field.type || 'N/A'}</span></td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{field.id}</td>
                      <td className="px-5 py-4 text-right"><span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-black text-gray-600">Chỉ xem</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      <FieldDrawer field={selected} onClose={() => setSelected(null)} />
    </main>
  )
}
