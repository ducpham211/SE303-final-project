# Kế Hoạch Thực Hiện Dự Án Đặt Sân & Ghép Trận (Timeline: 2 Tháng)

Dự án có thời hạn 2 tháng (khoảng 8 tuần). Kế hoạch dưới đây chia nhỏ các công việc từ khâu thiết kế đến khi hoàn thiện và triển khai, áp dụng mô hình phân phối công việc theo từng chức năng (Agile/Scrum).

## Giai đoạn 1: Khảo sát, Phân tích & Thiết kế hệ thống (Tuần 1)

- [ ] **Phân tích yêu cầu chi tiết**: Làm rõ các luồng nghiệp vụ cốt lõi (Đặt sân, Ghép trận, Định giá tự động, Đồng bộ thời gian thực).
- [ ] **Thiết kế UI/UX**: Lên quy trình (User Flow), Wireframe và Mockup cho các ứng dụng (Trang tìm/đặt sân, Bảng tin ghép trận, Chat nội bộ, Giao diện quản trị của Chủ sân).
- [ ] **Thiết kế Cơ sở dữ liệu (Database Schema)**: Thiết kế các bảng dữ liệu (Ví dụ: Users, Fields, Bookings, MatchRequests, Messages, Payments).
- [ ] **Thiết kế Kiến trúc (Architecture)**: Lên Tech Stack phù hợp (Ví dụ: Frontend - React/Vue/Flutter; Backend - Node.js/Spring Boot; Database - PostgreSQL/MySQL; Cache - Redis).
- [ ] **Thiết kế API**: Định nghĩa tài liệu API các endpoint cần thiết và cấu trúc dữ liệu trả về. Quy hoạch các luồng cần dùng WebSocket.

## Giai đoạn 2: Khởi tạo hệ thống & Core Modules (Tuần 2)

- [ ] **Thiết lập môi trường & CI/CD**: Khởi tạo Git repository, cấu hình bộ khung code chuẩn, setup pipeline CI/CD cơ bản (build, test).
- [ ] **Khởi tạo Source code Base**: Xây dựng khung ứng dụng backend và frontend.
- [ ] **Xác thực & Phân quyền (Auth/Authorization)**: Cài đặt đăng nhập, đăng ký bằng JWT/OAuth2. Phân role người dùng: Người chơi, Chủ sân, Admin nền tảng.
- [ ] **Quản lý Hồ sơ**: Cho phép cập nhật profile người dùng, tạo và quản lý đội bóng cá nhân.

## Giai đoạn 3: Luồng Đặt sân trực tuyến & Tích hợp khóa Redis (Tuần 3 & 4)

- [ ] **Module Quản lý Sân (Cho Chủ sân)**: Chủ sân đăng tải, sửa đổi thông tin sân, định nghĩa các cụm sân và khung giờ mở cửa.
- [ ] **Tính năng Giữ chỗ & Tìm kiếm Sân**: Người dùng tìm kiếm sân theo bộ lọc (giá, giờ, vị trí, loại sân). Giao diện hiển thị lịch trống.
- [ ] **Cơ chế Chống trùng lịch (Distributed Lock)**: Áp dụng Redis Lock cho action chọn giờ của user. Xếp hàng thứ tự (Queue) khi nhiều luồng cùng gọi lấy 1 sân 1 lúc, báo "Vui lòng đợi/Sân đã có người lấy" cho người đến sau.
- [ ] **Cọc tiền đặt sân**: Tích hợp các cổng thanh toán online (VNPay, MoMo,...). Xử lý timeout nhả khóa Redis nếu user hủy/không trả tiền cọc quá thời gian quy định.

## Giai đoạn 4: Luồng Ghép trận & Tương tác (Tuần 5)

- [ ] **Bảng tin Giao hữu**: Chức năng post yêu cầu ghép đội, đăng thông tin thiếu người. Lưu trữ thông tin trình độ, tỷ lệ cưa tiền sân.
- [ ] **Luồng Nhận kèo & Catch-match**: Người dùng khác xem bảng tin, lướt và nhận kèo. Hệ thống thông báo cho người đăng.
- [ ] **Chat nội bộ Real-time (Socket.io/WebSocket)**: Hiện thực hóa phòng chat 1-1 hoặc chat nhóm cho 2 bên thương lượng, chốt kèo trực tiếp.
- [ ] **Thông báo thời gian thực (Real-time Notification)**: Đẩy thông báo tức thời tới user khi có người nhận kèo, có tin nhắn, hoặc đặt sân hoàn tất.

## Giai đoạn 5: Định giá linh hoạt & Tối ưu hóa Database (Tuần 6)

- [ ] **Đồng bộ hóa Trạng thái sân**: Dùng SSE (Server-Sent Events) hoặc WebSocket lắng nghe thay đổi trạng thái "Trống -> Đã đặt" và cập nhật lập tức trên màn hình cho tất cả người dùng khác mà không cần F5 (Reload).
- [ ] **Báo cáo Thống kê Dashboard**: Graphic vẽ biểu đồ doanh thu, số trận đặt, tỷ lệ lấp đầy lịch dành cho Chủ sân.

## Giai đoạn 6: Kiểm thử (Testing) & Tối ưu (Tuần 7)

- [ ] **Unit Test & Integration Test**: Điểm mặt các API cốt lõi, đặc biệt test kịch bản concurrency booking.
- [ ] **Load Testing**: Giả lập tải trọng bằng tool (JMeter, K6) để kiểm thử sức chịu đựng của Redis và khả năng xử lý Socket khi có nhiều connection.
- [ ] **User Acceptance Testing (UAT)**: Tự diễn tập nội bộ đầu - cuối từ góc nhìn cả Chủ sân lẫn Người chơi.
- [ ] **Bug fixing & Refactoring Code**: Chỉnh sửa bugs theo reports. Tối ưu lại truy vấn cơ sở dữ liệu (indexing).

## Giai đoạn 7: Triển khai & Hoàn thiện hồ sơ (Tuần 8)

- [ ] **Triển khai Production**: Đưa frontend thẳng lên CDN/Vercel/Netlify. Host Backend và Database lên VPS / Cloud (AWS EC2, DigitalOcean...).
- [ ] **Viết tài liệu Docs**: Bổ sung README, mô tả API (Swagger).
- [ ] **Tạo Dữ liệu giả định (Mock Data)**: Làm phong phú Database với nhiều sân, users, bài đăng ảo phục vụ cho quá trình Demo.
- [ ] **Chuẩn bị Bài thuyết trình**: Hoàn tất Slide báo cáo, kịch bản bảo vệ trước hội đồng, quay video lại luồng thao tác dự phòng tình huống rớt mạng.
- [ ] **Tổng duyệt lần cuối**.
