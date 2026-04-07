import { Link } from 'react-router-dom'

/**
 * Mock field data — replace with API call from fieldService.js when backend is ready.
 */
const FEATURED_FIELDS = [
  {
    id: 1,
    name: 'Sân Bóng Phú Mỹ Hưng',
    address: '18 Nguyễn Lương Bằng, Quận 7',
    price: '180.000',
    type: 'Sân 5 người',
    rating: 4.8,
    reviews: 124,
    available: true,
    color: '#e8f9eb',
  },
  {
    id: 2,
    name: 'Sân Thể Thao Tân Bình',
    address: '45 Hoàng Văn Thụ, Tân Bình',
    price: '220.000',
    type: 'Sân 7 người',
    rating: 4.6,
    reviews: 89,
    available: true,
    color: '#fff8e8',
  },
  {
    id: 3,
    name: 'Sân Futsal Bình Thạnh',
    address: '120 Xô Viết Nghệ Tĩnh, Bình Thạnh',
    price: '160.000',
    type: 'Sân futsal',
    rating: 4.9,
    reviews: 203,
    available: false,
    color: '#e8f0ff',
  },
  {
    id: 4,
    name: 'Sân Cỏ Nhân Tạo Gò Vấp',
    address: '77 Quang Trung, Gò Vấp',
    price: '200.000',
    type: 'Sân 5 người',
    rating: 4.7,
    reviews: 156,
    available: true,
    color: '#fce8ff',
  },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[#60D86E] text-sm">★</span>
      <span className="text-gray-700 text-sm font-semibold">{rating}</span>
    </div>
  )
}

function FieldCard({ field }) {
  return (
    <div
      id={`field-card-${field.id}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail placeholder */}
      <div
        className="w-full aspect-video"
        style={{ backgroundColor: field.color }}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Type badge + availability */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#e8f9eb] text-[#45c45a] text-xs font-semibold">
            {field.type}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              field.available
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-400'
            }`}
          >
            {field.available ? '✓ Còn trống' : '✗ Hết chỗ'}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-bold text-[#1a202c] text-base leading-snug">{field.name}</h3>

        {/* Address */}
        <p className="text-gray-500 text-sm flex items-start gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {field.address}
        </p>

        {/* Rating + price row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <StarRating rating={field.rating} />
            <span className="text-gray-400 text-xs">({field.reviews})</span>
          </div>
          <div className="text-right">
            <span className="text-[#60D86E] font-bold text-base">{field.price}</span>
            <span className="text-gray-400 text-xs">đ/giờ</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/dat-san/${field.id}`}
          id={`field-card-cta-${field.id}`}
          className="mt-1 block w-full text-center py-2.5 rounded-full bg-[#60D86E] hover:bg-[#45c45a] text-white font-semibold text-sm transition-all duration-200 active:scale-95"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}

export default function FeaturedFields() {
  return (
    <section id="featured-fields" className="min-h-screen w-full flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-[#60D86E] text-sm font-semibold uppercase tracking-widest">[Nhãn phụ]</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">[Tiêu đề danh sách]</h2>
        </div>
        <Link
          to="/dat-san"
          id="featured-view-all-btn"
          className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-[#60D86E] text-[#60D86E] text-sm font-semibold hover:bg-[#e8f9eb] transition-all"
        >
          Xem tất cả
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURED_FIELDS.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
      </div>

      {/* Mobile view all */}
      <div className="mt-6 sm:hidden text-center">
        <Link
          to="/dat-san"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-[#60D86E] text-[#60D86E] text-sm font-semibold hover:bg-[#e8f9eb] transition-all"
        >
          Xem tất cả sân
        </Link>
      </div>
    </section>
  )
}
