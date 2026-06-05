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
 * ─── Match posts (public, admin can delete any) ───────────────────────
 *   GET    /api/match-posts?page=&size=  → Page<MatchPostResponse>
 *   DELETE /api/match-posts/:id          → 204 No Content
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
  getReviews: async ({ status, page = 0, size = 15 } = {}) => {
    const params = new URLSearchParams({ page, size })
    if (status) params.set('status', status)
    const { data } = await api.get(`/admin/reviews?${params}`)
    return data // Spring Page<Review>
  },

  /**
   * Adjudicate a review.
   * @param {string}  reviewId
   * @param {boolean} approve       - true = confirm penalty, false = dismiss
   * @param {number}  [finalPenalty] - point deduction (only when approve=true)
   */
  adjudicateReview: async (reviewId, { approve, finalPenalty }) => {
    const { data } = await api.put(`/admin/reviews/${reviewId}`, { approve, finalPenalty })
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

  deleteMatchPost: async (postId) => {
    await api.delete(`/match-posts/${postId}`)
  },
}

export default adminService
