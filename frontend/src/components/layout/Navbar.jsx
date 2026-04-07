import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

/**
 * Top navigation bar — adapts to logged-in / logged-out state.
 */
export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const navLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Đặt sân', to: '/dat-san' },
    { label: 'Tìm đối thủ', to: '/tim-doi-thu' },
    { label: 'Cộng đồng', to: '/cong-dong' },
    { label: 'Liên hệ', to: '/lien-he' },
  ]

  return (
    <>
      {/* Fixed floating pill navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 pointer-events-none">
        <nav
          className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' }}
        >
          <div className="px-4 sm:px-5">
            <div className="flex items-center justify-between h-14 relative">

              {/* Logo */}
              <Link
                to="/"
                id="navbar-logo"
                className="flex items-center gap-2 flex-shrink-0 z-10"
              >
                <div className="w-8 h-8 rounded-full bg-[#60D86E] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none"/>
                    <path d="M12 2L10 8H4.5L9 11.5L7 17.5L12 14L17 17.5L15 11.5L19.5 8H14L12 2Z" fill="white" opacity="0.8"/>
                  </svg>
                </div>
                <span className="text-[#1a202c] font-bold text-lg tracking-tight">
                  Tim<span className="text-[#60D86E]">san</span>bong
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div 
                className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-start gap-1 whitespace-nowrap overflow-hidden max-w-[calc(100%-380px)] transition-all"
              >
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                        isActive 
                          ? 'bg-[#60D86E] text-white shadow-sm' 
                          : 'text-gray-600 hover:text-[#60D86E] hover:bg-[#e8f9eb]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>

              {/* Right side: Auth */}
              <div className="hidden md:flex items-center gap-2 z-10">
                {isLoggedIn ? (
                  <div className="relative" ref={dropdownRef}>
                    {/* Notification Bell */}
                    <button
                      id="navbar-notification-bell"
                      className="relative p-2 rounded-full text-gray-500 hover:bg-[#e8f9eb] hover:text-[#60D86E] transition-all duration-200 mr-1"
                      aria-label="Thông báo"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#60D86E] rounded-full"></span>
                    </button>

                    {/* Avatar dropdown trigger */}
                    <button
                      id="navbar-user-avatar"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8f9eb] hover:bg-[#60D86E] hover:text-white transition-all duration-200 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#60D86E] group-hover:bg-white flex items-center justify-center text-white group-hover:text-[#60D86E] font-semibold text-xs flex-shrink-0 transition-all">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-[#1a202c] group-hover:text-white transition-all">
                        {user?.name || 'Tài khoản'}
                      </span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-gray-400 group-hover:text-white transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                        {[
                          { label: 'Lịch đặt', to: '/lich-dat' },
                          { label: 'Tin nhắn', to: '/tin-nhan' },
                          { label: 'Yêu cầu của tôi', to: '/yeu-cau' },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e8f9eb] hover:text-[#60D86E] transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div className="my-1 border-t border-gray-100"/>
                        <button
                          id="navbar-logout-btn"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/dang-nhap"
                      id="navbar-login-btn"
                      className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/dang-ky"
                      id="navbar-register-btn"
                      className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#60D86E] text-white hover:bg-[#45c45a] transition-all duration-200"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                id="navbar-mobile-menu-btn"
              >
                {mobileOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu — attached below pill, same border radius continues */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 rounded-b-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-[#60D86E] text-white'
                      : 'text-gray-600 hover:text-[#60D86E] hover:bg-[#e8f9eb]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex gap-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2.5 rounded-full text-sm font-medium text-center text-red-500 border border-red-200 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <>
                    <Link to="/dang-nhap" className="flex-1 py-2.5 rounded-full text-sm font-medium text-center border border-gray-200 hover:bg-gray-50">
                      Đăng nhập
                    </Link>
                    <Link to="/dang-ky" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-center bg-[#60D86E] text-white hover:bg-[#45c45a]">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

    </>
  )
}
