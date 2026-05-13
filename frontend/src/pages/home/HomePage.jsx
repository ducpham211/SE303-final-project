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
  const { user, login } = useAuthStore()
  const role = user?.role?.replace('ROLE_', '') || 'GUEST'

  // Helper to switch role for testing purposes
  const switchRole = (newRole) => {
    // We mock a login state with the chosen role
    const mockUser = {
      ...user,
      name: user?.name || 'Tester',
      role: `ROLE_${newRole}`
    }
    // Update the store directly
    useAuthStore.setState({ user: mockUser, isLoggedIn: true })
  }

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

      {/* DEV ROLE SWITCHER - Temporary for UI testing */}
      <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-2 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Dev Mode: Switch View</span>
        <div className="flex gap-2">
          <button 
            onClick={() => switchRole('PLAYER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role !== 'ADMIN' && role !== 'OWNER' ? 'bg-[#60D86E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Player
          </button>
          <button 
            onClick={() => switchRole('OWNER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === 'OWNER' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Owner
          </button>
          <button 
            onClick={() => switchRole('ADMIN')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === 'ADMIN' ? 'bg-[#e23670] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  )
}
