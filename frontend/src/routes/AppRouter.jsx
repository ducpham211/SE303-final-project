import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollToTopButton from "../components/common/ScrollToTopButton";
import ProtectedRoute from "../components/common/ProtectedRoute";
import ChatBot from "../components/common/ChatBot";

// ── Public / Auth ──────────────────────────────────────────────────────
const HomePage = lazy(() => import("../pages/home/HomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));

// ── Player ────────────────────────────────────────────────────────────
const FieldListPage = lazy(() => import("../pages/player/FieldListPage"));
const PlayerDashboardPage = lazy(
  () => import("../pages/player/PlayerDashboardPage"),
);
const FieldDetailPage = lazy(() => import("../pages/player/FieldDetailPage"));
const MessagesPage = lazy(() => import("../pages/player/MessagesPage"));
const BookingHistoryPage = lazy(
  () => import("../pages/player/BookingHistoryPage"),
);
const BookingDetailPage = lazy(
  () => import("../pages/player/BookingDetailPage"),
);
const ProfilePage = lazy(() => import("../pages/player/ProfilePage"));
const TeamPage = lazy(() => import("../pages/player/TeamPage"));
const TeamDetailPage = lazy(() => import("../pages/player/TeamDetailPage"));

// ── Payment (Stripe callbacks) ────────────────────────────────────────
const PaymentSuccessPage = lazy(
  () => import("../pages/payment/PaymentSuccessPage"),
);
const PaymentCancelPage = lazy(
  () => import("../pages/payment/PaymentCancelPage"),
);

// ── Matchmaking ─────────────────────────
import FindOpponentPage from '../pages/find_opponent/FindOpponentPage'

// ── Community ─────────────────────────────────────────────────────────
import CommunityPage from "../pages/community/CommunityPage";

// ── Admin ─────────────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminFieldsPage = lazy(() => import("../pages/admin/AdminFieldsPage"));
const AdminMatchesPage = lazy(() => import("../pages/admin/AdminMatchesPage"));
const AdminReviewsPage = lazy(() => import("../pages/admin/AdminReviewsPage"));

// Owner
import OwnerFieldsPage from "../pages/owner/OwnerFieldsPage";
import OwnerBookingsPage from "../pages/owner/OwnerBookingsPage";


/**
 * Central router — all application routes are defined here.
 *
 * Role hierarchy used by ProtectedRoute:
 *   PLAYER  → can access /lich-dat, /ho-so, /tin-nhan, /dat-san/*
 *   OWNER   → /owner/*
 *   ADMIN   → /admin/*
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-24 min-h-screen">
            <div className="w-8 h-8 border-4 border-[#60D86E] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
          {/* ── Public ──────────────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Sân bóng (public browse, auth required to book) ─────── */}
          <Route path="/fields" element={<FieldListPage />} />
          <Route path="/fields/:id" element={<FieldDetailPage />} />

          {/* ── Payment callbacks (Stripe) ───────────────────────────── */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

          {/* ── Player (auth required) ───────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PlayerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-history"
            element={
              <ProtectedRoute>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-history/:id"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamDetailPage />
              </ProtectedRoute>
            }
          />

          {/* ── Matchmaking (built by another team member) ───────────── */}
          <Route
            path="/matchmaking"
            element={<FindOpponentPage />}
          />
          <Route
            path="/matchmaking/create"
            element={<PlaceholderPage title="Tạo kèo đấu" />}
          />
          <Route
            path="/matchmaking/schedule"
            element={<PlaceholderPage title="Lịch kèo đấu" />}
          />

          {/* ── Community ───────────────────────────────────────────── */}
          <Route path="/community" element={<CommunityPage />} />

          {/* ── Admin (ADMIN role required) ──────────────────────────── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fields"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminFieldsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/matches"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminMatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminReviewsPage />
              </ProtectedRoute>
            }
          />

          {/* Owner (OWNER role required) */}
          <Route
            path="/owner/fields"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <OwnerFieldsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <OwnerBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* ── Misc static pages ───────────────────────────────────── */}
          <Route
            path="/faq"
            element={<PlaceholderPage title="Câu hỏi thường gặp" />}
          />
          <Route
            path="/privacy-policy"
            element={<PlaceholderPage title="Chính sách bảo mật" />}
          />
          <Route
            path="/terms-of-service"
            element={<PlaceholderPage title="Điều khoản dịch vụ" />}
          />

          {/* ── 404 ─────────────────────────────────────────────────── */}
          <Route
            path="*"
            element={<PlaceholderPage title="Không tìm thấy trang (404)" />}
          />
        </Routes>
      </Suspense>
      <ScrollToTopButton />
      <Footer />
      <ChatBot />
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
      <h1 className="text-2xl font-bold text-[#1a202c]">{title}</h1>
      <p className="text-gray-500">Trang này đang được xây dựng.</p>
    </div>
  );
}
