import api from './api'

/**
 * Service to handle Notification API calls
 * Maps to: NotificationController.java
 *
 * NotificationResponse: { id, title, content, type, isRead, createdAt }
 * type enum: SYSTEM | BOOKING_UPDATE | MATCH_REQUEST | NEW_MESSAGE | USER_UPDATE | PAYMENT_UPDATE
 */
const notificationService = {
  /**
   * GET /api/notifications
   * @returns {Promise<NotificationResponse[]>}
   */
  getNotifications: async () => {
    const { data } = await api.get('/notifications')
    return data
  },

  /**
   * GET /api/notifications/unread-count
   * @returns {Promise<{ unreadCount: number }>}
   */
  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count')
    return data
  },

  /**
   * PUT /api/notifications/{id}/read
   * @param {string} notificationId
   * @returns {Promise<NotificationResponse>}
   */
  markAsRead: async (notificationId) => {
    const { data } = await api.put(`/notifications/${notificationId}/read`)
    return data
  },

  /**
   * PUT /api/notifications/read-all
   * @returns {Promise<void>}
   */
  markAllAsRead: async () => {
    await api.put('/notifications/read-all')
  },
}

export default notificationService
