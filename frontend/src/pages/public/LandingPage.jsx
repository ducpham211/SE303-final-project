import HeroSection from '../home/components/HeroSection'
import FeaturedFields from '../home/components/FeaturedFields'
import DashboardTeaser from '../home/components/DashboardTeaser'
import QuickFeatures from '../home/components/QuickFeatures'
import CtaBanner from '../home/components/CtaBanner'
import useAuthStore from '../../store/useAuthStore'

/**
 * Public Landing Page / Player Home
 * Shows promotional content for guests and upcoming schedules for players.
 */
export default function LandingPage() {
  const { user } = useAuthStore()
  const role = user?.role?.replace('ROLE_', '') || 'GUEST'

  return (
    <main id="landing-page" className="flex-1">
      <HeroSection />
      {role === 'PLAYER' && <DashboardTeaser />}
      <FeaturedFields />
      <QuickFeatures />
      <CtaBanner />
    </main>
  )
}
