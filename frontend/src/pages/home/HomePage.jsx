import useAuthStore from '../../store/useAuthStore'
import AdminDashboardTeaser from '../admin/AdminDashboardTeaser'
import OwnerDashboardTeaser from '../owner/OwnerDashboardTeaser'
import LandingPage from '../public/LandingPage'

/**
 * Global Home Router — 
 * Acts as the "/" index determining which dashboard to serve 
 * based on the user's role (RBAC folder separation pattern).
 */
export default function HomePage() {
  const { user } = useAuthStore()
  const role = user?.role?.replace('ROLE_', '') || 'GUEST'

  // Admin Home View
  if (role === 'ADMIN') {
    return (
      <main id="home-page-admin" className="pt-24 min-h-[calc(100vh-64px)] bg-[#f8faf8] flex flex-col">
        <AdminDashboardTeaser />
      </main>
    )
  }

  // Owner Home View
  if (role === 'OWNER') {
    return (
      <main id="home-page-owner" className="pt-24 min-h-[calc(100vh-64px)] bg-[#f8faf8] flex flex-col">
        <OwnerDashboardTeaser />
      </main>
    )
  }

  // Player & Guest Home View
  return <LandingPage />
}
