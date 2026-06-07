import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useChatStore from '../../store/useChatStore'
import Toast from '../../components/common/Toast'

/* ─── Helpers ──────────────────────────────────────────────────────── */
function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return d.toLocaleDateString('vi-VN', { weekday: 'short' })
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function getInitials(str) {
  if (!str) return '?'
  const trimmed = str.trim()
  // If it looks like a name (has spaces), use first letters of each word
  if (trimmed.includes(' ')) return trimmed.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  // Otherwise use first 2 chars
  return trimmed.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  '#60D86E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#10B981',
]
function avatarColor(str) {
  if (!str) return AVATAR_COLORS[0]
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/* ─── Sub-components ───────────────────────────────────────────────── */

function ConversationItem({ conv, isActive, onClick }) {
  // Use partnerName from API if available, fallback to short ID
  const displayName = conv.partnerName || `User ...${(conv.partnerId || '').slice(-6)}`
  const initials = getInitials(conv.partnerName || (conv.partnerId || '').slice(-4))
  const bg = avatarColor(conv.partnerId)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-150 rounded-xl ${
        isActive
          ? 'bg-[#e8f9eb] border border-[#60D86E]/30'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: bg }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#1a202c] truncate">{displayName}</span>
          <span className="text-[11px] text-gray-400 flex-shrink-0">{formatTime(conv.updatedAt)}</span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'Chưa có tin nhắn'}</p>
      </div>
    </button>
  )
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mb-0.5"
          style={{ backgroundColor: avatarColor(msg.senderId) }}
        >
          {getInitials((msg.senderId || '').slice(-3))}
        </div>
      )}
      <div className={`flex flex-col gap-0.5 max-w-[68%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-[#60D86E] text-white rounded-br-sm'
              : 'bg-white text-[#1a202c] border border-gray-100 shadow-sm rounded-bl-sm'
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
      </div>
    </div>
  )
}

function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-full bg-[#e8f9eb] flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-semibold text-[#1a202c]">Chọn cuộc trò chuyện</h3>
        <p className="text-sm text-gray-400 mt-1">Chọn một cuộc trò chuyện ở bên trái để bắt đầu nhắn tin</p>
      </div>
    </div>
  )
}

function EmptyInbox() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="text-sm text-gray-600 font-semibold">Chưa có cuộc trò chuyện nào</p>
      <p className="text-xs text-gray-400 leading-relaxed">
        Phòng chat tự động mở khi bạn gửi hoặc nhận<br />
        một yêu cầu kèo giao hữu từ trang Tìm đối thủ.
      </p>
      <button
        onClick={() => navigate('/matchmaking')}
        className="mt-1 px-4 py-2 rounded-full bg-[#60D86E] text-white text-xs font-semibold hover:bg-[#45c45a] transition-colors"
      >
        Tìm đối thủ ngay
      </button>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function MessagesPage() {
  const { isLoggedIn, user, token } = useAuthStore()
  const navigate = useNavigate()
  const {
    conversations, activeId, messages, loading, error,
    fetchInbox, openConversation, sendMessage,
    connectWebSocket, disconnectWebSocket, clearError,
  } = useChatStore()

  const [inputText, setInputText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  /* ── Auth guard ── */
  useEffect(() => {
    if (!isLoggedIn) navigate('/login')
  }, [isLoggedIn, navigate])

  /* ── Connect WS & load inbox on mount ── */
  useEffect(() => {
    if (!isLoggedIn) return
    connectWebSocket(token)
    fetchInbox()
    return () => disconnectWebSocket()
  }, [isLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-scroll to latest message ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeId])

  /* ── Focus input when conversation opens ── */
  useEffect(() => {
    if (activeId) inputRef.current?.focus()
  }, [activeId])

  const currentMessages = activeId ? (messages[activeId] || []) : []
  const activeConv = conversations.find(c => c.id === activeId)

  const handleSelectConversation = useCallback((id) => {
    openConversation(id)
    setSidebarOpen(false)
  }, [openConversation])

  const handleSend = useCallback(async (e) => {
    e?.preventDefault()
    if (!inputText.trim() || !activeId) return
    const text = inputText
    setInputText('')
    await sendMessage(activeId, text)
  }, [inputText, activeId, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /*
   * isOwnMessage: senderId in MessageResponse is a UUID.
   * user.id is populated by App.jsx via enrichUser() → GET /api/users/me.
   * Falls back to email comparison for the edge case where enrichUser hasn't resolved yet.
   */
  const isOwnMessage = (msg) => {
    if (!msg?.senderId) return false
    return msg.senderId === user?.id || msg.senderId === user?.email
  }

  const activeDisplayName = activeConv?.partnerName
    || (activeConv ? `User ...${(activeConv.partnerId || '').slice(-6)}` : '')

  return (
    /*
     * Full-height layout:
     * - pt-[72px] = navbar height (the pill navbar is ~72px including padding)
     * - The container itself stretches to fill the viewport
     * - Footer is NOT shown on this page — the chat fills everything below navbar
     */
    <div className="fixed inset-0 top-[72px] flex bg-[#f8faf8] overflow-hidden">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside
        className={`
          absolute lg:relative top-0 left-0 bottom-0 z-40 lg:z-auto
          w-72 flex-shrink-0 bg-white border-r border-gray-100
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#1a202c]">Tin nhắn</h2>
            <span className="text-xs bg-[#e8f9eb] text-[#3a9e47] font-semibold px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs text-gray-400">Tìm kiếm...</span>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#60D86E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <EmptyInbox />
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeId}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ── */}
      <main className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden border-l border-gray-100">

        {/* Chat header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 mr-0.5 flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở danh sách tin nhắn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {activeConv ? (
            <>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: avatarColor(activeConv.partnerId) }}
              >
                {getInitials(activeConv.partnerName || (activeConv.partnerId || '').slice(-4))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a202c] truncate">{activeDisplayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#60D86E] inline-block" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
              {/* Refresh button */}
              <button
                onClick={() => openConversation(activeId)}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#60D86E] transition-colors flex-shrink-0"
                title="Tải lại tin nhắn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </>
          ) : (
            /* No active conversation — only show mobile toggle */
            <h1 className="text-sm font-medium text-gray-400 hidden lg:block">Chọn cuộc trò chuyện</h1>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50/40">
          {!activeId ? (
            <EmptyChat />
          ) : loading && currentMessages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#60D86E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e8f9eb] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            <>
              {currentMessages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} isOwn={isOwnMessage(msg)} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area — only shown when a conversation is active */}
        {activeId && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn... (Enter để gửi)"
                  rows={1}
                  className="w-full resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:border-[#60D86E] focus:bg-white transition-all duration-200 leading-relaxed"
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                  onInput={e => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                />
              </div>
              <button
                id="chat-send-btn"
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full bg-[#60D86E] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#45c45a] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-1.5 px-1">
              Nhấn <kbd className="bg-gray-100 px-1 rounded text-[10px]">Enter</kbd> để gửi,{' '}
              <kbd className="bg-gray-100 px-1 rounded text-[10px]">Shift+Enter</kbd> xuống dòng
            </p>
          </div>
        )}
      </main>
      <Toast message={error} type="error" onClose={clearError} />
    </div>
  )
}
