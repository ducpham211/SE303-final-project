const FEATURES = [
  {
    id: 'feature-booking',
    title: '[Tính năng phụ 1]',
    description: '[Mô tả ngắn gọn về tính năng này. Hãy viết từ 1-2 câu để làm rõ giá trị.]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2 C8 6 5 9 9 12 C13 15 10 18 12 22"/>
        <path d="M2 12 C6 8 9 5 12 9 C15 13 18 10 22 12"/>
      </svg>
    ),
    bgColor: '#e8f9eb',
    accentColor: '#60D86E',
  },
  {
    id: 'feature-opponent',
    title: '[Tính năng phụ 2]',
    description: '[Mô tả ngắn gọn về tính năng này. Hãy viết từ 1-2 câu để làm rõ giá trị.]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    bgColor: '#e8f0ff',
    accentColor: '#3b82f6',
  },
  {
    id: 'feature-support',
    title: '[Tính năng phụ 3]',
    description: '[Mô tả ngắn gọn về tính năng này. Hãy viết từ 1-2 câu để làm rõ giá trị.]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
    bgColor: '#fff8e8',
    accentColor: '#f59e0b',
  },
]

function FeatureCard({ feature }) {
  return (
    <div
      id={feature.id}
      className="rounded-3xl p-7 flex flex-col gap-5 border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      {/* Icon bubble */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: feature.bgColor }}
      >
        {feature.icon}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-[#1a202c] text-lg">{feature.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
      </div>

      {/* Accent line */}
      <div
        className="h-1 w-12 rounded-full mt-auto"
        style={{ backgroundColor: feature.accentColor }}
      />
    </div>
  )
}

export default function QuickFeatures() {
  return (
    <section
      id="quick-features"
      className="min-h-screen w-full flex flex-col justify-center py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[#60D86E] text-sm font-semibold uppercase tracking-widest">[Nhãn phụ]</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] mt-1">
            [Tiêu đề phần tính năng]
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
            [Đoạn giới thiệu ngắn về các tính năng này để điều hướng sự mong đợi của người dùng.]
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </section>
  )
}
