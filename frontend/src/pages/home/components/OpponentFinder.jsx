import { Link } from 'react-router-dom'

export default function OpponentFinder() {
  return (
    <section className="py-16 bg-[#f8faf8] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-[#60D86E]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-[#3b82f6]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 px-8 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">

            {/* ── Left: Text Content ── */}
            <div className="flex-1 text-center md:text-left max-w-2xl mx-auto md:mx-0">
              <span className="text-[#60D86E] text-sm font-bold uppercase tracking-widest mb-4 block">
                CỘNG ĐỒNG BÓNG ĐÁ PHONG TRÀO
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-[1.15]">
                Thiếu kèo hay thiếu người?{' '}
                <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60D86E] to-blue-400">
                  Ghép đội & tìm đối thủ!
                </span>
              </h2>

              <p className="text-gray-300 text-base md:text-lg mb-6 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Nền tảng ghép kèo thông minh — chủ động đăng tin tìm đối thủ giao lưu
                hoặc tuyển thêm đồng đội bổ sung. Kết nối nhanh, chốt kèo dễ dàng qua tin nhắn.
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-sm font-semibold backdrop-blur-sm">
                  <span className="text-base">🆚</span>
                  Tìm đối thủ giao lưu
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-sm font-semibold backdrop-blur-sm">
                  <span className="text-base">🤝</span>
                  Tìm đồng đội bổ sung
                </span>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link
                  to="/matchmaking"
                  className="px-8 py-4 bg-[#60D86E] hover:bg-[#45c45a] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#60D86E]/30 hover:shadow-[#60D86E]/50 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                >
                  Vào trang Ghép trận
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link
                  to="/matchmaking?tab=mine"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all w-full sm:w-auto text-center border border-white/10 hover:border-white/20"
                >
                  Đăng tin của tôi
                </Link>
              </div>
            </div>

            {/* ── Right: Dual-use Illustration ── */}
            <div className="hidden lg:flex w-[400px] h-[400px] relative items-center justify-center flex-shrink-0">
              {/* Rotating background frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#60D86E]/10 to-blue-500/10 rounded-[3rem] rotate-6 transform transition-transform hover:rotate-12 duration-500" />
              <div className="absolute inset-0 bg-[#ffffff08] rounded-[3rem] backdrop-blur-sm border border-white/10 -rotate-3 transform flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full p-10">

                  {/* Base: Two teams icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                       className="w-full h-full text-[#60D86E]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>

                  {/* Badge: Find opponent — top right */}
                  <div className="absolute top-8 right-8 w-[72px] h-[72px] bg-[#60D86E]/20 rounded-3xl border border-[#60D86E]/40 flex flex-col items-center justify-center backdrop-blur-md shadow-xl gap-0.5">
                    <span className="text-xl">🆚</span>
                    <span className="text-[9px] text-[#60D86E] font-bold leading-tight text-center">Đối thủ</span>
                  </div>

                  {/* Badge: Find teammate — bottom left */}
                  <div className="absolute bottom-8 left-8 w-[72px] h-[72px] bg-blue-500/20 rounded-3xl border border-blue-400/30 flex flex-col items-center justify-center backdrop-blur-md shadow-xl gap-0.5">
                    <span className="text-xl">🤝</span>
                    <span className="text-[9px] text-blue-300 font-bold leading-tight text-center">Đồng đội</span>
                  </div>

                  {/* Chat bubble: center bottom right */}
                  <div className="absolute bottom-10 right-10 w-[48px] h-[48px] bg-white/10 rounded-2xl border border-white/15 flex items-center justify-center backdrop-blur-md shadow-lg">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
