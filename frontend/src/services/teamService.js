import api from './api'

/**
 * Service to handle Team CRUD API calls
 * Maps to: TeamController.java
 *
 * TeamCreateRequest: { name, description, captainId, level }
 * TeamResponse:      { id, name, description, captainId, level, createdAt }
 * level enum:        BEGINNER | INTERMEDIATE | ADVANCED
 */
const teamService = {
  /**
   * GET /api/teams/me
   * @returns {Promise<TeamResponse[]>}
   */
  getMyTeams: async () => {
    const { data } = await api.get('/teams/me')
    return data
  },

  /**
   * POST /api/teams
   * @param {{ name: string, description: string, captainId: string, level: string }} payload
   * @returns {Promise<TeamResponse>}
   */
  createTeam: async (payload) => {
    const { data } = await api.post('/teams', payload)
    return data
  },

  /**
   * PUT /api/teams/{id}
   * @param {string} teamId
   * @param {{ name: string, description: string, captainId: string, level: string }} payload
   * @returns {Promise<TeamResponse>}
   */
  updateTeam: async (teamId, payload) => {
    const { data } = await api.put(`/teams/${teamId}`, payload)
    return data
  },

  /**
   * DELETE /api/teams/{id}
   * @param {string} teamId
   * @returns {Promise<string>}
   */
  deleteTeam: async (teamId) => {
    const { data } = await api.delete(`/teams/${teamId}`)
    return data
  },
}

export default teamService
