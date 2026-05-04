import api from './api'

/**
 * Chat service — wraps the /api/conversations endpoints.
 *
 * API:
 *   GET    /api/conversations           → list inbox (ConversationResponse[])
 *   GET    /api/conversations/:id/messages → list messages (MessageResponse[])
 *   POST   /api/conversations/:id/messages → send message ({ content })
 *
 * WebSocket:
 *   STOMP endpoint: ws://localhost:8080/ws  (SockJS)
 *   Subscribe:      /topic/conversations/:id
 *   Publish:        (via REST POST, not STOMP publish)
 */
const chatService = {
  /**
   * Get all conversations for the logged-in user.
   * @returns {Promise<ConversationResponse[]>}
   */
  getInbox: async () => {
    const { data } = await api.get('/conversations')
    return data
  },

  /**
   * Get all messages in a conversation.
   * @param {string} conversationId
   * @returns {Promise<MessageResponse[]>}
   */
  getMessages: async (conversationId) => {
    const { data } = await api.get(`/conversations/${conversationId}/messages`)
    return data
  },

  /**
   * Send a message to a conversation.
   * @param {string} conversationId
   * @param {string} content
   * @returns {Promise<MessageResponse>}
   */
  sendMessage: async (conversationId, content) => {
    const { data } = await api.post(`/conversations/${conversationId}/messages`, { content })
    return data
  },
}

export default chatService
