import { create } from 'zustand'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import chatService from '../services/chatService'

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
      const status = err?.response?.status
      const msg = status === 401
        ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        : err?.response?.data?.message || 'Không thể tải hộp thư. Vui lòng thử lại.'
      set({ loading: false, error: msg })
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
        const status = err?.response?.status
        const msg = status === 403
          ? 'Bạn không có quyền truy cập cuộc trò chuyện này.'
          : err?.response?.data?.message || 'Không thể tải tin nhắn.'
        set({ loading: false, error: msg })
      }
    }

    // Mark as read (fire-and-forget, don't block UI)
    chatService.markRead(conversationId).catch(() => {})

    // Subscribe to WebSocket topic for this conversation
    if (stompClient?.connected) {
      subscribeToConversation(conversationId)
    }
  },

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────
  sendMessage: async (conversationId, content) => {
    if (!content.trim()) return
    try {
      // REST POST — backend also broadcasts via WebSocket
      const msg = await chatService.sendMessage(conversationId, content)
      // Optimistically append (WebSocket echo will dedup)
      set(state => {
        const existing = state.messages[conversationId] || []
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
      const status = err?.response?.status
      if (status === 403) {
        set({ error: 'Không thể gửi tin nhắn. Bạn không phải thành viên của cuộc trò chuyện này.' })
      } else if (status === 404) {
        set({ error: 'Cuộc trò chuyện không tồn tại.' })
      } else {
        set({ error: err?.response?.data?.message || err.message || 'Gửi tin nhắn thất bại.' })
      }
    }
  },

  // ─── WEBSOCKET ────────────────────────────────────────────────────────
  connectWebSocket: (token) => {
    const existing = get().stompClient
    if (existing?.connected) return // Already connected

    const client = new Client({
      // SockJS needs http://, NOT ws://
      webSocketFactory: () => new SockJS(`${HTTP_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Connected')
        set({ stompClient: client })
        // Re-subscribe to the active conversation if there is one
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
    // Note: set stompClient here too so connectWebSocket is idempotent
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
