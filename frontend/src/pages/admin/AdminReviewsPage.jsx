import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const STATUS_META = {
  PENDING: { label: 'Chờ xử lý', badge: 'border-amber-200 bg-amber-100 text-amber-700' },
  RESOLVED: { label: 'Đã xử lý', badge: 'border-red-200 bg-red-100 text-red-700' },
  REJECTED: { label: 'Đã bác bỏ', badge: 'border-emerald-200 bg-emerald-100 text-emerald-700' },
}

function severity(penalty) {
  const value = Math.abs(Number(penalty) || 0)
  if (value >= 30) return { label: 'Nặng', badge: 'border-red-200 bg-red-100 text-red-700' }
  if (value >= 10) return { label: 'Trung bình', badge: 'border-amber-200 bg-amber-100 text-amber-700' }
  return { label: 'Nhẹ', badge: 'border-emerald-200 bg-emerald-100 text-emerald-700' }
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function ReviewDrawer({ review, onClose, onAdjudicate }) {
  if (!review) return null
  const status = STATUS_META[review.status] || STATUS_META.PENDING
  const level = severity(review.aiSuggestedPenalty)
  const rows = [
    ['Review ID', review.id],
    ['Reviewer ID', review.reviewerId || 'N/A'],
    ['Reviewee ID', review.revieweeId || 'N/A'],
    ['Match Request ID', review.matchRequestId || 'N/A'],
    ['Điểm đã thay đổi', review.scoreChange ?? 'N/A'],
    ['Tạo lúc', fmtDate(review.createdAt)],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="flex-1" onClick={onClose} aria-label="Đóng" />
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Chi tiết review</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950">{status.label}</h2>
            <p className="mt-1 text-sm text-gray-500">{fmtDate(review.createdAt)}</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Đóng</button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${status.badge}`}>{status.label}</span>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${level.badge}`}>{level.label}</span>
          {review.aiSuggestedPenalty != null && <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-black text-gray-700">AI: -{Math.abs(review.aiSuggestedPenalty)}</span>}
          {review.isToxic && <span className="rounded-md border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">⚠️ AI: Toxic</span>}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-bold uppercase text-gray-400">Lý do</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{review.reason || 'Không có lý do.'}</p>
        </div>

        {review.aiReason && (
          <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
            <p className="text-xs font-bold uppercase text-purple-600">AI Phân Tích & Giải Thích</p>
            <p className="mt-2 text-sm leading-6 text-purple-900 font-medium">{review.aiReason}</p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
              <p className="mt-1 break-all font-mono text-xs text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        {review.status === 'PENDING' && (
          <button onClick={() => onAdjudicate(review)} className="mt-5 w-full rounded-md bg-gray-950 px-4 py-2.5 text-sm font-black text-white hover:bg-gray-800">
            Mở phán quyết
          </button>
        )}
      </aside>
    </div>
  )
}

function AdjudicateModal({ review, onClose, onDone }) {
  const [approve, setApprove] = useState(true)
  const [finalPenalty, setFinalPenalty] = useState(Math.abs(Number(review?.aiSuggestedPenalty) || 10))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const validPenalty = !approve || (finalPenalty >= 1 && finalPenalty <= 100)

  const submit = async () => {
    setErr('')
    if (!validPenalty) {
      setErr('Điểm phạt phải nằm trong khoảng 1 đến 100.')
      return
    }
    const ok = window.confirm(approve
      ? `Xác nhận trừ ${finalPenalty} điểm uy tín?`
      : 'Xác nhận bác bỏ tố cáo này?')
    if (!ok) return

    setSaving(true)
    try {
      await adminService.adjudicateReview(review.id, { approve, finalPenalty: approve ? finalPenalty : 0 })
      onDone()
      onClose()
    } catch (e) {
      setErr(e?.response?.data?.message || 'Không thể lưu phán quyết.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Phán quyết admin</p>
            <h3 className="mt-1 text-xl font-black text-gray-950">Review chờ xử lý</h3>
          </div>
          <button onClick={onClose} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Đóng</button>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-400">Lý do tố cáo</p>
          <p className="mt-2 max-h-28 overflow-y-auto text-sm leading-6 text-gray-700">{review.reason || 'Không có lý do.'}</p>
          <p className="mt-3 text-sm font-bold text-amber-700">AI đề xuất: -{Math.abs(Number(review.aiSuggestedPenalty) || 0)} điểm</p>
          {review.aiReason && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-purple-700">
              <span className="font-bold">AI giải thích:</span> {review.aiReason}
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setApprove(true)} className={`rounded-md border px-3 py-2 text-sm font-black ${approve ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Xác nhận phạt
          </button>
          <button onClick={() => setApprove(false)} className={`rounded-md border px-3 py-2 text-sm font-black ${!approve ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Bác bỏ
          </button>
        </div>

        {approve && (
          <label className="mt-4 block">
            <span className="text-sm font-bold text-gray-700">Điểm uy tín bị trừ</span>
            <input type="number" min="1" max="100" value={finalPenalty} onChange={e => setFinalPenalty(Number(e.target.value))} className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none ${validPenalty ? 'border-gray-200 focus:border-red-400' : 'border-red-300'}`} />
          </label>
        )}

        {err && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</div>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
          <button onClick={submit} disabled={saving || !validPenalty} className="flex-1 rounded-md bg-gray-950 px-4 py-2 text-sm font-black text-white hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [reviewPage, setReviewPage] = useState(0)
  const [reviewStatus, setReviewStatus] = useState('PENDING')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [adjudicating, setAdjudicating] = useState(null)
  const [toast, setToast] = useState('')
  const requestCountRef = useRef(0)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const loadReviews = useCallback(async () => {
    requestCountRef.current += 1
    const currentRequestId = requestCountRef.current
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getReviews({ status: reviewStatus || undefined, page: reviewPage, size: 12 })
      if (currentRequestId === requestCountRef.current) {
        setReviews(data)
      }
    } catch (e) {
      if (currentRequestId === requestCountRef.current) {
        setError(e?.response?.data?.message || 'Không thể tải danh sách review.')
        setReviews({ content: [], totalPages: 0, totalElements: 0 })
      }
    } finally {
      if (currentRequestId === requestCountRef.current) {
        setLoading(false)
      }
    }
  }, [reviewStatus, reviewPage])

  useEffect(() => { loadReviews() }, [loadReviews])
  useEffect(() => { setReviewPage(0) }, [reviewStatus])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (reviews.content || []).filter(r =>
      !q ||
      r.reason?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q) ||
      r.reviewerId?.toLowerCase().includes(q) ||
      r.revieweeId?.toLowerCase().includes(q)
    )
  }, [reviews.content, search])

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/admin/dashboard" className="text-sm font-bold text-gray-400 hover:text-rose-600">Về dashboard</Link>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Kiểm duyệt vi phạm</h1>
            <p className="mt-1 text-sm text-gray-500">Duyệt review bị AI chuyển sang hàng chờ admin.</p>
          </div>
          <button onClick={loadReviews} disabled={loading} className="w-fit rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50">
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        {toast && <div className="fixed right-6 top-24 z-50 rounded-md bg-gray-950 px-4 py-3 text-sm font-bold text-white shadow-lg">{toast}</div>}

        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: '', label: 'Tất cả' },
                { key: 'PENDING', label: 'Chờ xử lý' },
                { key: 'RESOLVED', label: 'Đã xử lý' },
                { key: 'REJECTED', label: 'Đã bác bỏ' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setReviewStatus(tab.key)} className={`rounded-md border px-3 py-1.5 text-sm font-black ${reviewStatus === tab.key ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <label className="flex min-w-0 items-center gap-2 rounded-md border border-gray-200 px-3 py-2 focus-within:border-rose-400 lg:w-80">
              <span className="text-sm text-gray-400">Tìm</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Lý do hoặc id..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-5 space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-pulse rounded-lg bg-white" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-5 rounded-lg border border-gray-200 bg-white px-4 py-16 text-center shadow-sm">
            <p className="font-bold text-gray-800">Không có review phù hợp</p>
            <p className="mt-1 text-sm text-gray-500">Hàng chờ hiện tại không có mục cần hiển thị.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {filtered.map(r => {
              const status = STATUS_META[r.status] || STATUS_META.PENDING
              const level = severity(r.aiSuggestedPenalty)
              return (
                <article key={r.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <button type="button" onClick={() => setSelected(r)} className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${status.badge}`}>{status.label}</span>
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${level.badge}`}>{level.label}</span>
                        {r.aiSuggestedPenalty != null && <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-black text-gray-700">AI: -{Math.abs(r.aiSuggestedPenalty)}</span>}
                        {r.isToxic && <span className="rounded-md border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">⚠️ AI: Toxic</span>}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-950">Lý do: <span className="font-normal text-gray-600">{r.reason || 'Không có lý do.'}</span></p>
                      <p className="mt-2 font-mono text-xs text-gray-400">#{r.id?.slice(0, 8)} · {fmtDate(r.createdAt)}</p>
                    </button>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => setSelected(r)} className="rounded-md border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Chi tiết</button>
                      {r.status === 'PENDING' && <button onClick={() => setAdjudicating(r)} className="rounded-md bg-rose-600 px-3 py-2 text-sm font-black text-white hover:bg-rose-700">Phán quyết</button>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {reviews.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button disabled={reviewPage === 0} onClick={() => setReviewPage(p => p - 1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">Trước</button>
            <span className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700">Trang {reviewPage + 1} / {reviews.totalPages}</span>
            <button disabled={reviewPage + 1 >= reviews.totalPages} onClick={() => setReviewPage(p => p + 1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">Tiếp</button>
          </div>
        )}
      </section>

      <ReviewDrawer review={selected} onClose={() => setSelected(null)} onAdjudicate={(r) => { setSelected(null); setAdjudicating(r) }} />
      {adjudicating && (
        <AdjudicateModal
          review={adjudicating}
          onClose={() => setAdjudicating(null)}
          onDone={() => { showToast('Đã lưu phán quyết.'); loadReviews() }}
        />
      )}
    </main>
  )
}
