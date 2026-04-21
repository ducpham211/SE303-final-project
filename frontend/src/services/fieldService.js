import api from './api'

/**
 * Service to handle field-related API calls
 */
const fieldService = {
  /**
   * Get all fields with optional filters
   * @param {Object} filters { type, minPrice, maxPrice }
   * @returns {Promise<Array>} List of fields
   */
  getFields: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    
    const { data } = await api.get(`/fields?${params.toString()}`)
    return data
  },

  /**
   * Get field detail by ID
   * @param {string} id 
   * @returns {Promise<Object>} Field detail
   */
  getFieldById: async (id) => {
    const { data } = await api.get(`/fields/${id}`)
    return data
  },

  /**
   * Get available time slots for a field on a specific date
   * @param {string} id Field ID
   * @param {string} date Format YYYY-MM-DD
   * @returns {Promise<Array>} List of time slots
   */
  getFieldAvailability: async (id, date) => {
    const { data } = await api.get(`/fields/${id}/availability?date=${date}`)
    return data
  }
}

export default fieldService
