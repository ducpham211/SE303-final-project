import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const TYPE_LABEL = {
  FIVE_A_SIDE: 'Sân 5',
  SEVEN_A_SIDE: 'Sân 7',
  ELEVEN_A_SIDE: 'Sân 11',
}

const TYPE_BADGE = {
  FIVE_A_SIDE: 'bg-green-100 text-green-700',
  SEVEN_A_SIDE: 'bg-blue-100 text-blue-700',
  ELEVEN_A_SIDE: 'bg-purple-100 text-purple-700',
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getFields()
      .then(data => setFields(Array.isArray(data) ? data : []))
      .catch(e => {
        setError(e?.response?.data?.message || 'Không thể tải danh sách sân.')
        setFields([])
      })
      .finally(() => setLoading(false))
  }, [])

  const typeOptions = useMemo(() => {
    const types = new Set(fields.map(f => f.type).filter(Boolean))
    return Array.from(types)
  }, [fields])

  const filtered = fields.filter(field => {
    const matchesSearch = !search || field.name?.toLowerCase().includes(search.toLowerCase())
    const matchesType = !type || field.type === type
    return matchesSearch && matchesType
  })

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-gray-400 hover:text-blue-500 font-medium transition-colors">
            ← Trang chủ
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1a202c] mt-1">Kiểm duyệt Sân bóng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {fields.length} sân trong hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3 mb-5">
          <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên sân..."
              className="flex-1 text-sm outline-none bg-transparent text-[#1a202c] placeholder-gray-400"
            />
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">Tất cả loại sân</option>
            {typeOptions.map(t => (
              <option key={t} value={t}>{TYPE_LABEL[t] || t}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-56 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-medium">Không tìm thấy sân phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(field => (
              <article key={field.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="aspect-[16/9] bg-gray-100">
                  {field.coverImage ? (
                    <img
                      src={field.coverImage}
                      alt={field.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-bold text-[#1a202c] truncate">{field.name || 'Sân bóng'}</h2>
                      <p className="text-xs text-gray-400 mt-1 font-mono">#{field.id?.slice(0, 8)?.toUpperCase()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${TYPE_BADGE[field.type] || 'bg-gray-100 text-gray-600'}`}>
                      {TYPE_LABEL[field.type] || field.type || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    Chế độ hiện tại: chỉ xem dữ liệu kiểm duyệt.
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
