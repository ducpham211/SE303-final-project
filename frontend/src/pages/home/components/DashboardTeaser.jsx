import { Link } from 'react-router-dom'
import useAuthStore from '../../../store/useAuthStore'

/**
 * Mock data — in production, fetch from /api/bookings/upcoming and /api/matches/upcoming.
 */
const MOCK_BOOKINGS = [
  { id: 1, field: 'Sân Phú Mỹ Hưng', time: 'Thứ 7, 10/04 — 18:00–19:00' },
  { id: 2, field: 'Sân Tân Bình', time: 'CN, 12/04 — 16:00–17:30' },
]

const MOCK_MATCHES = [
  { id: 1, opponent: 'FC Gò Vấp Stars', field: 'Sân Bình Thạnh', time: 'Thứ 7, 10/04 — 19:30' },
  { id: 2, opponent: 'Quận 7 FC', field: 'Sân Phú Mỹ Hưng', time: 'CN, 12/04 — 08:00' },
]

const PENDING_COUNT = 3

function SummaryCard({ id, title, icon, accentColor, children, ctaLabel, ctaTo }) {
  return (
    <div
      id={id}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
    >
      {/* Card header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: accentColor + '22' }}
        >
          {icon}
        </div>
        <h3 className="font-bold text-[#1a202c] text-base">{title}</h3>
      </div>

      {/* Content slot */}
      <div className="flex-1">{children}</div>

      {/* CTA */}
      <Link
        to={ctaTo}
        className="block w-full text-center py-2.5 rounded-full border-2 font-semibold text-sm transition-all duration-200 hover:brightness-90"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

export default function DashboardTeaser() {
  const { isLoggedIn, user } = useAuthStore()

  if (!isLoggedIn) return null

  return (
    <section
      id="dashboard-teaser"
      className="min-h-screen w-full flex flex-col justify-center py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section header */}
      <div className="mb-8">
        <span className="text-[#60D86E] text-sm font-semibold uppercase tracking-widest">Hoạt động của bạn</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">
          Chào mừng trở lại, {user?.name || 'bạn'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Upcoming bookings */}
        <SummaryCard
          id="dashboard-bookings-card"
          title="Lịch đặt sắp tới"
          icon={<div className="w-2.5 h-2.5 rounded-full bg-current" />}
          accentColor="#60D86E"
          ctaLabel="Xem lịch đặt"
          ctaTo="/lich-dat"
        >
          <ul className="space-y-3">
            {MOCK_BOOKINGS.map((b) => (
              <li key={b.id} className="flex flex-col gap-0.5 p-3 rounded-2xl bg-[#f8faf8] border border-[#e8f9eb]">
                <span className="text-sm font-semibold text-[#1a202c]">{b.field}</span>
                <span className="text-xs text-gray-500">{b.time}</span>
              </li>
            ))}
          </ul>
        </SummaryCard>

        {/* Card 2: Upcoming matches */}
        <SummaryCard
          id="dashboard-matches-card"
          title="Kèo đấu sắp tới"
          icon={<div className="w-2.5 h-2.5 rounded-full bg-current" />}
          accentColor="#3b82f6"
          ctaLabel="Đến kèo đấu"
          ctaTo="/tim-doi-thu/lich"
        >
          <ul className="space-y-3">
            {MOCK_MATCHES.map((m) => (
              <li key={m.id} className="flex flex-col gap-0.5 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-sm font-semibold text-[#1a202c]">vs {m.opponent}</span>
                <span className="text-xs text-gray-500">{m.field} · {m.time}</span>
              </li>
            ))}
          </ul>
        </SummaryCard>

        {/* Card 3: Pending requests */}
        <SummaryCard
          id="dashboard-pending-card"
          title="Yêu cầu đang chờ"
          icon={<div className="w-2.5 h-2.5 rounded-full bg-current" />}
          accentColor="#f59e0b"
          ctaLabel="Quản lý yêu cầu"
          ctaTo="/yeu-cau"
        >
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center">
              <span className="text-4xl font-extrabold text-amber-500">{PENDING_COUNT}</span>
            </div>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Bạn có <strong className="text-amber-500">{PENDING_COUNT} yêu cầu</strong> đang chờ phản hồi từ đối thủ.
            </p>
          </div>
        </SummaryCard>
      </div>
    </section>
  )
}
