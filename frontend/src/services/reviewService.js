import api from './api'

/**
 * Service to handle Review API calls
 * Maps to: ReviewController.java
 *
 * ReviewCreateRequest: { fieldId, bookingId, rating, comment, imageUrl }
 * ReviewResponse:      { id, userId, fieldId, bookingId, rating, comment, imageUrl, createdAt }
 */
const reviewService = {
  /**
   * POST /api/reviews
   * @param {{ fieldId: string, bookingId: string, rating: number, comment: string, imageUrl?: string }} payload
   * @returns {Promise<ReviewResponse>}
   */
  createReview: async (payload) => {
    const { data } = await api.post('/reviews', payload)
    return data
  },
}

export default reviewService
