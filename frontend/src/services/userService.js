import api from './api'

/**
 * Service to handle User profile API calls
 * Maps to: UserController.java
 */
const userService = {
  /**
   * GET /api/users/me
   * @returns {Promise<UserResponse>} { id, email, fullName, phone, role }
   */
  getMe: async () => {
    const { data } = await api.get('/users/me')
    return data
  },

  /**
   * PUT /api/users/{id}
   * @param {string} userId
   * @param {{ fullName?: string, phone?: string, password?: string }} payload
   * @returns {Promise<UserResponse>}
   */
  updateUser: async (userId, payload) => {
    const { data } = await api.put(`/users/${userId}`, payload)
    return data
  },
}

export default userService
