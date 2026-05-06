import api from './api'

const matchService = {
  /**
   * GET /api/match-posts
   * Optional filters: skillLevel, postType (FIND_OPPONENT | FIND_MEMBER)
   */
  getMatchPosts: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.skillLevel) params.append('skillLevel', filters.skillLevel)
    if (filters.postType)   params.append('postType', filters.postType)
    const { data } = await api.get(`/match-posts?${params.toString()}`)
    return data
  },
}

export default matchService
