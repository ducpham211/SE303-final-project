import useAuthStore from '../../store/useAuthStore'
import { Navigate } from 'react-router-dom'
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

  const renderContent = () => {
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }

    if (role === 'OWNER') {
      return (
        <main id="home-page-owner" className="pt-24 min-h-[calc(100vh-64px)] bg-[#f8faf8] flex flex-col">
          <OwnerDashboardTeaser />
        </main>
      )
    }

    return <LandingPage />
  }

  return (
    <div className="relative">
      {renderContent()}
    </div>
  )
}
