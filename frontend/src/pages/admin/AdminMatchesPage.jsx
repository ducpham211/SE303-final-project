import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

/* ─── Match Post Section ──────────────────────────────────────────────── */
const POST_TYPE_LABEL  = { FIND_OPPONENT: 'Tìm đối thủ', FIND_TEAMMATE: 'Tìm đồng đội' }
const LEVEL_BADGE      = {
  BEGINNER:     'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100 text-red-700',
}
const LEVEL_LABEL = { BEGINNER: 'Yếu', INTERMEDIATE: 'Trung bình', ADVANCED: 'Khá / Phủi cứng' }

/* ─── Review Section ─────────────────────────────────────────────────── */
const REVIEW_STATUS_META = {
  PENDING_ADMIN_REVIEW: { label: 'Chờ xử lý',     badge: 'bg-amber-100 text-amber-700' },
  AUTO_PASSED:          { label: 'Tự động duyệt',  badge: 'bg-green-100 text-green-700' },
  PENALIZED:            { label: 'Bị phạt',        badge: 'bg-red-100   text-red-700'   },
}

/** Adjudication modal */
function AdjudicateModal({ review, onClose, onDone }) {
  const [approve,      setApprove]      = useState(true)
  const [finalPenalty, setFinalPenalty] = useState(review?.aiSuggestedPenalty ?? 10)
  const [saving,       setSaving]       = useState(false)
  const [err,          setErr]          = useState('')

  const submit = async () => {
    setSaving(true); setErr('')
    try {
      await adminService.adjudicateReview(review.id, { approve, finalPenalty: approve ? finalPenalty : 0 })
      onDone()
      onClose()
    } catch (e) {
      setErr(e?.response?.data?.message || 'Không thể lưu phán quyết.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-extrabold text-[#1a202c]">Phán quyết vi phạm</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">✕</button>
        </div>

        {/* Review info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm space-y-1.5">
          <p><span className="text-gray-400 font-medium">Lý do tố cáo: </span><span className="font-semibold">{review.reason || '—'}</span></p>
          <p><span className="text-gray-400 font-medium">AI đề xuất phạt: </span>
            <span className="font-bold text-amber-600">{review.aiSuggestedPenalty ?? '—'} điểm</span></p>
        </div>

        {/* Decision */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setApprove(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
              approve ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            ✗ Xác nhận phạt
          </button>
          <button
            onClick={() => setApprove(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
              !approve ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            ✓ Bác bỏ tố cáo
          </button>
        </div>

        {approve && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1a202c] mb-1.5">
              Số điểm uy tín bị trừ
            </label>
            <input
              type="number" min="1" max="100"
              value={finalPenalty}
              onChange={e => setFinalPenalty(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm
                         outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>
        )}

        {err && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl mb-3">{err}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-full bg-[#1a202c] text-white text-sm font-bold
                       hover:brightness-110 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function AdminMatchesPage() {
  const [tab,           setTab]           = useState('posts')   // 'posts' | 'reviews'
  const [posts,         setPosts]         = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [reviews,       setReviews]       = useState({ content: [], totalPages: 0 })
  const [postPage,      setPostPage]      = useState(0)
  const [reviewPage,    setReviewPage]    = useState(0)
  const [reviewStatus,  setReviewStatus]  = useState('')
  const [loading,       setLoading]       = useState(false)
  const [adjudicating,  setAdjudicating]  = useState(null) // review object | null
  const [toast,         setToast]         = useState({ msg: '', type: 'ok' })

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 3000)
  }

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getMatchPosts({ page: postPage, size: 12 })
      setPosts(data)
    } catch { setPosts({ content: [], totalPages: 0, totalElements: 0 }) }
    finally { setLoading(false) }
  }, [postPage])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getReviews({ status: reviewStatus || undefined, page: reviewPage, size: 12 })
      setReviews(data)
    } catch { setReviews({ content: [], totalPages: 0 }) }
    finally { setLoading(false) }
  }, [reviewStatus, reviewPage])

  useEffect(() => { if (tab === 'posts')   loadPosts()   }, [loadPosts,   tab])
  useEffect(() => { if (tab === 'reviews') loadReviews() }, [loadReviews, tab])
  useEffect(() => { setReviewPage(0) }, [reviewStatus])

  const handleDeletePost = async (postId, title) => {
    if (!confirm(`Xoá bài đăng "${title}"?`)) return
    try {
      await adminService.deleteMatchPost(postId)
      showToast('Đã xoá bài đăng.')
      loadPosts()
    } catch (e) {
      showToast(e?.response?.data?.message || 'Không thể xoá bài đăng.', 'err')
    }
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-gray-400 hover:text-purple-500 font-medium transition-colors">
            ← Trang chủ
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1a202c] mt-1">Kèo Ghép Trận & Đánh giá Vi phạm</h1>
        </div>

        {/* Toast */}
        {toast.msg && (
          <div className={`fixed top-20 right-6 z-50 px-4 py-3 text-white text-sm font-semibold rounded-2xl shadow-lg ${
            toast.type === 'err' ? 'bg-red-500' : 'bg-[#1a202c]'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('posts')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'posts'
                ? 'bg-[#8b5cf6] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Bài đăng Kèo ({posts.totalElements || 0})
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'reviews'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Đánh giá Vi phạm
          </button>
        </div>

        {/* ── TAB: MATCH POSTS ── */}
        {tab === 'posts' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-36 bg-white rounded-3xl animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : (posts.content || []).length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-medium">Chưa có bài đăng nào trong hệ thống.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(posts.content || []).map(post => (
                  <div
                    key={post.id}
                    className={`bg-white rounded-3xl p-5 border shadow-sm flex flex-col gap-3 ${
                      post.bookingId ? 'border-purple-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1a202c] truncate">{post.teamName || post.title || 'Đội tìm kèo'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {POST_TYPE_LABEL[post.postType] || post.postType}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {post.bookingId && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">✓ Xịn</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_BADGE[post.skillLevel] || 'bg-gray-100 text-gray-500'}`}>
                          {LEVEL_LABEL[post.skillLevel] || post.skillLevel || '?'}
                        </span>
                      </div>
                    </div>

                    {post.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                    )}

                    <div className="flex justify-end mt-auto">
                      <button
                        onClick={() => handleDeletePost(post.id, post.teamName || post.title)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                                   text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        Xoá bài
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Post pagination */}
            {posts.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button disabled={postPage === 0} onClick={() => setPostPage(p => p - 1)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50">
                  ← Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-500 font-medium">
                  {postPage + 1} / {posts.totalPages}
                </span>
                <button disabled={postPage + 1 >= posts.totalPages} onClick={() => setPostPage(p => p + 1)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50">
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── TAB: REVIEWS ── */}
        {tab === 'reviews' && (
          <>
            {/* Review status filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[
                { key: '',                     label: 'Tất cả'         },
                { key: 'PENDING_ADMIN_REVIEW', label: 'Chờ xử lý'     },
                { key: 'AUTO_PASSED',          label: 'Tự động duyệt' },
                { key: 'PENALIZED',            label: 'Đã phạt'       },
              ].map(t => (
                <button key={t.key} onClick={() => setReviewStatus(t.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    reviewStatus === t.key
                      ? 'bg-rose-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-3xl animate-pulse border border-gray-100" />)}
              </div>
            ) : (reviews.content || []).length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-medium">Không có đánh giá nào cần xử lý.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(reviews.content || []).map(r => {
                  const s = REVIEW_STATUS_META[r.status] || REVIEW_STATUS_META.AUTO_PASSED
                  return (
                    <div key={r.id}
                         className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm
                                    flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>{s.label}</span>
                          {r.aiSuggestedPenalty != null && (
                            <span className="text-xs text-amber-600 font-semibold">
                              AI gợi ý: -{r.aiSuggestedPenalty} điểm
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-[#1a202c] text-sm">
                          Lý do: <span className="font-normal text-gray-600">{r.reason || '(Không có lý do)'}</span>
                        </p>
                        {r.scoreChange != null && (
                          <p className="text-xs text-gray-400 mt-0.5">Điểm đã thay đổi: {r.scoreChange}</p>
                        )}
                      </div>

                      {r.status === 'PENDING_ADMIN_REVIEW' && (
                        <button
                          onClick={() => setAdjudicating(r)}
                          className="flex-shrink-0 px-4 py-2 rounded-full bg-rose-500 text-white
                                     text-xs font-bold hover:bg-rose-600 transition-colors"
                        >
                          Phán quyết
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Review pagination */}
            {reviews.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button disabled={reviewPage === 0} onClick={() => setReviewPage(p => p - 1)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50">
                  ← Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-500 font-medium">
                  {reviewPage + 1} / {reviews.totalPages}
                </span>
                <button disabled={reviewPage + 1 >= reviews.totalPages} onClick={() => setReviewPage(p => p + 1)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50">
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}

      </section>

      {/* Adjudication modal */}
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
