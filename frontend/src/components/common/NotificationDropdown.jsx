import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import notificationService from '../../services/notificationService'
import useAuthStore from '../../store/useAuthStore'

const HTTP_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'

const TYPE_ICONS = {
  BOOKING_UPDATE: { color: '#3b82f6', bg: '#EFF6FF' },
  MATCH_REQUEST:  { color: '#8b5cf6', bg: '#F5F3FF' },
  NEW_MESSAGE:    { color: '#60D86E', bg: '#F0FDF4' },
  PAYMENT_UPDATE: { color: '#f59e0b', bg: '#FFFBEB' },
  USER_UPDATE:    { color: '#e23670', bg: '#FFF0F5' },
  SYSTEM:         { color: '#6b7280', bg: '#F9FAFB' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  return `${days} ngày trước`
}

export default function NotificationDropdown() {
  const { isLoggedIn } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch unread count & connect WebSocket
  useEffect(() => {
    if (!isLoggedIn) return
    
    // Initial fetch
    const fetchInitialData = async () => {
      try {
        const [countData, listData] = await Promise.all([
          notificationService.getUnreadCount(),
          notificationService.getNotifications()
        ])
        setUnreadCount(countData.unreadCount || 0)
        setNotifications(listData || [])
      } catch (err) {
        console.error('Notification initial fetch error:', err)
      }
    }
    fetchInitialData()

    const token = localStorage.getItem('access_token')
    let stompClient = null

    try {
      stompClient = new Client({
        webSocketFactory: () => new SockJS(`${HTTP_BASE}/ws`),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 5000,
        onConnect: () => {
          // Subscribe to user notifications
          stompClient.subscribe('/user/queue/notifications', (frame) => {
            try {
              const msg = JSON.parse(frame.body)
              // Prepend to list, deduping by id
              setNotifications((prev) => {
                if (prev.some(n => n.id === msg.id)) return prev
                return [msg, ...prev]
              })
              setUnreadCount((c) => c + 1)
            } catch (e) {
              console.error('[WS Notification] Failed to parse message', e)
            }
          })
        },
        onStompError: () => {
          // Fallback silently, no crash
        },
      })
      stompClient.activate()
    } catch (err) {
      // Ignore ws setup errors
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate()
      }
    }
  }, [isLoggedIn])

  const handleOpen = () => {
    setOpen(!open)
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  if (!isLoggedIn) return null

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        id="navbar-notification-bell"
        onClick={handleOpen}
        className="relative p-2 rounded-full text-gray-500 hover:bg-[#e8f9eb] hover:text-[#60D86E] transition-all duration-200"
        aria-label="Thông báo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#e23670] text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1a202c]">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#60D86E] hover:underline">
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-400">Chưa có thông báo nào.</div>
            )}

            {!loading && notifications.map((n) => {
              const typeStyle = TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEM
              return (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-[#FAFFFE]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: typeStyle.bg }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeStyle.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${!n.isRead ? 'font-bold text-[#1a202c]' : 'font-medium text-gray-600'}`}>{n.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{n.content}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#60D86E] flex-shrink-0 mt-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
