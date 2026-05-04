import { create } from 'zustand'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import chatService from '../services/chatService'

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
  .replace('/api', '')
  .replace('http', 'ws')

const HTTP_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'

/**
 * Zustand store for real-time chat.
 *
 * State shape:
 *   conversations   – list of ConversationResponse from inbox
 *   activeId        – currently open conversation ID
 *   messages        – { [conversationId]: MessageResponse[] }
 *   stompClient     – the active @stomp/stompjs Client (or null)
 *   loading         – busy flag for initial loads
 *   error           – last error string
 */
const useChatStore = create((set, get) => ({
  conversations: [],
  activeId: null,
  messages: {},
  stompClient: null,
  loading: false,
  error: null,

  // ─── INBOX ────────────────────────────────────────────────────────────
  fetchInbox: async () => {
    set({ loading: true, error: null })
    try {
      const conversations = await chatService.getInbox()
      set({ conversations, loading: false })
    } catch (err) {
      console.warn('Failed to fetch inbox, using mock data for testing.', err)
      // Mock data fallback for testing UI
      const mockConversations = [
        { id: '1', partnerId: 'player-alpha', lastMessage: 'Chào bạn, sân số 5 còn trống không?', updatedAt: new Date().toISOString() },
        { id: '2', partnerId: 'owner-beta', lastMessage: 'Ok, đã xác nhận đặt sân thành công!', updatedAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', partnerId: 'player-gamma', lastMessage: 'Hẹn gặp bạn lúc 18h nhé.', updatedAt: new Date(Date.now() - 86400000).toISOString() },
      ]
      set({ conversations: mockConversations, loading: false })
    }
  },

  // ─── OPEN CONVERSATION ────────────────────────────────────────────────
  openConversation: async (conversationId) => {
    const { messages, stompClient, subscribeToConversation } = get()

    set({ activeId: conversationId, error: null })

    // Load messages if not already cached
    if (!messages[conversationId]) {
      set({ loading: true })
      try {
        const msgs = await chatService.getMessages(conversationId)
        set(state => ({
          messages: { ...state.messages, [conversationId]: msgs },
          loading: false,
        }))
      } catch (err) {
        console.warn('Failed to fetch messages, using mock data.', err)
        const mockMessages = {
          '1': [
            { id: 'm1', senderId: 'player-alpha', content: 'Chào bạn, sân số 5 còn trống không?', createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: 'm2', senderId: 'test@example.com', content: 'Chào bạn, hiện tại vẫn còn trống nhé!', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'm3', senderId: 'player-alpha', content: 'Ok, mình đặt sân luôn nhé.', createdAt: new Date(Date.now() - 1800000).toISOString() },
          ],
          '2': [
            { id: 'm4', senderId: 'owner-beta', content: 'Ok, đã xác nhận đặt sân thành công!', createdAt: new Date(Date.now() - 3600000).toISOString() },
          ],
          '3': [
            { id: 'm5', senderId: 'player-gamma', content: 'Hẹn gặp bạn lúc 18h nhé.', createdAt: new Date(Date.now() - 86400000).toISOString() },
          ],
        }
        set(state => ({
          messages: { ...state.messages, [conversationId]: mockMessages[conversationId] || [] },
          loading: false,
        }))
      }
    }

    // Subscribe to WebSocket topic for this conversation
    if (stompClient?.connected) {
      subscribeToConversation(conversationId)
    }
  },

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────
  sendMessage: async (conversationId, content) => {
    if (!content.trim()) return
    try {
      // REST POST — backend will also broadcast via WebSocket
      const msg = await chatService.sendMessage(conversationId, content)
      // Optimistically append our own message (WebSocket echo will dedup)
      set(state => {
        const existing = state.messages[conversationId] || []
        // Avoid duplicate if WS already arrived
        const alreadyThere = existing.some(m => m.id === msg.id)
        return {
          messages: {
            ...state.messages,
            [conversationId]: alreadyThere ? existing : [...existing, msg],
          },
          conversations: state.conversations.map(c =>
            c.id === conversationId ? { ...c, lastMessage: content, updatedAt: msg.createdAt } : c
          ),
        }
      })
    } catch (err) {
      set({ error: err.message || 'Gửi tin nhắn thất bại' })
    }
  },

  // ─── WEBSOCKET ────────────────────────────────────────────────────────
  connectWebSocket: (token) => {
    const existing = get().stompClient
    if (existing?.connected) return // Already connected

    const client = new Client({
      webSocketFactory: () => new SockJS(`${HTTP_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Connected')
        set({ stompClient: client })
        const { activeId, subscribeToConversation } = get()
        if (activeId) subscribeToConversation(activeId)
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected')
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error', frame)
      },
    })

    client.activate()
    set({ stompClient: client })
  },

  subscribeToConversation: (conversationId) => {
    const { stompClient } = get()
    if (!stompClient?.connected) return

    const destination = `/topic/conversations/${conversationId}`
    stompClient.subscribe(destination, (frame) => {
      try {
        const msg = JSON.parse(frame.body)
        set(state => {
          const existing = state.messages[conversationId] || []
          // Dedup by message ID
          if (existing.some(m => m.id === msg.id)) return state
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...existing, msg],
            },
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? { ...c, lastMessage: msg.content, updatedAt: msg.createdAt }
                : c
            ),
          }
        })
      } catch (e) {
        console.error('[WS] Failed to parse message', e)
      }
    })
  },

  disconnectWebSocket: () => {
    const { stompClient } = get()
    stompClient?.deactivate()
    set({ stompClient: null })
  },

  clearError: () => set({ error: null }),
}))

export default useChatStore
