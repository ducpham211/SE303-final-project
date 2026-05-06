import competitiveImg from '../../../assets/competitive.png'
import growthImg from '../../../assets/growth.png'
import manageImg from '../../../assets/management.png'
const COMMUNITY_SECTIONS = [
  {
    id: 'Competitive-experience',
    title: 'Trải nghiệm thi đấu tranh hạng chuyên nghiệp',
    description: 'Việc cập nhật nhanh các chỉ số trận đấu và quản lý bảng xếp hạng chuẩn xác đã trở thành chìa khóa để khẳng định vị thế đội bóng. Các công cụ này cho phép cập nhật ghi bàn, tìm đối thủ phù hợp và phân tích hiệu suất trận đấu một cách chính xác, giúp các đội bóng chuyên nghiệp có thể đưa ra quyết định chiến lược hiệu quả',
    image: competitiveImg,
  },  
  {
    id: 'community-growth',
    title: 'Giải pháp kết nối và phát triển cộng đồng bóng đá nhanh chóng',
    description: 'Chỉ cần một trang web, bạn có thể tìm đối thủ cùng trình độ và nâng cao kỹ năng bóng đá của mình một cách nhanh chóng. Với Timsanbong, bạn có thể kết nối với người chơi có cùng trình độ. Duới đây là những lợi ích bạn có thể nhận được: Tìm đối thủ phù hợp với trình độ của bạn; Đánh giá người chơi sau mỗi trận đấu; Theo dõi bằng xếp hạng và cấp nhật thông tin chính xác...',
    image: growthImg,
  },
  {
    id: 'revenue-growth',
    title: 'Tối ưu vận hành sân bóng để thu hút nhiều khách hàng hơn mỗi ngày',
    description: 'Tối ưu vận hành sân bóng để tăng và thu hút khách hàng hiệu quả là điều mà các chủ sân bóng hiện đang quan tâm hàng đầu. Timsanbong đảm bảo giao dịch và hỗ trợ khách hàng tận tình, bạn sẽ được hướng dẫn cách quản lý sân bóng hiệu quả để thu hút nhiều khách hàng hơn mỗi ngày.',
    image: manageImg,
  },
]

function CommunitySection({ section }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Image */}
      <div className="h-48 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <img 
          src={section.image} 
          alt={section.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-[#1a202c] leading-snug">
          {section.title}
        </h3>
        <p className="text-sm text-[#4a5568] leading-relaxed">
          {section.description}
        </p>
      </div>
    </div>
  )
}

export default function CommunitySections() {
  return (
    <section 
        id="community-sections"
        className="bg-white py-12">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY_SECTIONS.map((section) => (
            <CommunitySection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </section>
  )
}
