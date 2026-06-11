import api from './api'

/**
 * Admin service — wraps all /api/admin/* endpoints.
 *
 * ─── Users ────────────────────────────────────────────────────────────
 *   GET  /api/admin/users?role=&minTrustScore=&page=&size=
 *        → Spring Page<{ id, fullName, email, role, trustScore }>
 *
 * ─── Reviews ──────────────────────────────────────────────────────────
 *   GET  /api/admin/reviews?status=&page=&size=
 *        → Spring Page<Review>
 *   PUT  /api/admin/reviews/:id
 *        body: { approve: boolean, finalPenalty?: number }
 *
 * ─── Dashboard ────────────────────────────────────────────────────────
 *   GET  /api/admin/dashboard/overview
 *        → { totalUsers, totalFields, totalSuccessfulMatches }
 *   GET  /api/admin/dashboard/transactions
 *        → { totalSystemRevenue, totalSuccessfulBookings }
 *
 * ─── Fields ───────────────────────────────────────────────────────────
 *   GET  /api/admin/fields → FieldResponse[]
 *
 * ─── Match posts (read-only shared feed) ──────────────────────────────
 *   GET    /api/match-posts?page=&size=  → Page<MatchPostResponse>
 */
const adminService = {
  // ── USERS ─────────────────────────────────────────────────────────────
  getUsers: async ({ role, minTrustScore, page = 0, size = 15 } = {}) => {
    const params = new URLSearchParams({ page, size })
    if (role) params.set('role', role)
    if (minTrustScore != null) params.set('minTrustScore', minTrustScore)
    const { data } = await api.get(`/admin/users?${params}`)
    return data // Spring Page object: { content[], totalElements, totalPages, ... }
  },

  // ── REVIEWS ───────────────────────────────────────────────────────────
  getReviews: async ({ status } = {}) => {
    // Backend only supports GET /api/admin/fairplay/pending for pending reviews.
    // If the requested status is not PENDING_ADMIN_REVIEW (or empty for 'All'), return empty page.
    if (status && status !== 'PENDING_ADMIN_REVIEW') {
      return { content: [], totalPages: 0, totalElements: 0 }
    }
    const { data } = await api.get('/admin/fairplay/pending')
    
    // Map backend OpponentReview data to what AdminReviewsPage expects
    const content = (Array.isArray(data) ? data : []).map(item => ({
      id: item.id,
      reviewerId: item.reviewerId,
      revieweeId: item.revieweeId,
      matchRequestId: item.matchId,
      scoreChange: item.pointsApplied,
      reason: item.comment || (item.ratingType === 'NO_SHOW' ? 'Bùng kèo không lý do' : item.ratingType === 'BAD_BEHAVIOR' ? 'Hành vi xấu' : 'Đánh giá tốt'),
      aiSuggestedPenalty: item.ratingType === 'NO_SHOW' ? 20 : item.ratingType === 'BAD_BEHAVIOR' ? 30 : 10,
      status: 'PENDING_ADMIN_REVIEW',
      createdAt: item.createdAt,
      ratingType: item.ratingType
    }))

    return {
      content,
      totalPages: 1,
      totalElements: content.length
    }
  },

  /**
   * Adjudicate a review.
   * @param {string}  reviewId
   * @param {boolean} approve       - true = confirm penalty, false = dismiss
   * @param {number}  [finalPenalty] - point deduction (only when approve=true)
   */
  adjudicateReview: async (reviewId, { approve, finalPenalty }) => {
    const { data } = await api.put(`/admin/fairplay/resolve/${reviewId}`, {
      isAccepted: approve,
      pointsApplied: approve ? -Math.abs(finalPenalty) : 0
    })
    return data
  },

  // ── DASHBOARD ─────────────────────────────────────────────────────────
  getOverview: async () => {
    const { data } = await api.get('/admin/dashboard/overview')
    return data // { totalUsers, totalFields, totalSuccessfulMatches }
  },

  getTransactions: async () => {
    const { data } = await api.get('/admin/dashboard/transactions')
    return data // { totalSystemRevenue, totalSuccessfulBookings }
  },

  // ── FIELDS ───────────────────────────────────────────────────────────
  getFields: async () => {
    const { data } = await api.get('/admin/fields')
    return data // FieldResponse[]
  },

  // ── MATCH POSTS ───────────────────────────────────────────────────────
  getMatchPosts: async ({ page = 0, size = 15, skillLevel, postType } = {}) => {
    const params = new URLSearchParams({ page, size })
    if (skillLevel) params.set('skillLevel', skillLevel)
    if (postType)   params.set('postType', postType)
    const { data } = await api.get(`/match-posts?${params}`)
    return data // Spring Page<MatchPostResponse>
  },

}

export default adminService
