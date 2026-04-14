import api from './api'

/**
 * Service to handle booking and payment API calls
 */
const bookingService = {
  /**
   * Create a new booking
   * @param {string} timeSlotId 
   * @param {string} note 
   * @returns {Promise<Object>} Booking response containing bookingId
   */
  createBooking: async (timeSlotId, note = '') => {
    const { data } = await api.post('/bookings', { timeSlotId, note })
    return data
  },

  /**
   * Create a Stripe payment session for a booking
   * @param {string} bookingId 
   * @returns {Promise<Object>} Payment response containing checkout session 'url'
   */
  createPaymentSession: async (bookingId) => {
    const { data } = await api.post(`/payments/create-session/${bookingId}`)
    return data
  }
}

export default bookingService
