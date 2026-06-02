import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import fieldService from '../../services/fieldService'
import bookingService from '../../services/bookingService'
import useAuthStore from '../../store/useAuthStore'
import BookingModal from '../../components/common/BookingModal'

export default function FieldDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()
  
  const [field, setField] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Date selection (default today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  
  // Selected slot for booking
  const [selectedSlot, setSelectedSlot] = useState(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bookingNote, setBookingNote] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  
  // Add-ons & Split Bill State
  const [addons, setAddons] = useState({
    water: false,
    bibs: false,
    referee: false,
    goalkeeper: false
  })
  const [teamSize, setTeamSize] = useState(10)

  const ADDON_PRICES = {
    water: 50000,
    bibs: 30000,
    referee: 150000,
    goalkeeper: 100000
  }

  useEffect(() => {
    fetchFieldAndSlots()
  }, [id, selectedDate])

  const fetchFieldAndSlots = async () => {
    try {
      setLoading(true)
      setError(null)
      setSelectedSlot(null)
      
      const fieldData = await fieldService.getFieldById(id)
      setField(fieldData)
      
      const availabilityData = await fieldService.getFieldAvailability(id, selectedDate)
      // availabilityData might be just the slots array directly coming from the controller
      setSlots(Array.isArray(availabilityData) ? availabilityData : [])
    } catch (err) {
      setError('Không thể tải thông tin sân hoặc lịch trống.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = (slot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
  }

  const formatTime = (value) => {
    if (!value) return ''
    // Already in "HH:mm" format — return as-is
    if (!value.includes('T') && !value.includes('-') && value.includes(':')) {
      return value.slice(0, 5)
    }
    // ISO datetime string
    return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleBookClick = () => {
    if (!isLoggedIn) {
      navigate('/dang-nhap')
      return
    }
    setBookingError(null)
    setIsModalOpen(true)
  }

  const confirmBooking = async (note) => {
    try {
      setIsBooking(true)
      setBookingError(null)

      // 1. Create booking (note already includes add-on labels, built by BookingModal)
      const bookingRes = await bookingService.createBooking(selectedSlot.id, note)
      if (!bookingRes || !bookingRes.bookingId) throw new Error('Không nhận được mã đơn đặt')

      // 2. Create Payment Session
      const paymentRes = await bookingService.createPaymentSession(bookingRes.bookingId)
      if (!paymentRes || !paymentRes.url) throw new Error('Không nhận được URL thanh toán')

      // 3. Redirect to Stripe
      window.location.href = paymentRes.url

    } catch (err) {
      console.error(err)
      setBookingError(err.response?.data || err.message || 'Có lỗi xảy ra khi tạo đơn.')
      setIsBooking(false)
    }
  }

  if (loading && !field) {
    return (
      <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#60D86E] border-t-transparent rounded-full animate-spin"></div>
      </main>
    )
  }

  if (error && !field) {
    return (
      <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8] px-4">
        <div className="max-w-3xl mx-auto bg-red-50 p-8 rounded-3xl text-center border border-red-100">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dat-san" className="px-6 py-2 bg-white text-gray-700 rounded-full font-semibold border border-gray-200 hover:bg-gray-50">Quay lại danh sách</Link>
        </div>
      </main>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  
  const calculateTotalWithAddons = () => {
    let total = selectedSlot?.price || 0
    if (addons.water) total += ADDON_PRICES.water
    if (addons.bibs) total += ADDON_PRICES.bibs
    if (addons.referee) total += ADDON_PRICES.referee
    if (addons.goalkeeper) total += ADDON_PRICES.goalkeeper
    return total
  }
  
  const totalExpectedAmount = calculateTotalWithAddons()
  const splitAmount = Math.ceil(totalExpectedAmount / Math.max(1, teamSize))

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/dat-san" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1a202c] transition-colors mb-6 font-medium text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Quay lại danh sách
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Field Info */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="w-full aspect-video bg-gray-100 overflow-hidden relative">
                <img
                  src={
                    field?.coverImage && !field.coverImage.includes('example.com')
                      ? field.coverImage
                      : field?.type === 'SEVEN_A_SIDE'
                        ? 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80'
                        : 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={field?.name || 'Sân bóng'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="px-3 py-1 rounded-full bg-[#1a202c] text-white text-xs font-semibold uppercase tracking-wider mb-3 inline-block">
                  {field?.type === 'FIVE_A_SIDE' ? 'Sân 5 người' : field?.type === 'SEVEN_A_SIDE' ? 'Sân 7 người' : 'Sân 11 người'}
                </span>
                <h1 className="text-2xl font-extrabold text-[#1a202c] leading-tight mb-2">{field?.name}</h1>
                <p className="text-gray-500 text-sm flex items-start gap-1.5 mb-6">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Thông tin vị trí chi tiết của sân (Mock address)
                </p>
                
                <hr className="border-gray-100 mb-6" />
                
                <h3 className="font-bold text-[#1a202c] mb-3">Ngày đặt sân</h3>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f8faf8] border border-gray-200 text-[#1a202c] font-medium outline-none focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/20 transition-all font-sans"
                />
              </div>
            </div>
            
            {/* Sticky Order Summary Box (Appears when a slot is selected) */}
            {selectedSlot && (
              <div className="bg-[#1a202c] rounded-3xl p-6 shadow-md text-white sticky top-24">
                <h3 className="font-bold text-lg mb-4 text-[#60D86E]">Bạn đã chọn slot</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Thời gian</span>
                  <span className="font-semibold">{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400">Giá</span>
                  <span className="font-semibold">{formatCurrency(selectedSlot.price)}</span>
                </div>
                <button
                  onClick={handleBookClick}
                  className="w-full py-3 rounded-full bg-[#60D86E] text-[#1a202c] font-extrabold text-sm hover:bg-[#45c45a] hover:text-white transition-all active:scale-95"
                >
                  {isLoggedIn ? 'Xác nhận & Cọc 30%' : 'Đăng nhập để đặt sân'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Time Slots */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a202c]">Khung giờ trống</h2>
                  <p className="text-gray-500 text-sm mt-1">Chọn một cung giờ để tiếp tục</p>
                </div>
                {loading && <div className="w-5 h-5 border-2 border-gray-300 border-t-[#60D86E] rounded-full animate-spin"></div>}
              </div>

              {slots.length === 0 && !loading ? (
                 <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <p className="font-semibold text-gray-700">Không có ca nào trong ngày này</p>
                    <p className="text-sm text-gray-400 mt-1">Vui lòng chọn một ngày khác</p>
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id
                    const isAvailable = slot.available
                    return (
                      <button
                        key={slot.id}
                        disabled={!isAvailable}
                        onClick={() => handleSlotClick(slot)}
                        className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl w-full text-center transition-all duration-200 border-2 ${
                          !isAvailable 
                            ? 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-[#60D86E] border-[#60D86E] text-white shadow-md -translate-y-1' 
                              : 'bg-white border-gray-100 text-[#1a202c] hover:border-[#60D86E] hover:text-[#60D86E] hover:-translate-y-1 hover:shadow-sm'
                        }`}
                      >
                        <span className={`font-bold text-lg mb-1 ${!isAvailable ? 'opacity-50' : ''}`}>
                          {formatTime(slot.startTime)}
                        </span>
                        <span className={`text-[11px] font-semibold tracking-wider ${!isAvailable ? 'opacity-50' : isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {isAvailable ? `${formatCurrency(slot.price)}` : 'Đã kín chỗ'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Booking Confirmation Modal — shared component */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => { if (!isBooking) { setIsModalOpen(false); setBookingError(null) } }}
        onConfirm={confirmBooking}
        isBooking={isBooking}
        bookingError={bookingError}
        fieldName={field?.name || ''}
        startTime={selectedSlot?.startTime || ''}
        endTime={selectedSlot?.endTime || ''}
        date={selectedDate}
        price={selectedSlot?.price || 0}
        showAddons
        addons={addons}
        onAddonsChange={setAddons}
        teamSize={teamSize}
        onTeamSizeChange={setTeamSize}
      />
    </main>
  )
}
