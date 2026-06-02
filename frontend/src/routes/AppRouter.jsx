import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ScrollToTopButton from '../components/common/ScrollToTopButton'
import ProtectedRoute from '../components/common/ProtectedRoute'

// ── Public / Auth ──────────────────────────────────────────────────────
const HomePage        = lazy(() => import('../pages/home/HomePage'))
const LoginPage       = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage    = lazy(() => import('../pages/auth/RegisterPage'))

// ── Player ────────────────────────────────────────────────────────────
const FieldListPage        = lazy(() => import('../pages/player/FieldListPage'))
const PlayerDashboardPage  = lazy(() => import('../pages/player/PlayerDashboardPage'))
const FieldDetailPage      = lazy(() => import('../pages/player/FieldDetailPage'))
const MessagesPage         = lazy(() => import('../pages/player/MessagesPage'))
const BookingHistoryPage   = lazy(() => import('../pages/player/BookingHistoryPage'))
const ProfilePage          = lazy(() => import('../pages/player/ProfilePage'))

// ── Payment (Stripe callbacks) ────────────────────────────────────────
const PaymentSuccessPage = lazy(() => import('../pages/payment/PaymentSuccessPage'))
const PaymentCancelPage  = lazy(() => import('../pages/payment/PaymentCancelPage'))

// ── Community ─────────────────────────────────────────────────────────
const CommunityPage = lazy(() => import('../pages/community/CommunityPage'))
const ContactPage   = lazy(() => import('../pages/community/ContactPage'))

// ── Admin ─────────────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminUsersPage     = lazy(() => import('../pages/admin/AdminUsersPage'))
const AdminBookingsPage  = lazy(() => import('../pages/admin/AdminBookingsPage'))
const AdminMatchesPage   = lazy(() => import('../pages/admin/AdminMatchesPage'))

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
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-24 min-h-screen">
          <div className="w-8 h-8 border-4 border-[#60D86E] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
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
          <Route path="/dashboard" element={
            <ProtectedRoute><PlayerDashboardPage /></ProtectedRoute>
          } />
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
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={['ADMIN']}><AdminBookingsPage /></ProtectedRoute>
          } />
          <Route path="/admin/matches" element={
            <ProtectedRoute roles={['ADMIN']}><AdminMatchesPage /></ProtectedRoute>
          } />

          {/* ── Misc static pages ───────────────────────────────────── */}
          <Route path="/faq"        element={<PlaceholderPage title="Câu hỏi thường gặp" />} />
          <Route path="/chinh-sach" element={<PlaceholderPage title="Chính sách bảo mật" />} />
          <Route path="/dieu-khoan" element={<PlaceholderPage title="Điều khoản dịch vụ" />} />

          {/* ── 404 ─────────────────────────────────────────────────── */}
          <Route path="*" element={<PlaceholderPage title="Không tìm thấy trang (404)" />} />

        </Routes>
      </Suspense>
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
