const AMENITIES = [
  {
    id: 'amenity-water',
    title: 'Trà đá & Nước suối',
    description: 'Miễn phí bình trà đá cho mỗi sân. Nước suối ướp lạnh sẵn sàng phục vụ tại căng tin.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
        <path d="M12 2v20M8 2h8M12 22A6 6 0 0 0 12 10 6 6 0 0 0 12 22Z" />
      </svg>
    ),
    bgColor: '#EFF6FF',
    iconColor: '#3b82f6',
  },
  {
    id: 'amenity-parking',
    title: 'Bãi đỗ xe rộng rãi',
    description: 'Khu vực đỗ xe an toàn, có mái che, đủ sức chứa cho hàng trăm ô tô và xe máy.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#60D86E]">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg>
    ),
    bgColor: '#F0FDF4',
    iconColor: '#60D86E',
  },
  {
    id: 'amenity-rental',
    title: 'Thuê giày & Áo Bib',
    description: 'Cung cấp đủ size giày và áo pitch phân đội giặt sạch sẽ thơm tho mỗi ngày.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f59e0b]">
        <path d="M20 16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3c0-1.5.5-3 1.5-4C6.5 8 8 6 12 6s5.5 2 6.5 3c1 1 1.5 2.5 1.5 4v3z" />
        <path d="M12 6V3" />
      </svg>
    ),
    bgColor: '#FFFBEB',
    iconColor: '#f59e0b',
  },
  {
    id: 'amenity-referee',
    title: 'Trọng tài & Bình luận',
    description: 'Hỗ trợ đặt lịch trọng tài chuyên nghiệp và dịch vụ quay phát trực tiếp trận đấu.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8b5cf6]">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    bgColor: '#F5F3FF',
    iconColor: '#8b5cf6',
  },
  {
    id: 'amenity-canteen',
    title: 'Căng tin đa dạng',
    description: 'Phục vụ đồ ăn nhẹ, thức ăn nhanh và các loại đồ uống bổ sung năng lượng.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ef4444]">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    bgColor: '#FEF2F2',
    iconColor: '#ef4444',
  },
  {
    id: 'amenity-shower',
    title: 'Phòng tắm & Thay đồ',
    description: 'Hệ thống phòng tắm nóng lạnh hiện đại, khu thay đồ riêng tư và tủ khóa an toàn.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#14b8a6]">
        <path d="M10 2v7" />
        <path d="M14 2v7" />
        <path d="M10 16v5" />
        <path d="M14 16v5" />
        <rect x="4" y="9" width="16" height="7" rx="2" />
      </svg>
    ),
    bgColor: '#F0FDFA',
    iconColor: '#14b8a6',
  },
]

function AmenityCard({ amenity }) {
  return (
    <div
      className="rounded-3xl p-6 flex items-start gap-5 bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
    >
      {/* Icon bubble */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
        style={{ backgroundColor: amenity.bgColor }}
      >
        {amenity.icon}
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <h3 className="font-bold text-[#1a202c] text-lg">{amenity.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{amenity.description}</p>
      </div>
    </div>
  )
}

export default function QuickFeatures() {
  return (
    <section
      id="quick-features"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#60D86E] text-sm font-extrabold uppercase tracking-widest">DỊCH VỤ ĐI KÈM</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a202c] mt-2">
            Tiện ích ngập tràn tại sân
          </h2>
          <p className="text-gray-500 text-base mt-3 max-w-xl mx-auto">
            Super Kick không chỉ có mặt cỏ đẹp, chúng tôi cung cấp mọi tiện ích xung quanh để trải nghiệm thi đấu của bạn hoàn hảo nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AMENITIES.map((a) => (
            <AmenityCard key={a.id} amenity={a} />
          ))}
        </div>
      </div>
    </section>
  )
}
