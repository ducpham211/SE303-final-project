import { Link } from 'react-router-dom'

export default function CtaBanner() {
  return (
    <section
      id="cta-banner"
      className="min-h-screen w-full flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#60D86E' }}
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">

        <div className="flex flex-col gap-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            [Tiêu đề kêu gọi hành động của Cta Banner]
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto">
            [Đoạn mô tả ngắn để thúc đẩy người dùng thực hiện hành động chính.]
          </p>
        </div>

        <Link
          to="/tim-doi-thu/tao-keo"
          id="cta-find-opponent-btn"
          className="px-8 py-3.5 rounded-full bg-white text-[#45c45a] font-bold text-base hover:bg-gray-100 transition-all duration-200 active:scale-95 shadow-sm"
        >
          Tìm đối thủ ngay →
        </Link>

        {/* Trust line */}
        <p className="text-white/70 text-sm">
          Miễn phí hoàn toàn · Không yêu cầu tài khoản premium
        </p>
      </div>
    </section>
  )
}
