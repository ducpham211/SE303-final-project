import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

function AdminActionCard({ title, description, linkTo, icon, accentColor }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-start group hover:border-[#60D86E] transition-colors">
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors"
        style={{ backgroundColor: accentColor + '15', color: accentColor }}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-[#1a202c] mb-1 group-hover:text-[#60D86E] transition-colors">{title}</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{description}</p>
      </div>
      <Link 
        to={linkTo} 
        className="mt-auto px-5 py-2.5 rounded-full font-semibold text-sm w-full text-center transition-all"
        style={{ backgroundColor: accentColor + '15', color: accentColor }}
      >
        Truy cập
      </Link>
    </div>
  )
}

export default function AdminDashboardTeaser() {
  const { user } = useAuthStore()

  return (
    <section id="admin-dashboard-teaser" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]">
      <div className="mb-10">
        <span className="text-[#e23670] text-sm font-semibold uppercase tracking-widest">Hệ thống quản trị</span>
        <h1 className="text-3xl font-extrabold text-[#1a202c] mt-1">Xin chào Admin, {user?.name}</h1>
        <p className="text-gray-500 mt-2">Theo dõi và vận hành toàn bộ hệ thống Timsanbong.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminActionCard 
          title="Duyệt chủ sân hợp tác"
          description="Kiểm tra thông tin và phê duyệt các đối tác chủ sân mới đăng ký tham gia nền tảng."
          linkTo="/admin/fields"
          accentColor="#e23670"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          }
        />
        
        <AdminActionCard 
          title="Quản lý Người dùng"
          description="Quản lý danh sách tài khoản, vô hiệu hóa các tài khoản vi phạm chính sách của nền tảng."
          linkTo="/admin/users"
          accentColor="#3b82f6"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
        />

        <AdminActionCard 
          title="Báo cáo Tổng quan"
          description="Xem thống kê lượng truy cập, tổng giao dịch, và phí hoa hồng trên toàn hệ thống."
          linkTo="/admin/dashboard"
          accentColor="#f59e0b"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          }
        />
      </div>
    </section>
  )
}
