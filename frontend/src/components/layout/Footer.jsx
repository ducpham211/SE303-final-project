import { Link } from 'react-router-dom'

const footerLinks = {
  'Dịch vụ': [
    { label: 'Đặt sân', to: '/dat-san' },
    { label: 'Tìm đối thủ', to: '/tim-doi-thu' },
    { label: 'Cộng đồng', to: '/cong-dong' },
  ],
  'Hỗ trợ': [
    { label: 'Câu hỏi thường gặp', to: '/faq' },
    { label: 'Chính sách bảo mật', to: '/chinh-sach' },
    { label: 'Điều khoản dịch vụ', to: '/dieu-khoan' },
  ],
  'Liên hệ': [
    { label: '📧 contact@timsanbong.vn', to: 'mailto:contact@timsanbong.vn' },
    { label: '📞 1900 1234', to: 'tel:19001234' },
    { label: '📍 TP. Hồ Chí Minh', to: '#' },
  ],
}

const socialLinks = [
  {
    id: 'footer-facebook', label: 'Facebook', href: 'https://facebook.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    id: 'footer-youtube', label: 'YouTube', href: 'https://youtube.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'footer-tiktok', label: 'TikTok', href: 'https://tiktok.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.79a8.18 8.18 0 0 0 4.78 1.52V6.83a4.85 4.85 0 0 1-1.01-.14z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--footer-bg)' }} className="text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#60D86E] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M12 2L10 8H4.5L9 11.5L7 17.5L12 14L17 17.5L15 11.5L19.5 8H14L12 2Z" fill="white" opacity="0.8"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Tim<span className="text-[#60D86E]">san</span>bong
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--footer-text)' }}>
              Nền tảng đặt sân bóng trực tuyến hàng đầu Việt Nam. Tìm sân, đặt chỗ, và kết nối với đối thủ dễ dàng.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  id={s.id}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#60D86E] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-sm hover:text-[#60D86E] transition-colors duration-200"
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--footer-text)' }}>
            © 2026 Timsanbong. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: 'var(--footer-text)' }}>Được làm bởi đội SE303</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
