import { useState } from 'react'
import reviewService from '../../../services/reviewService'

/**
 * Modal for reviewing an opponent after a completed match.
 * Sends POST /api/reviews with { revieweeId, matchRequestId, reason }
 */
export default function ReviewModal({ isOpen, onClose, bookingId, revieweeId, matchRequestId }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Vui lòng nhập nội dung đánh giá.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await reviewService.createReview({
        revieweeId,
        matchRequestId,
        reason: reason.trim(),
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setReason('')
        onClose(true) // true = review submitted
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#1a202c]">Đánh giá đối thủ</h3>
              <p className="text-xs text-gray-400 mt-0.5">Chia sẻ nhận xét của bạn về trận đấu</p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập nhận xét của bạn về đối thủ (thái độ thi đấu, trình độ, đúng giờ...)..."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all resize-none"
            disabled={submitting || success}
          />

          {error && (
            <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
          )}

          {success && (
            <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#60D86E]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Gửi đánh giá thành công!
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#60D86E] hover:bg-[#45c45a] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
