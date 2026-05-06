import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import fieldService from '../../../services/fieldService'

// Ảnh fallback theo loại sân khi API không trả về ảnh
const FALLBACK_IMAGES = {
  FIVE_A_SIDE: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  SEVEN_A_SIDE: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80',
  ELEVEN_A_SIDE: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80',
}

const TYPE_META = {
  FIVE_A_SIDE:   { name: 'Sân 5 người',   details: 'Dành cho các đội nhóm nhỏ, cỏ nhân tạo đạt chuẩn.' },
  SEVEN_A_SIDE:  { name: 'Sân 7 người',   details: 'Thích hợp cho giải đấu phong trào, mặt sân rộng rãi.' },
  ELEVEN_A_SIDE: { name: 'Sân 11 người',  details: 'Tiêu chuẩn thi đấu chuyên nghiệp, mặt cỏ cao cấp.' },
}

/** Group fields by type, lấy giá min của time slots trong mỗi nhóm */
function groupFieldsByType(fields) {
  const grouped = {}
  fields.forEach(field => {
    const type = field.fieldType || field.type
    if (!grouped[type]) {
      grouped[type] = { type, fields: [], minPrice: Infinity }
    }
    grouped[type].fields.push(field)
    // Lấy giá thấp nhất từ timeSlots nếu có
    if (field.timeSlots?.length) {
      field.timeSlots.forEach(slot => {
        const price = parseFloat(slot.price)
        if (price < grouped[type].minPrice) grouped[type].minPrice = price
      })
    }
  })
  // Chuyển sang mảng, format lại để dùng trong carousel
  return Object.entries(grouped).map(([type, data]) => ({
    id: type,
    name: TYPE_META[type]?.name || type,
    details: TYPE_META[type]?.details || '',
    price: data.minPrice === Infinity ? null : data.minPrice.toLocaleString('vi-VN'),
    image: FALLBACK_IMAGES[type] || FALLBACK_IMAGES.FIVE_A_SIDE,
    count: data.fields.length,
  }))
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border-2 border-[#60D86E] shadow-2xl animate-pulse">
      <div className="w-full h-60 bg-gray-200" />
      <div className="p-8 flex flex-col gap-4 items-center">
        <div className="h-7 w-40 bg-gray-200 rounded-full" />
        <div className="h-4 w-56 bg-gray-100 rounded-full" />
        <div className="h-4 w-48 bg-gray-100 rounded-full mt-1" />
        <div className="h-9 w-32 bg-gray-200 rounded-full mt-4" />
      </div>
    </div>
  )
}

export default function FeaturedFields() {
  const [fieldTypes, setFieldTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(1000000 * 3 + 1)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await fieldService.getFields()
        const grouped = groupFieldsByType(data)
        setFieldTypes(grouped.length ? grouped : [])
        // Đặt initial index sao cho ở giữa nhóm đầu tiên
        setActiveIndex(1000000 * (grouped.length || 3) + 1)
      } catch (err) {
        console.error('FeaturedFields: failed to load', err)
        setError('Không thể tải dữ liệu sân. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handlePrev = () => setActiveIndex(prev => prev - 1)
  const handleNext = () => setActiveIndex(prev => prev + 1)
  const handleBook = (typeId) => navigate(`/dat-san?type=${typeId}`)

  const virtualOffsets = [-2, -1, 0, 1, 2]
  const len = fieldTypes.length || 1

  return (
    <section id="featured-fields" className="min-h-screen w-full flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col items-center mb-12 text-center">
        <span className="text-[#60D86E] text-sm font-bold uppercase tracking-widest mb-2">HỆ THỐNG SÂN</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a202c]">Các loại sân tiêu biểu</h2>
        <p className="text-gray-500 mt-3 max-w-2xl">
          Super Kick cung cấp đa dạng các loại sân bóng, đáp ứng mọi nhu cầu từ giao hữu phong trào đến thi đấu chuyên nghiệp.
          Lướt để xem và chọn sân phù hợp với bạn.
        </p>
      </div>

      {error && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base">{error}</p>
        </div>
      )}

      {!error && (
        <div className="relative h-[480px] w-full flex items-center justify-center">
          {loading ? (
            // Skeleton chỉ hiện card trung tâm khi đang load
            <div className="w-full max-w-sm sm:max-w-md">
              <SkeletonCard />
            </div>
          ) : (
            virtualOffsets.map((offset) => {
              const index = activeIndex + offset
              const actualIndex = ((index % len) + len) % len
              const field = fieldTypes[actualIndex]
              if (!field) return null

              const isActive = offset === 0
              const isPrev = offset === -1
              const isNext = offset === 1

              let transformStyle = ''
              let zIndex = 0
              let opacity = 0

              if (isActive) {
                transformStyle = 'translateX(0) scale(1)'
                zIndex = 20; opacity = 1
              } else if (isPrev) {
                transformStyle = 'translateX(-60%) scale(0.85)'
                zIndex = 10; opacity = 0.5
              } else if (isNext) {
                transformStyle = 'translateX(60%) scale(0.85)'
                zIndex = 10; opacity = 0.5
              } else {
                transformStyle = offset < 0 ? 'translateX(-100%) scale(0.7)' : 'translateX(100%) scale(0.7)'
                zIndex = 0; opacity = 0
              }

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isActive) handleBook(field.id)
                    else if (isPrev) handlePrev()
                    else if (isNext) handleNext()
                  }}
                  className="absolute w-full max-w-sm sm:max-w-md transition-all duration-500 ease-out cursor-pointer"
                  style={{ transform: transformStyle, zIndex, opacity, pointerEvents: (isActive || isPrev || isNext) ? 'auto' : 'none' }}
                >
                  <div className={`bg-white rounded-[2rem] overflow-hidden border-2 ${isActive ? 'border-[#60D86E] shadow-2xl' : 'border-transparent shadow-lg'} flex flex-col h-full`}>
                    <div className="w-full h-60 relative group overflow-hidden">
                      <img src={field.image} alt={field.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      {isActive && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-[#60D86E] text-white px-8 py-3 rounded-full font-bold shadow-md text-lg flex items-center gap-2">
                            Đặt sân ngay
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col gap-4">
                      <div className="text-center">
                        <h3 className="font-bold text-[#1a202c] text-2xl">{field.name}</h3>
                        {field.count > 0 && (
                          <span className="text-xs text-[#60D86E] font-bold">{field.count} sân đang hoạt động</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-base text-center min-h-[48px]">{field.details}</p>
                      <div className="text-center mt-2 pt-5 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">Giá đặt sân từ</span>
                        <div className="text-[#60D86E] font-black text-3xl">
                          {field.price ? `${field.price}đ` : 'Liên hệ'}
                          <span className="text-base font-medium text-gray-500"> / giờ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {!loading && (
            <>
              <button onClick={handlePrev} className="absolute left-0 sm:left-4 lg:left-10 z-30 p-4 rounded-full bg-white shadow-xl border border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:scale-110 active:scale-95">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#1a202c]"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={handleNext} className="absolute right-0 sm:right-4 lg:right-10 z-30 p-4 rounded-full bg-white shadow-xl border border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:scale-110 active:scale-95">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#1a202c]"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
