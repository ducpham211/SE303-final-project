import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg from '../../../assets/hero-field.png'

const DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
  'Quận 6', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Tân Bình',
  'Thủ Đức', 'Bình Dương', 'Đồng Nai',
]

const FIELD_TYPES = ['Sân 5 người', 'Sân 7 người', 'Sân 11 người', 'Sân futsal']

/**
 * Full-width hero section with background photo and quick-search bar.
 */
export default function HeroSection() {
  const [district, setDistrict] = useState('')
  const [fieldType, setFieldType] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      // Fade out indicator when scrolled past 50px
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (district) params.set('district', district)
    if (fieldType) params.set('type', fieldType)
    navigate(`/dat-san?${params.toString()}`)
  }

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Background image */}
      <img
        src={heroImg}
        alt="Sân bóng đá"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay — flat solid, no gradient */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 30, 15, 0.60)' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center py-24 text-center gap-6">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#60D86E] text-white text-xs font-semibold uppercase tracking-widest">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
          [Badge Text Here]
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl">
          [Tiêu đề chính] <span className="text-[#60D86E]">nổi bật</span>,<br />
          [Phần tiếp theo của tiêu đề]
        </h1>
        <p className="text-white/80 text-base sm:text-lg max-w-xl">
          [Đoạn mô tả phụ phụ trợ cho tiêu đề chính. Nêu bật các lợi ích hoặc thông tin tóm tắt để thu hút người dùng.]
        </p>

        {/* Quick Search Bar — Desktop: pill bar / Mobile: card with labeled fields */}

        {/* ── Desktop pill (sm+) ── */}
        <form
          id="hero-search-form"
          onSubmit={handleSearch}
          className="hidden sm:flex w-full max-w-2xl bg-white rounded-full shadow-lg items-center overflow-hidden p-1.5"
        >
          <select
            id="hero-district-select"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="flex-1 px-5 py-3 bg-transparent text-gray-700 text-sm font-medium outline-none cursor-pointer appearance-none"
            aria-label="Chọn khu vực"
          >
            <option value="">Khu vực</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <div className="w-px bg-gray-200 self-stretch my-2" />

          <select
            id="hero-type-select"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="flex-1 px-5 py-3 bg-transparent text-gray-700 text-sm font-medium outline-none cursor-pointer appearance-none"
            aria-label="Chọn loại sân"
          >
            <option value="">Loại sân</option>
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            id="hero-search-btn-desktop"
            type="submit"
            className="px-7 py-3 rounded-full bg-[#60D86E] hover:bg-[#45c45a] text-white font-semibold text-sm transition-all duration-200 flex-shrink-0 active:scale-95"
          >
            Tìm kiếm
          </button>
        </form>

        {/* ── Mobile card (< sm) ── */}
        <form
          id="hero-search-form-mobile"
          onSubmit={handleSearch}
          className="sm:hidden w-full max-w-sm flex flex-col gap-3"
        >
          {/* Filter card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Khu vực row */}
            <div className="px-5 pt-4 pb-3">
              <label htmlFor="hero-district-mobile" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 text-left">
                Khu vực
              </label>
              <select
                id="hero-district-mobile"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer appearance-none"
                aria-label="Chọn khu vực"
              >
                <option value="">Tất cả khu vực</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-gray-100" />

            {/* Loại sân row */}
            <div className="px-5 pt-3 pb-4">
              <label htmlFor="hero-type-mobile" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 text-left">
                Loại sân
              </label>
              <select
                id="hero-type-mobile"
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value)}
                className="w-full bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer appearance-none"
                aria-label="Chọn loại sân"
              >
                <option value="">Tất cả loại sân</option>
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Separate submit button — standalone pill below the card */}
          <button
            id="hero-search-btn-mobile"
            type="submit"
            className="w-full py-4 rounded-full bg-[#60D86E] hover:bg-[#45c45a] text-white font-bold text-sm tracking-wide shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Stats strip */}
        <div className="flex items-center gap-6 sm:gap-10 mt-2">
          {[
            { value: '500+', label: 'Sân bóng' },
            { value: '10K+', label: 'Người dùng' },
            { value: '50K+', label: 'Lượt đặt sân' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[#60D86E] font-extrabold text-xl sm:text-2xl">{stat.value}</div>
              <div className="text-white/70 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator with Transparent Gradient */}
      <div 
        className={`fixed bottom-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6 z-20 pointer-events-none transition-opacity duration-500 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex flex-col items-center gap-1 animate-bounce text-white/80">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-mb-3">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
        </div>
      </div>
    </section>
  )
}
