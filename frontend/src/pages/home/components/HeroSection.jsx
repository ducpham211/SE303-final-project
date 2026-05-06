import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg from '../../../assets/hero-field.png'

const DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
  'Quận 6', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Tân Bình',
  'Thủ Đức', 'Bình Dương', 'Đồng Nai',
]

const FIELD_TYPES = ['FIVE_A_SIDE', 'SEVEN_A_SIDE', 'ELEVEN_A_SIDE']
const FIELD_TYPE_LABELS = {
  'FIVE_A_SIDE': 'Sân 5 người',
  'SEVEN_A_SIDE': 'Sân 7 người',
  'ELEVEN_A_SIDE': 'Sân 11 người'
}

const TIME_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 90;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
});

/**
 * Full-width hero section with background photo and quick-search bar.
 */
export default function HeroSection() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [fieldType, setFieldType] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)
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
    if (date) params.set('date', date)
    if (startTime) params.set('startTime', startTime)
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
          TRUNG TÂM THỂ THAO SUPER KICK
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl">
          Sân bóng <span className="text-[#60D86E]">đẳng cấp</span>,<br />
          Trải nghiệm đỉnh cao
        </h1>
        <p className="text-white/80 text-base sm:text-lg max-w-xl">
          Đặt sân nhanh chóng, tìm kèo dễ dàng. Cơ sở vật chất hiện đại, mặt cỏ tiêu chuẩn FIFA ngay tại trung tâm.
        </p>

        {/* Quick Search Bar — Desktop: pill bar / Mobile: card with labeled fields */}

        {/* ── Desktop pill (sm+) ── */}
        <form
          id="hero-search-form"
          onSubmit={handleSearch}
          className="hidden sm:flex w-full max-w-4xl bg-white rounded-full shadow-lg items-center p-1.5 relative z-20"
        >
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 px-5 py-3 bg-transparent text-gray-700 text-sm font-medium outline-none cursor-pointer"
            aria-label="Chọn ngày"
          />

          <div className="w-px bg-gray-200 self-stretch my-2" />

          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setIsTimeOpen(!isTimeOpen)}
              className="w-full h-full px-5 py-3 bg-transparent text-gray-700 text-sm font-medium outline-none cursor-pointer text-left flex items-center justify-between"
            >
              {startTime || 'Giờ đặt sân'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-400">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isTimeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTimeOpen(false)}></div>
                <div className="absolute top-full left-0 mt-0 w-full min-w-[140px] bg-white shadow-lg border border-gray-300 z-50 max-h-60 overflow-y-auto py-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setStartTime(''); setIsTimeOpen(false); }}
                    className="w-full px-4 py-1.5 text-left hover:bg-[#60D86E] hover:text-white text-sm text-gray-800 transition-none"
                  >
                    Giờ đặt sân
                  </button>
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => { setStartTime(time); setIsTimeOpen(false); }}
                      className={`w-full px-4 py-1.5 text-left text-sm transition-none ${
                        startTime === time 
                          ? 'bg-[#60D86E] text-white' 
                          : 'text-gray-800 hover:bg-[#60D86E] hover:text-white'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>



          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => { setIsTimeOpen(false); setIsTypeOpen(!isTypeOpen); }}
              className="w-full h-full px-5 py-3 bg-transparent text-gray-700 text-sm font-medium outline-none cursor-pointer text-left flex items-center justify-between"
            >
              {fieldType ? FIELD_TYPE_LABELS[fieldType] : 'Loại sân'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-400">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isTypeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTypeOpen(false)}></div>
                <div className="absolute top-full left-0 mt-0 w-full min-w-[140px] bg-white shadow-lg border border-gray-300 z-50 max-h-60 overflow-y-auto py-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setFieldType(''); setIsTypeOpen(false); }}
                    className="w-full px-4 py-1.5 text-left hover:bg-[#60D86E] hover:text-white text-sm text-gray-800 transition-none"
                  >
                    Tất cả loại sân
                  </button>
                  {FIELD_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setFieldType(t); setIsTypeOpen(false); }}
                      className={`w-full px-4 py-1.5 text-left text-sm transition-none ${
                        fieldType === t 
                          ? 'bg-[#60D86E] text-white' 
                          : 'text-gray-800 hover:bg-[#60D86E] hover:text-white'
                      }`}
                    >
                      {FIELD_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
            {/* Ngày & Giờ row */}
            <div className="flex border-b border-gray-100">
              <div className="px-5 pt-4 pb-3 flex-1 border-r border-gray-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 text-left">Ngày đặt</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer"
                />
              </div>
              <div className="px-5 pt-4 pb-3 flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 text-left">Giờ bắt đầu</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer appearance-none"
                >
                  <option value="">Chọn giờ</option>
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loại sân row */}
            <div className="flex">
              <div className="px-5 pt-4 pb-4 flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 text-left">Loại sân</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer appearance-none"
                >
                  <option value="">Tất cả</option>
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
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

        {/* Address Info */}
        <a 
          href="https://maps.google.com/?q=Khu+phố+34,+Phường+Linh+Xuân,+Thành+phố+Hồ+Chí+Minh" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-4 text-white/90 hover:text-white transition-colors group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-sm sm:text-base font-medium tracking-wide underline underline-offset-4 decoration-white/30 group-hover:decoration-white/80">
            Khu phố 34, Phường Linh Xuân, Thành phố Hồ Chí Minh
          </span>
        </a>
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
