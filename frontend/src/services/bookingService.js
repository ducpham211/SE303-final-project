import api from './api'

const BOOKINGS_TTL_MS = 15_000

const bookingsCache = new Map()
const bookingsRequests = new Map()

function getBookingsCacheKey() {
  if (typeof window === 'undefined') return 'server'
  return window.localStorage.getItem('access_token') || 'guest'
}

function isBookingsCacheFresh() {
  const entry = bookingsCache.get(getBookingsCacheKey())
  return Boolean(entry?.data && Date.now() - entry.timestamp < BOOKINGS_TTL_MS)
}

function invalidateBookings() {
  const cacheKey = getBookingsCacheKey()
  bookingsCache.delete(cacheKey)
  bookingsRequests.delete(cacheKey)
}

/**
 * Service to handle booking and payment API calls
 */
const bookingService = {
  peekBookings: () => bookingsCache.get(getBookingsCacheKey())?.data || null,

  invalidateBookings,

  /**
   * Get all bookings for the currently logged-in user (PLAYER)
   * Owner/Admin also use this — backend filters by role automatically
   * @returns {Promise<Array>} List of bookings
   */
  getMyBookings: async (options = {}) => {
    const cacheKey = getBookingsCacheKey()
    const cached = bookingsCache.get(cacheKey)
    if (!options.force && isBookingsCacheFresh()) return cached.data
    if (!options.force && bookingsRequests.has(cacheKey)) return bookingsRequests.get(cacheKey)

    const request = api
      .get('/bookings')
      .then(({ data }) => {
        bookingsCache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      })
      .finally(() => {
        bookingsRequests.delete(cacheKey)
      })

    bookingsRequests.set(cacheKey, request)
    return request
  },

  /**
   * Create a new booking
   */
  createBooking: async (timeSlotId, note = '') => {
    const { data } = await api.post('/bookings', { timeSlotId, note })
    invalidateBookings()
    return data
  },

  /**
   * Create a Stripe payment session for a booking
   */
  createPaymentSession: async (bookingId) => {
    const { data } = await api.post(`/payments/create-session/${bookingId}`)
    return data
  },

  /** Owner: Check-in a customer */
  checkIn: async (bookingId) => {
    const { data } = await api.put(`/bookings/${bookingId}/check-in`)
    invalidateBookings()
    return data
  },

  /** Owner: Mark no-show */
  markNoShow: async (bookingId) => {
    const { data } = await api.put(`/bookings/${bookingId}/no-show`)
    invalidateBookings()
    return data
  },

  /** Owner: Check-out and record the remaining payment */
  checkOut: async (bookingId, method = 'CASH') => {
    const { data } = await api.post(`/bookings/${bookingId}/check-out`, null, {
      params: { method },
    })
    invalidateBookings()
    return data
  },

  /** Owner: Mark booking as completed */
  completeBooking: async (bookingId) => {
    const { data } = await api.put(`/bookings/${bookingId}/complete`)
    invalidateBookings()
    return data
  },
}

export default bookingService

