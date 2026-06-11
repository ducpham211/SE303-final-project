import api from './api'

const fairplayService = {
  /**
   * Submit a fairplay review for an opponent
   * @param {Object} payload { matchId, revieweeId, ratingType, comment, imageUrl }
   */
  submitReview: async (payload) => {
    const { data } = await api.post('/fairplay/reviews', payload)
    return data
  },

  /**
   * Get list of match IDs that the current user has already reviewed
   * @returns {Promise<Array<string>>}
   */
  getMySubmitted: async () => {
    const { data } = await api.get('/fairplay/my-submitted')
    return data
  }
}

export default fairplayService
