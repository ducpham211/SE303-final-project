export default function ContactPage() {
  return (
    <main 
        id="contact-page"
        className="min-h-screen bg-[#f8faf8] py-20">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1a202c] ">
              Liên hệ
            </h1>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#4a5568]">
                Họ tên
              </label>
              <input
                id="full_name"
                type="text"
                placeholder="Nhập họ tên"
                className="mt-2 w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a202c] outline-none transition duration-200 focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/15"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#4a5568]">
                SĐT
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                className="mt-2 w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a202c] outline-none transition duration-200 focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/15"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4a5568]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                className="mt-2 w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a202c] outline-none transition duration-200 focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/15"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#4a5568]">
                Tiêu đề
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Nhập tiêu đề nội dung"
                className="mt-2 w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a202c] outline-none transition duration-200 focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/15"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#4a5568]">
                Nội dung
              </label>
              <textarea
                id="message"
                rows="5"
                placeholder="Nội dung liên hệ"
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a202c] outline-none transition duration-200 focus:border-[#60D86E] focus:ring-2 focus:ring-[#60D86E]/15"
              />
            </div>

            <button
              type="submit"
              className="mx-auto block flex items-center justify-center rounded-full bg-[#60D86E] px-12 py-2 text-base font-semibold text-white transition duration-200 hover:bg-[#45c45a] hover:-translate-y-1 active:scale-95"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
