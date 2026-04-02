# Lộ trình Phát triển Đồ án Nhóm (Thời hạn: 2 Tháng / 8 Tuần)

_Cập nhật chi tiết bám sát Database Schema (database-design.md), API Endpoints. Bổ sung hệ thống Admin, Quản lý Đội bóng, Gamification (Reviews)._

---

## 💻 Tech Stack Sử Dụng

- **Front end:** React JS
- **Back end:** Java Spring Boot
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Tối ưu hóa (Optimise/Locks):** Redis
- **Advanced Features:** Web Socket (Chat nội bộ, Notifications), Payment Gateway (Momo/Stripe)

## 👥 Cấu trúc Nhóm (5 Người)

- **Backend (Đức & Phát):** Xử lý API, DB Postgres, Redis khóa phân tán, Thanh toán (Webhook callback), Web Socket.
- **Frontend (Thuận & Long):** Giao diện React, tích hợp API, Socket client, Xử lý giao diện 3 Roles (Player, Owner, Admin).
- **Khoa (PM / BA / QA):** Thiết kế giao diện (Figma), Thiết kế & Rà soát Database, Kiểm thử End-to-End, Viết Báo cáo.

---

## LỘ TRÌNH CHI TIẾT 8 TUẦN

### Giai đoạn 1: Khởi tạo, Phân tích & Quản lý User/Team (Tuần 1)

_Mục tiêu: Hoàn tất Setup, chạy được Auth cho 3 roles, quản lý được Đội bóng._

- **Backend:**
  - Setup Spring Boot, cấu hình Prisma, PostgreSQL và Redis.
  - Viết API `Auth`: Register / Login / Cập nhật User cho 3 Role (`PLAYER`, `OWNER`, `ADMIN`).
  - Viết API `Teams`: Phân hệ Đội bóng (Tạo đội, cập nhật trình độ).
- **Frontend:**
  - Setup React, Tailwind. Khởi tạo Layout chung.
  - Xây dựng màn hình Đăng kí / Đăng nhập (phân quyền Role hiển thị menu khác nhau).
  - Màn hình Quản lý Hồ sơ & Đội bóng.
- **Khoa:** Tinh chỉnh ERD cuối cùng, chốt thiết kế UI. Theo dõi việc setup base code.

### Giai đoạn 2: Quản lý Sân bóng & Booking (Có Redis Lock) (Tuần 2 - Tuần 3)

_Mục tiêu: Owner quản lý được sân, Player đặt được sân. Bắt được lỗi trùng lịch._

- **Backend:**
  - Viết API `Fields` & `Time-slots`: Quản lý Sân bóng (Type: 5/7/11), Khung giờ và Giá cọc. Mở API xem lịch trống (`/availability`).
  - Viết API `Bookings` (Quy trình giữ chỗ):
    - **[Redis Lock]** Khóa `[field_id]_[time_slot_id]_[date]` xử lý chống trùng giờ.
    - Owner có API Check-in khách và Cập nhật trạng thái sân (Available/Maintenance).
- **Frontend:**
  - Giao diện Chủ Sân: Dashboard quản lý danh sách sân, thêm khung giờ và chỉnh giá/trạng thái.
  - Giao diện Khách: Bộ lọc tìm kiếm sân (Theo ngày, giá, loại sân). Lưới hiển thị lịch trống thực tế. Nút "Đặt sân".
- **Khoa:** Test đồng thời 2 account cùng click đặt 1 sân để bắt lỗi Redis. Test API lấy danh sách sân có chính xác khung giờ không.

### Giai đoạn 3: Thanh toán & Bảng tin Mạng Xã Hội Thể Thao (Tuần 4 - Tuần 5)

_Mục tiêu: Trả tiền cọc thực tế, Đăng tin tìm đối thủ & Nhắn tin Real-time._

- **Backend:**
  - Viết API `Payments`: Webhook tích hợp Momo/Stripe xử lý trạng thái hóa đơn (`PENDING` -> `SUCCESS`).
  - Viết API `Match-posts`: Quản lý tin Dìm đối thủ/Tìm cầu thủ (`FIND_OPPONENT`, `FIND_MEMBER`, `cost_sharing`). API gửi Yêu cầu Nhận kèo (`Match_requests`).
  - Viết API `Chat & Notif`: Setup Web Socket, emit các event `joinRoom`, `sendMessage`, `newMatchRequest`.
- **Frontend:**
  - Luồng Thanh toán: Màn hình quét QR Momo/Stripe. Bắt callback trả về để hiện thông báo Thành công.
  - Xây dựng trang **Bảng tin Giao hữu (Matchmaking)**. Hiện danh sách bài post, nút "Bắt kèo".
  - Mở hộp thoại **Nhắn tin Nội bộ (Chat)** cho 2 đội trưởng. Hiển thị Thông báo thời gian thực (Push notification) khi có người bắt kèo.
- **Khoa:** Test Sandbox Momo thanh toán fail/success. Đóng vai 2 users bắt kèo và chat với nhau xem WebSocket truyền tin mượt không.

### Giai đoạn 4: Tính năng Đột Phá, Dịch vụ & Admin (Tuần 6 - Tuần 7)

_Mục tiêu: Hoàn thiện công cụ Quản trị cho Admin. Cài cắm các tính năng Nâng cao (Gợi ý đối thủ, Dịch vụ đi kèm) trước khi Code Freeze._

- **Backend:**
  - Viết API `Reviews` (Gamification): Cộng/trừ điểm Uy tín (`trust_score`) (Ví dụ: bùng kèo trừ 10đ, đúng giờ cộng 5đ).
  - Viết API `Admin`: Quản lý Users (Khóa/Ban tài khoản), Duyệt/Khóa Sân bóng lừa đảo, Thống kê Doanh thu toàn nền tảng.
  - **[AI/Thuật toán] Gợi ý Đối thủ Thông minh:** Phân tích vị trí địa lý, độ tuổi, trình độ (`level`) và điểm tín nhiệm để tự động đề xuất đội bóng đối thủ cân kèo.
  - **Dịch vụ đi kèm & Split Bill:** Phục vụ order nước giải khát, thuê trọng tài, áo bíp ngay luồng đặt sân. Xử lý logic chia tiền hóa đơn tự động (Split Bill) về ví của từng thành viên.
- **Frontend:**
  - **Trang Admin Dashboard:** Màn hình cho Admin xem biểu đồ luồng tiền, nút Ban/Unban người dùng. Xóa bài viết rác từ bảng tin.
  - Chức năng "Review / Đánh giá" sau trận đấu.
  - Nâng cấp luồng Đặt sân: Thêm bước "Chọn dịch vụ đi kèm". Hiển thị chức năng "Chia tiền hóa đơn" cho các thành viên trong đội.
  - Bảng tin Mạng Xã Hội: Hiện thêm tab "Gợi ý Đối thủ lý tưởng dành cho đội của bạn" dựa trên API AI/Thuật toán.
- **Khoa:** Tiến hành test End-to-End từ bước Đăng ký -> Tìm sân -> [Book dịch vụ thêm] -> [Chia tiền] -> Bắt kèo AI gợi ý -> Thanh toán. Test các edge-cases

### Giai đoạn 5: Tổng kết & Viết báo cáo (Tuần 8)

- **Khoa:** Biên soạn báo cáo Đồ án. Ráp biểu đồ ERD, tài liệu DB, Use Case.
- **Cả team:**
  - Deploy App lên Production (Vercel, Railway, Supabase...).
  - Làm Slide tập trung vào điểm sáng: **Redis Lock chống trùng**, **Cổng thanh toán thật**, **WebSocket Chat 1-1**, và **Bảng tin Matchmaking**.
  - Quay video Demo.
  - Luyện tập trả lời phản biện hội đồng (Đặc biệt chú ý câu hỏi về nghiệp vụ CSDL và luồng chống trùng lịch).

---

_Lưu ý: Sau khi review mỗi task (Pull Request), phải có mô tả chi tiết PR để tracking!_
