import { useNavigate } from 'react-router-dom'
import communityImg from '../../../assets/community.png'
const COMMUNITY_FEATURES = [
  {
    id: 'find-players',
    title: 'Tìm đối thủ',
    path: '/tim-doi-thu',
    description: 'Tìm kiếm và kết nối với người chơi bóng đá phù hợp với trình độ của bạn',
    icon: (
      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    buttonText: 'Tìm ngay',
  },
  {
    id: 'leaderboard',
    title: 'Bảng xếp hạng',
    description: 'Theo dõi điểm số và vị trí của các đội bóng',
    icon: (
      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    buttonText: 'Xem bảng',
  },
  {
    id: 'news',
    title: 'Tin tức',
    description: 'Tham gia các giải đấu và sự kiện bóng đá trong cộng đồng',
    icon: (
      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    ),
    buttonText: 'Tham gia',
  },
]

function CommunityCard({ feature }) {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#60D86E]">
          {feature.icon}
        </div>
        <h3 className="text-lg font-semibold text-[#1a202c]">{feature.title}</h3>
      </div>
      <p className="text-sm text-[#4a5568] mb-4">
        {feature.description}
      </p>
      <button
        onClick={() => navigate(feature.path)}
        className="w-full rounded-full bg-[#60D86E] px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-[#45c45a] hover:-translate-y-1 active:scale-95">
        {feature.buttonText}
      </button>
    </div>
  )
}

export default function CommunityFeatures() {
  return (
    <section 
        id="community-features"
        className="relative min-h-screen bg-[#f8faf8] py-20 flex items-center">
        {/* Background image */}
            <img
                src={communityImg}
                alt="Sân bóng đá"
                className="absolute inset-0 w-full h-full object-cover"
            />   
        {/* Dark overlay — flat solid, no gradient */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(10, 30, 15, 0.60)' }}
            />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl">
            Tim<span className="text-[#60D86E]">san</span>bong
          </h1>
          <p className="text-white text-base sm:text-lg max-w-xl">
            Kết nối với cộng đồng, nắm bắt thông tin và tham gia các hoạt động
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY_FEATURES.map((f) => (
            <CommunityCard key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </section>
  )
}
