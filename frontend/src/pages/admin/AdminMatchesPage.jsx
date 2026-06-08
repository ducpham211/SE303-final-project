import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const POST_TYPE_LABEL = {
  FIND_OPPONENT: 'Tìm đối thủ',
  FIND_MEMBER: 'Tìm đồng đội',
}

const LEVEL_LABEL = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
}

const LEVEL_BADGE = {
  BEGINNER: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  INTERMEDIATE: 'border-amber-200 bg-amber-100 text-amber-700',
  ADVANCED: 'border-red-200 bg-red-100 text-red-700',
}

const STATUS_BADGE = {
  OPEN: 'border-blue-200 bg-blue-100 text-blue-700',
  MATCHED: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  CLOSED: 'border-gray-200 bg-gray-100 text-gray-700',
  CANCELLED: 'border-red-200 bg-red-100 text-red-700',
}

function fmtDateTime(value) {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function MatchDrawer({ post, onClose }) {
  if (!post) return null
  const rows = [
    ['Post ID', post.id],
    ['User ID', post.userId],
    ['Team ID', post.teamId],
    ['Field ID', post.fieldId],
    ['Booking ID', post.bookingId || 'Chưa gắn booking'],
    ['Chia phí', post.costSharing || 'N/A'],
    ['Tạo lúc', fmtDateTime(post.createdAt)],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="flex-1" onClick={onClose} aria-label="Đóng" />
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-violet-600">Chi tiết bài đăng</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950">{POST_TYPE_LABEL[post.postType] || post.postType || 'Bài ghép kèo'}</h2>
            <p className="mt-1 text-sm text-gray-500">{fmtDateTime(post.timeStart)} - {fmtDateTime(post.timeEnd)}</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Đóng</button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${LEVEL_BADGE[post.skillLevel] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{LEVEL_LABEL[post.skillLevel] || post.skillLevel || 'N/A'}</span>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${STATUS_BADGE[post.status] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{post.status || 'N/A'}</span>
          {post.bookingId && <span className="rounded-md border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">Đã đặt sân</span>}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-bold uppercase text-gray-400">Nội dung</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{post.message || 'Không có nội dung.'}</p>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
              <p className="mt-1 break-all font-mono text-xs text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default function AdminMatchesPage() {
  const [posts, setPosts] = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [postPage, setPostPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [postType, setPostType] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getMatchPosts({ page: postPage, size: 12, skillLevel: skillLevel || undefined, postType: postType || undefined })
      setPosts(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải bài đăng ghép kèo.')
      setPosts({ content: [], totalPages: 0, totalElements: 0 })
    } finally {
      setLoading(false)
    }
  }, [postPage, skillLevel, postType])

  useEffect(() => { loadPosts() }, [loadPosts])
  useEffect(() => { setPostPage(0) }, [skillLevel, postType])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (posts.content || []).filter(post =>
      !q ||
      post.message?.toLowerCase().includes(q) ||
      post.id?.toLowerCase().includes(q) ||
      post.teamId?.toLowerCase().includes(q) ||
      post.fieldId?.toLowerCase().includes(q)
    )
  }, [posts.content, search])

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/admin/dashboard" className="text-sm font-bold text-gray-400 hover:text-violet-600">Về dashboard</Link>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Bài đăng ghép kèo</h1>
            <p className="mt-1 text-sm text-gray-500">{posts.totalElements || 0} bài đăng trong hệ thống.</p>
          </div>
          <button onClick={loadPosts} disabled={loading} className="w-fit rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50">
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 focus-within:border-violet-400">
              <span className="text-sm text-gray-400">Tìm</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nội dung, id đội, id sân..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
            <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 outline-none">
              <option value="">Tất cả trình độ</option>
              {Object.entries(LEVEL_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select value={postType} onChange={e => setPostType(e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 outline-none">
              <option value="">Tất cả loại bài</option>
              {Object.entries(POST_TYPE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <button onClick={() => { setSearch(''); setSkillLevel(''); setPostType(''); setPostPage(0) }} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
              Đặt lại
            </button>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 animate-pulse rounded-lg bg-white" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-5 rounded-lg border border-gray-200 bg-white px-4 py-16 text-center shadow-sm">
            <p className="font-bold text-gray-800">Không có bài đăng phù hợp</p>
            <p className="mt-1 text-sm text-gray-500">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(post => (
              <button key={post.id} onClick={() => setSelected(post)} className="flex min-h-52 flex-col rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-violet-600">{POST_TYPE_LABEL[post.postType] || post.postType || 'Bài đăng'}</p>
                    <h2 className="mt-1 truncate text-lg font-black text-gray-950">{post.teamName || 'Đội tìm kèo'}</h2>
                  </div>
                  <span className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-black ${STATUS_BADGE[post.status] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{post.status || 'N/A'}</span>
                </div>

                <p className="mt-3 h-12 overflow-hidden text-sm leading-6 text-gray-600">{post.message || 'Không có nội dung.'}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${LEVEL_BADGE[post.skillLevel] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>{LEVEL_LABEL[post.skillLevel] || post.skillLevel || 'N/A'}</span>
                  {post.bookingId && <span className="rounded-md border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">Đã đặt sân</span>}
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <div className="flex justify-between gap-3"><span>Bắt đầu</span><strong className="text-gray-800">{fmtDateTime(post.timeStart)}</strong></div>
                  <div className="mt-1 flex justify-between gap-3"><span>Chi phí</span><strong className="text-gray-800">{post.costSharing || 'N/A'}</strong></div>
                </div>
              </button>
            ))}
          </div>
        )}

        {posts.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button disabled={postPage === 0} onClick={() => setPostPage(p => p - 1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">Trước</button>
            <span className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700">Trang {postPage + 1} / {posts.totalPages}</span>
            <button disabled={postPage + 1 >= posts.totalPages} onClick={() => setPostPage(p => p + 1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">Tiếp</button>
          </div>
        )}
      </section>

      <MatchDrawer post={selected} onClose={() => setSelected(null)} />
    </main>
  )
}
