import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HomePage from '../pages/home/HomePage'
import ScrollToTopButton from '../components/common/ScrollToTopButton'

/**
 * Central router — all routes are defined here.
 * Protected routes will be wrapped with role guards once auth pages are implemented.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />

        {/* Auth pages — stubs until implemented */}
        <Route path="/dang-nhap" element={<PlaceholderPage title="Đăng nhập" />} />
        <Route path="/dang-ky" element={<PlaceholderPage title="Đăng ký" />} />

        {/* Player pages — stubs */}
        <Route path="/dat-san" element={<PlaceholderPage title="Đặt sân" />} />
        <Route path="/dat-san/:id" element={<PlaceholderPage title="Chi tiết sân" />} />
        <Route path="/lich-dat" element={<PlaceholderPage title="Lịch đặt" />} />
        <Route path="/tim-doi-thu" element={<PlaceholderPage title="Tìm đối thủ" />} />
        <Route path="/tim-doi-thu/tao-keo" element={<PlaceholderPage title="Tạo kèo đấu" />} />
        <Route path="/tim-doi-thu/lich" element={<PlaceholderPage title="Lịch kèo đấu" />} />
        <Route path="/tin-nhan" element={<PlaceholderPage title="Tin nhắn" />} />
        <Route path="/yeu-cau" element={<PlaceholderPage title="Yêu cầu của tôi" />} />

        {/* Community */}
        <Route path="/cong-dong" element={<PlaceholderPage title="Cộng đồng" />} />
        <Route path="/lien-he" element={<PlaceholderPage title="Liên hệ" />} />

        {/* Misc */}
        <Route path="/faq" element={<PlaceholderPage title="Câu hỏi thường gặp" />} />
        <Route path="/chinh-sach" element={<PlaceholderPage title="Chính sách bảo mật" />} />
        <Route path="/dieu-khoan" element={<PlaceholderPage title="Điều khoản dịch vụ" />} />

        {/* 404 */}
        <Route path="*" element={<PlaceholderPage title="Không tìm thấy trang" />} />
      </Routes>
      <ScrollToTopButton />
      <Footer />
    </BrowserRouter>
  )
}

/**
 * Temporary placeholder for unimplemented pages.
 * Remove each one as the real page is built.
 */
function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
      <h1 className="text-2xl font-bold text-[#1a202c]">{title}</h1>
      <p className="text-gray-500">Trang này đang được xây dựng.</p>
    </div>
  )
}
