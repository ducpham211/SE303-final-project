import api from './api'

/**
 * Service to handle booking and payment API calls
 */
const bookingService = {
  /**
   * Get all bookings for the currently logged-in user (PLAYER)
   * Owner/Admin also use this — backend filters by role automatically
   * @returns {Promise<Array>} List of bookings
   */
  getMyBookings: async () => {
    const { data } = await api.get('/bookings')
    return data
  },

  /**
   * Create a new booking
   */
  createBooking: async (timeSlotId, note = '') => {
    const { data } = await api.post('/bookings', { timeSlotId, note })
    return data
  },

  /**
   * Create a Stripe payment session for a booking
   */
  createPaymentSession: async (bookingId) => {
    const { data } = await api.post(`/payments/create-session/${bookingId}`)
    return data
  },

  // TODO: cancelBooking — requires backend endpoint PUT /api/bookings/:id/cancel (PLAYER role)
  // When available, add: cancelBooking: async (bookingId) => { const { data } = await api.put(`/bookings/${bookingId}/cancel`); return data },

  /** Owner: Check-in a customer */
  checkIn: async (bookingId) => {
    const { data } = await api.put(`/bookings/${bookingId}/check-in`)
    return data
  },

  /** Owner: Mark no-show */
  markNoShow: async (bookingId) => {
    const { data } = await api.put(`/bookings/${bookingId}/no-show`)
    return data
  },
}

export default bookingService

