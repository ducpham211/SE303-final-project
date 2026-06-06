import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ScrollToTopButton from '../components/common/ScrollToTopButton'
import ProtectedRoute from '../components/common/ProtectedRoute'

// ── Public / Auth ──────────────────────────────────────────────────────
import HomePage        from '../pages/home/HomePage'
import LoginPage       from '../pages/auth/LoginPage'
import RegisterPage    from '../pages/auth/RegisterPage'

// ── Player ────────────────────────────────────────────────────────────
import FieldListPage        from '../pages/player/FieldListPage'
import FieldDetailPage      from '../pages/player/FieldDetailPage'
import MessagesPage         from '../pages/player/MessagesPage'
import BookingHistoryPage   from '../pages/player/BookingHistoryPage'
import ProfilePage          from '../pages/player/ProfilePage'

// ── Payment (Stripe callbacks) ────────────────────────────────────────
import PaymentSuccessPage from '../pages/payment/PaymentSuccessPage'
import PaymentCancelPage  from '../pages/payment/PaymentCancelPage'

// ── Community ─────────────────────────────────────────────────────────
import CommunityPage from '../pages/community/CommunityPage'
import ContactPage   from '../pages/community/ContactPage'

// ── Admin ─────────────────────────────────────────────────────────────
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminUsersPage     from '../pages/admin/AdminUsersPage'
import AdminMatchesPage   from '../pages/admin/AdminMatchesPage'
import AdminReviewsPage   from '../pages/admin/AdminReviewsPage'
import AdminFieldsPage    from '../pages/admin/AdminFieldsPage'

/**
 * Central router — all application routes are defined here.
 *
 * Role hierarchy used by ProtectedRoute:
 *   PLAYER  → can access /lich-dat, /ho-so, /tin-nhan, /dat-san/*
 *   OWNER   → (currently handled by OwnerDashboardTeaser embedded in HomePage)
 *   ADMIN   → /admin/*
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* ── Public ──────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky"   element={<RegisterPage />} />

        {/* ── Sân bóng (public browse, auth required to book) ─────── */}
        <Route path="/dat-san"     element={<FieldListPage />} />
        <Route path="/dat-san/:id" element={<FieldDetailPage />} />

        {/* ── Payment callbacks (Stripe) ───────────────────────────── */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel"  element={<PaymentCancelPage />} />

        {/* ── Player (auth required) ───────────────────────────────── */}
        <Route path="/lich-dat" element={
          <ProtectedRoute><BookingHistoryPage /></ProtectedRoute>
        } />
        <Route path="/ho-so" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/tin-nhan" element={
          <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />

        {/* ── Matchmaking (built by another team member) ───────────── */}
        <Route path="/tim-doi-thu"        element={<PlaceholderPage title="Tìm đối thủ" />} />
        <Route path="/tim-doi-thu/tao-keo" element={<PlaceholderPage title="Tạo kèo đấu" />} />
        <Route path="/tim-doi-thu/lich"    element={<PlaceholderPage title="Lịch kèo đấu" />} />

        {/* ── Community ───────────────────────────────────────────── */}
        <Route path="/cong-dong" element={<CommunityPage />} />
        <Route path="/lien-he"   element={<ContactPage />} />

        {/* ── Admin (ADMIN role required) ──────────────────────────── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>
        } />
        <Route path="/admin/fields" element={
          <ProtectedRoute roles={['ADMIN']}><AdminFieldsPage /></ProtectedRoute>
        } />
        <Route path="/admin/matches" element={
          <ProtectedRoute roles={['ADMIN']}><AdminMatchesPage /></ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute roles={['ADMIN']}><AdminReviewsPage /></ProtectedRoute>
        } />

        {/* ── Misc static pages ───────────────────────────────────── */}
        <Route path="/faq"        element={<PlaceholderPage title="Câu hỏi thường gặp" />} />
        <Route path="/chinh-sach" element={<PlaceholderPage title="Chính sách bảo mật" />} />
        <Route path="/dieu-khoan" element={<PlaceholderPage title="Điều khoản dịch vụ" />} />

        {/* ── 404 ─────────────────────────────────────────────────── */}
        <Route path="*" element={<PlaceholderPage title="Không tìm thấy trang (404)" />} />

      </Routes>
      <ScrollToTopButton />
      <Footer />
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
      <h1 className="text-2xl font-bold text-[#1a202c]">{title}</h1>
      <p className="text-gray-500">Trang này đang được xây dựng.</p>
    </div>
  )
}
