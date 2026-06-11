import api from './api'

const FIELD_LIST_TTL_MS = 30_000
const FIELD_DETAIL_TTL_MS = 30_000

const fieldListCache = new Map()
const fieldListRequests = new Map()
const fieldDetailCache = new Map()
const fieldDetailRequests = new Map()

function getFieldListKey(filters = {}) {
  return JSON.stringify({
    type: filters.type || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
  })
}

function isFresh(entry, ttl) {
  return Boolean(entry?.data && Date.now() - entry.timestamp < ttl)
}

function invalidateFieldLists() {
  fieldListCache.clear()
  fieldListRequests.clear()
}

function invalidateFieldDetail(fieldId) {
  if (!fieldId) return
  fieldDetailCache.delete(fieldId)
  fieldDetailRequests.delete(fieldId)
}

function cacheFieldDetail(detail) {
  if (!detail?.id) return
  fieldDetailCache.set(detail.id, { data: detail, timestamp: Date.now() })
}

/**
 * Service to handle field-related API calls
 */
const fieldService = {
  peekFields: (filters = {}) => {
    const entry = fieldListCache.get(getFieldListKey(filters))
    return entry?.data || null
  },

  peekFieldDetail: (id) => {
    const entry = fieldDetailCache.get(id)
    return entry?.data || null
  },

  /**
   * Get all fields with optional filters
   * @param {Object} filters { type, minPrice, maxPrice }
   * @returns {Promise<Array>} List of fields
   */
  getFields: async (filters = {}, options = {}) => {
    const cacheKey = getFieldListKey(filters)
    const cached = fieldListCache.get(cacheKey)
    if (!options.force && isFresh(cached, FIELD_LIST_TTL_MS)) return cached.data
    if (!options.force && fieldListRequests.has(cacheKey)) return fieldListRequests.get(cacheKey)
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.name) params.append('name', filters.name)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    
    const query = params.toString()
    const request = api
      .get(query ? `/fields?${query}` : '/fields')
      .then(({ data }) => {
        fieldListCache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      })
      .finally(() => fieldListRequests.delete(cacheKey))

    fieldListRequests.set(cacheKey, request)
    return request
  },

  /**
   * Get paginated fields with optional filters
   * @param {number} page 0-indexed page number
   * @param {number} size number of items per page
   * @param {Object} filters { name, type }
   * @returns {Promise<Object>} Page object with content and pagination info
   */
  getFieldsPage: async (page = 0, size = 8, filters = {}) => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('size', size)
    if (filters.type) params.append('type', filters.type)
    if (filters.name) params.append('name', filters.name)
    
    const query = params.toString()
    const { data } = await api.get(`/fields/page?${query}`)
    return data
  },

  /**
   * Get field detail by ID
   * @param {string} id 
   * @returns {Promise<Object>} Field detail
   */
  getFieldById: async (id, options = {}) => {
    const cached = fieldDetailCache.get(id)
    if (!options.force && isFresh(cached, FIELD_DETAIL_TTL_MS)) return cached.data
    if (!options.force && fieldDetailRequests.has(id)) return fieldDetailRequests.get(id)

    const request = api
      .get(`/fields/${id}`)
      .then(({ data }) => {
        cacheFieldDetail(data)
        return data
      })
      .finally(() => fieldDetailRequests.delete(id))

    fieldDetailRequests.set(id, request)
    return request
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
  },

  /**
   * Owner: create a field
   * @param {Object} payload { name, type, coverImage }
   */
  createField: async (payload) => {
    const { data } = await api.post('/fields', payload)
    invalidateFieldLists()
    cacheFieldDetail({ ...data, timeSlots: data.timeSlots || [] })
    return data
  },

  /**
   * Owner: update a field
   * @param {string} id Field ID
   * @param {Object} payload { name, type, coverImage }
   */
  updateField: async (id, payload) => {
    const { data } = await api.put(`/fields/${id}`, payload)
    invalidateFieldLists()
    const previous = fieldDetailCache.get(id)?.data
    cacheFieldDetail(previous ? { ...previous, ...data } : data)
    return data
  },

  /**
   * Owner: delete a field
   * @param {string} id Field ID
   */
  deleteField: async (id) => {
    const { data } = await api.delete(`/fields/${id}`)
    invalidateFieldLists()
    invalidateFieldDetail(id)
    return data
  },

  /**
   * Owner: create a time slot for a field
   * @param {string} fieldId Field ID
   * @param {Object} payload { startTime, endTime, price, status }
   */
  createTimeSlot: async (fieldId, payload) => {
    const { data } = await api.post(`/fields/${fieldId}/time-slots`, payload)
    invalidateFieldDetail(fieldId)
    return data
  },

  /**
   * Owner: update a time slot
   * @param {string} fieldId Field ID
   * @param {string} slotId Time slot ID
   * @param {Object} payload { startTime, endTime, price, status }
   */
  updateTimeSlot: async (fieldId, slotId, payload) => {
    const { data } = await api.put(`/fields/${fieldId}/time-slots/${slotId}`, payload)
    invalidateFieldDetail(fieldId)
    return data
  },

  /**
   * Owner: delete a time slot
   * @param {string} fieldId Field ID
   * @param {string} slotId Time slot ID
   */
  deleteTimeSlot: async (fieldId, slotId) => {
    const { data } = await api.delete(`/fields/${fieldId}/time-slots/${slotId}`)
    invalidateFieldDetail(fieldId)
    return data
  },
}

export default fieldService
