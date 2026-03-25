# Tổng Hợp Các Chức Năng Hệ Thống Đặt Sân & Ghép Trận

Tài liệu này tổng hợp toàn bộ các tính năng của hệ thống, bao gồm các chức năng cốt lõi hiện có (từ luồng phân tích hệ thống) và các hướng phát triển mở rộng trong tương lai.

## I. CÁC TÍNH NĂNG CỐT LÕI (CORE FEATURES)

### 1. Người chơi & Đội bóng (Player)

- **Quản lý Hồ sơ & Đội bóng**: Đăng nhập, đăng ký, cập nhật thông tin cá nhân và tạo/quản lý danh sách thành viên đội bóng.
- **Tra cứu và Đặt sân trực tuyến (Online Booking)**:
  - Tìm kiếm sân theo vị trí địa lý, loại sân (5, 7, 11 người), mức giá, giờ trống.
  - Xem lịch trống trực quan, thực hiện thao tác chọn giờ và giữ chỗ.
  - Thanh toán tiền cọc trực tuyến (ví điện tử / ngân hàng).
- **Bảng tin Giao hữu (Matchmaking & Social)**:
  - Đăng tải các yêu cầu thi đấu, tìm kiếm đối thủ với những điều kiện cụ thể (trình độ, tỷ lệ chia sẻ chi phí).
  - Đăng tin **tìm cầu thủ hỗ trợ (đá phủi)** khi đội bóng thiếu người hoặc gặp sự cố bất khả kháng.
- **Hệ thống Nhắn tin Nội bộ (Internal Chat)**: Trò chuyện trực tiếp (1-1 hoặc nhóm) để giao tiếp, thương lượng chi phí và chốt kèo trận đấu.
- **Nhận Thông báo (Real-time Notifications)**: Thông báo trạng thái đặt sân, có người nhận kèo trên bảng tin, hoặc có tin nhắn mới.

### 2. Chủ sân (Field Owner)

- **Quản lý Thông tin Cấu hình Sân**: Định nghĩa và số hóa thông tin cơ sở vật chất (hình ảnh, mô tả), thiết lập các cụm sân và chuẩn hóa giờ hoạt động.
- **Quản lý Lịch biểu & Booking**: Theo dõi trạng thái sân (đang trống, đã đặt, bảo trì), xác nhận khách đã đến (check-in), xử lý các nghiệp vụ hoàn hủy cọc và **xác nhận bài đăng của người chơi**.
- **Chiến lược Định giá Linh hoạt (Dynamic Pricing)**: Công cụ hỗ trợ điều chỉnh mức giá tự động dựa trên quy luật cung cầu (chính sách giảm giá kích cầu giờ thấp điểm, duy trì/tăng giá khung giờ vàng).
- **Thống kê & Báo cáo Doanh thu**: Dashboard trực quan theo dõi tổng quan doanh thu, số lượt đặt, tỷ lệ lấp đầy khoảng thời gian theo ngày/tuần/tháng.

### 3. Quản trị viên (Admin)

- **Kiểm duyệt nền tảng**: Quản lý và phong tỏa các tài khoản vi phạm, giải quyết khiếu nại giữa các bên.
- **Quản lý Dữ liệu Hệ thống**: Kiểm soát luồng bài đăng Bảng tin, kiểm duyệt các chủ sân mới đăng ký.
- **Thống kê Vận hành**: Xem xét lưu lượng người dùng truy cập, tổng giao dịch, phí hoa hồng nền tảng.

### 4. Tính Năng Kỹ Thuật Đột Phá

- **Cơ chế Chống trùng lịch (Distributed Lock với Redis)**: Xếp hàng tự động các luồng người dùng truy cập mua cùng một khung giờ. Cấp quyền xử lý giao dịch đầu tiên thành công, các truy cập sau nhận thông báo từ chối/vui lòng đợi, loại bỏ hoàn toàn rủi ro trùng lịch.
- **Đồng bộ Dữ liệu Tức thời**: Ứng dụng WebSocket/SSE để tự động phổ biến mọi thay đổi trạng thái sân, yêu cầu đánh ghép hay tin nhắn mới đến màn hình tất cả user đang online.

---

## II. CÁC TÍNH NĂNG MỞ RỘNG & TƯƠNG LAI (DEVELOPMENT DIRECTION)

Nhằm định hình hệ thống trở thành một mô hình **"Mạng xã hội thể thao thu nhỏ"**, dưới đây là các tính năng nghiệp vụ đột phá sẽ được bổ sung:

### 1. Ứng dụng Khai phá Dữ liệu & AI

- **Gợi ý Đối thủ Thông minh (Smart Match-making Recommendations)**: Tự động phân tích vị trí địa lý, độ tuổi, định lượng trình độ và điểm số từ các trận đấu cũ để hệ thống tự động đề xuất các đội bóng đối thủ phù hợp, bù trừ cho nhau, giúp nâng cao chất lượng môi trường giao hữu.

### 2. Gamification & Xây dựng Cộng Đồng

- **Hệ Thống Xếp Hạng & Uy Tín (Rating & Trust System)**: Cấp hệ thống huy hiệu (Badge) và "điểm uy tín" cho người chơi/đội bóng. Những đội có tỷ lệ "bùng kèo" hoặc ý thức thi đấu kém sẽ bị hạ uy tín, cảnh báo hoặc khóa tài khoản để thanh lọc cộng đồng.

### 3. Quản Trị Hệ Sinh Thái Khép Kín (Ecosystem)

- **Dịch vụ Đi kèm (Add-on Services)**: Tích hợp marketplace trực tiếp vào luồng đặt sân, cho phép order trước các dịch vụ phụ trợ như: thuê trọng tài, thuê thủ môn (người bắt gôn), đồ tập (áo bíp), dịch vụ nước giải khát. Mọi nhu cầu được đẩy trực tiếp cho chủ sân chuẩn bị.
- **Xử lý Chia Tiền Tự Động (Split Bill)**: Hệ thống cho phép bóc tách hóa đơn tự động cuối trận, kết nối thẳng tới ví điện tử của từng thành viên trong nhóm để thu đúng hạn phần tiền phải nộp. Loại bỏ những rắc rối và khó xử của đội trưởng trong việc đi thu phí.
