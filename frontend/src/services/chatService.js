import api from './api'

/**
 * Chat service — wraps the /api/conversations endpoints.
 *
 * API:
 *   GET    /api/conversations                    → list inbox (ConversationResponse[])
 *   POST   /api/conversations/direct             → get-or-create a direct conversation { partnerId }
 *   GET    /api/conversations/:id/messages       → list messages (MessageResponse[])
 *   POST   /api/conversations/:id/messages       → send message { content }
 *   PUT    /api/conversations/:id/read           → mark conversation as read
 *
 * WebSocket:
 *   STOMP endpoint: http://localhost:8080/ws  (SockJS)
 *   Subscribe:      /topic/conversations/:id
 *   Publish:        (via REST POST, not STOMP publish)
 */
const chatService = {
  /**
   * GET /api/conversations
   * @returns {Promise<ConversationResponse[]>}
   */
  getInbox: async () => {
    const { data } = await api.get('/conversations')
    return data
  },

  /**
   * GET /api/conversations/:id/messages
   * @param {string} conversationId
   * @returns {Promise<MessageResponse[]>}
   */
  getMessages: async (conversationId) => {
    const { data } = await api.get(`/conversations/${conversationId}/messages`)
    return data
  },

  /**
   * POST /api/conversations/:id/messages
   * @param {string} conversationId
   * @param {string} content
   * @returns {Promise<MessageResponse>}
   */
  sendMessage: async (conversationId, content) => {
    const { data } = await api.post(`/conversations/${conversationId}/messages`, { content })
    return data
  },

  /**
   * PUT /api/conversations/:id/read
   * @param {string} conversationId
   */
  markRead: async (conversationId) => {
    await api.put(`/conversations/${conversationId}/read`)
  },
}

export default chatService

