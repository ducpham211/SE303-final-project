import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

function StatCard({ title, value, subtitle, icon, accentColor }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-gray-500 font-medium text-sm">{title}</span>
        <span className="text-[#1a202c] font-extrabold text-3xl">{value}</span>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accentColor + '22', color: accentColor }}
      >
        {icon}
      </div>
    </div>
  )
}

export default function OwnerDashboardTeaser() {
  const { user } = useAuthStore()

  return (
    <section id="owner-dashboard-teaser" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]">
      <div className="mb-10">
        <span className="text-[#3b82f6] text-sm font-semibold uppercase tracking-widest">Trung tâm quản lý</span>
        <h1 className="text-3xl font-extrabold text-[#1a202c] mt-1">Xin chào Chủ sân, {user?.name}</h1>
        <p className="text-gray-500 mt-2">Tổng quan hoạt động kinh doanh sân của bạn hôm nay.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Đơn chờ duyệt" 
          value="5" 
          subtitle="Cần phản hồi ngay"
          accentColor="#f59e0b"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          }
        />
        <StatCard 
          title="Sân đang có khách" 
          value="2/4" 
          subtitle="Tỷ lệ lấp đầy 50%"
          accentColor="#60D86E"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          }
        />
        <StatCard 
          title="Doanh thu tạm tính" 
          value="1.2M" 
          subtitle="Trong ngày hôm nay"
          accentColor="#3b82f6"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-[#1a202c] mb-4">Các tác vụ nhanh</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/owner/bookings" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#60D86E] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-[#60D86E] group-hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-[#1a202c]">Quản lý lịch đặt</span>
        </Link>
        
        <Link to="/owner/fields" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#60D86E] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-[#60D86E] group-hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-[#1a202c]">Cấu hình sân bãi</span>
        </Link>
        
        <Link to="/owner/revenue" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#60D86E] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-[#60D86E] group-hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-[#1a202c]">Báo cáo doanh thu</span>
        </Link>

        <Link to="/tin-nhan" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#60D86E] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-[#60D86E] group-hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-[#1a202c]">Tin nhắn khách</span>
        </Link>
      </div>
    </section>
  )
}
