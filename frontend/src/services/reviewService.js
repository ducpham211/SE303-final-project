import api from './api'

/**
 * Service to handle Review API calls
 * Maps to: ReviewController.java
 *
 * ReviewCreateRequest: { revieweeId, matchRequestId, reason }
 * ReviewResponse:      { id, reviewerId, revieweeId, matchRequestId, scoreChange, reason, aiSuggestedPenalty, status, createdAt }
 */
const reviewService = {
  /**
   * POST /api/reviews
   * @param {{ revieweeId: string, matchRequestId: string, reason: string }} payload
   * @returns {Promise<ReviewResponse>}
   */
  createReview: async (payload) => {
    const { data } = await api.post('/reviews', payload)
    return data
  },
}

export default reviewService
