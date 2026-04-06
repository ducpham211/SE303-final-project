import HeroSection from './components/HeroSection'
import FeaturedFields from './components/FeaturedFields'
import DashboardTeaser from './components/DashboardTeaser'
import QuickFeatures from './components/QuickFeatures'
import CtaBanner from './components/CtaBanner'

/**
 * Homepage — assembles all homepage sections in order.
 */
export default function HomePage() {
  return (
    <main id="home-page">
      <HeroSection />
      <DashboardTeaser />
      <FeaturedFields />
      <QuickFeatures />
      <CtaBanner />
    </main>
  )
}
