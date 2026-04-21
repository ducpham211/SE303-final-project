import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import fieldService from '../../services/fieldService'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[#60D86E] text-sm">★</span>
      <span className="text-gray-700 text-sm font-semibold">{rating || '5.0'}</span>
    </div>
  )
}

function FieldCard({ field }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div 
        className="w-full aspect-video bg-gray-100" 
        style={{ backgroundColor: field.coverImage || '#e8f9eb' }}
      />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#e8f9eb] text-[#45c45a] text-xs font-semibold">
            {field.type === 'FIVE_A_SIDE' ? 'Sân 5 người' : field.type === 'SEVEN_A_SIDE' ? 'Sân 7 người' : 'Sân 11 người'}
          </span>
        </div>
        <h3 className="font-bold text-[#1a202c] text-base leading-snug line-clamp-2">{field.name}</h3>
        <Link
          to={`/dat-san/${field.id}`}
          className="mt-auto block w-full text-center py-2.5 rounded-full bg-[#60D86E] hover:bg-[#45c45a] text-white font-semibold text-sm transition-all duration-200 active:scale-95"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
      <div className="w-full aspect-video bg-gray-200" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="w-24 h-6 bg-gray-200 rounded-full" />
        <div className="w-3/4 h-5 bg-gray-200 rounded mt-2" />
        <div className="w-1/2 h-4 bg-gray-200 rounded mt-1" />
        <div className="w-full h-10 bg-gray-200 rounded-full mt-auto" />
      </div>
    </div>
  )
}

export default function FieldListPage() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    fetchFields()
  }, [filterType])

  const fetchFields = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fieldService.getFields(filterType ? { type: filterType } : {})
      setFields(data)
    } catch (err) {
      setError('Không thể tải danh sách sân. Vui lòng thử lại sau.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fieldTypes = [
    { value: '', label: 'Tất cả' },
    { value: 'FIVE_A_SIDE', label: 'Sân 5' },
    { value: 'SEVEN_A_SIDE', label: 'Sân 7' },
    { value: 'ELEVEN_A_SIDE', label: 'Sân 11' }
  ]

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a202c]">Đặt sân</h1>
          <p className="text-gray-500 mt-2 mb-6">Hàng trăm sân bóng chất lượng đang chờ bạn.</p>
          
          <div className="flex flex-wrap gap-2">
            {fieldTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filterType === type.value 
                    ? 'bg-[#1a202c] text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a202c]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content State */}
        {error ? (
          <div className="bg-red-50 text-red-500 p-6 rounded-3xl text-center border border-red-100 flex flex-col items-center">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
               <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
             </svg>
             <p className="font-semibold">{error}</p>
             <button onClick={fetchFields} className="mt-4 px-6 py-2 bg-white text-red-500 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors">Thử lại</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : fields.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 mb-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <h3 className="text-xl font-bold text-[#1a202c]">Không tìm thấy sân nào</h3>
            <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc quay lại sau.</p>
            {filterType && (
              <button onClick={() => setFilterType('')} className="mt-4 px-6 py-2 text-[#60D86E] bg-[#e8f9eb] rounded-full text-sm font-semibold hover:bg-[#60D86E] hover:text-white transition-colors">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {fields.map(field => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
