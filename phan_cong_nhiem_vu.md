# Bảng Phân Công Nhiệm Vụ (Nhóm 6 Thành Viên: A, B, C, D, E, F)

Để tối ưu hóa thời gian 2 tháng và phát huy thế mạnh của từng người, nhóm áp dụng mô hình phát triển phần mềm Agile/Scrum. Dưới đây là đề xuất phân chia vai trò và công việc cực kỳ chi tiết, áp dụng sát với **Tech Stack** của dự án:
- **Backend (BE)**: Java Spring Boot.
- **Frontend (FE)**: React JS.
- **Database & ORM**: Supabase (PostgreSQL) + Prisma ORM (Để quản lý schema, chạy migration và sử dụng Prisma Studio tương tác trực tiếp với DB ngay trong IDE).

---

## Tổng quan Vai trò
- **Thành viên A**: Project Manager (PM) kiêm Backend Developer (Core Spring Boot, Kiến trúc hệ thống, Security).
- **Thành viên B**: Backend Developer (Spring Boot REST API, Nghiệp vụ Đặt sân, Ghép trận & AI Pricing).
- **Thành viên C**: React Frontend Developer (Phụ trách giao diện Web cho Người chơi & luồng Booking).
- **Thành viên D**: React Frontend Developer (Phụ trách giao diện Web cho Chủ sân & UI Real-time Chat/Bảng tin).
- **Thành viên E**: Database Admin & DevOps (Cấu hình Supabase, Quản lý schema bằng Prisma, Setup Redis, Triển khai hạ tầng).
- **Thành viên F**: Business Analyst (BA) kiêm QA/Tester (Phân tích Requirement, Viết API Docs, Kiểm thử & Chuẩn bị Demo).

---

## Phân công Chi tiết theo Giai đoạn (Timeline 8 Tuần)

### Giai đoạn 1 & 2: Khảo sát, Thiết kế DB & Khởi tạo Project (Tuần 1 - 2)

- **Thành viên Đức (PM/BE)**:
  - Dựng Base code Java Spring Boot (chọn dependencies: Spring Web, Spring Security, Spring Boot DevTools, Redis).
  - Cấu hình chuẩn kiến trúc thư mục (Controller, Service, Repository, DTO).
  - Viết logic Authentication & Authorization sử dụng Spring Security và JWT.
- **Thành viên Hùng, Nam (BE)**:
  - Cùng Đức trích xuất các Entity cần thiết.
  - Phác thảo tài liệu API (Swagger/OpenAPI) cho các luồng cơ bản.
- **Thành viên Quang (FE)**:
  - Khởi tạo Base code React JS (sử dụng Vite hoặc Create React App).
  - Cấu hình thư viện UI (Tailwind CSS/MUI/Ant Design), React Router, Axios. Cấu hình ESLint/Prettier.
  - Thiết kế UI/UX luồng Người chơi (Trang chủ, Tìm sân).
- **Thành viên Quang` (FE)**:
  - Thiết kế UI/UX luồng Chủ sân (Dashboard quản trị) và UI màn hình Bảng tin.
  - Dựng các Reusable Components cơ bản trong React (Button, Input, Modal, Table).
- **Thành viên Đức (DB/DevOps)**:
  - Khởi tạo project trên Supabase, lấy chuỗi kết nối (Connection URI).
  - Khởi tạo Prisma (`npx prisma init`), cấu hình kết nối tới Supabase trong file `schema.prisma`.
  - Thiết kế các Model trong file Prisma. Chạy `prisma db push` hoặc `prisma migrate` để tạo bảng trên Supabase. Hướng dẫn nhóm dùng `npx prisma studio` để mở UI quản lý DB trên IDE.
- **Thành viên Nhật (BA/QA)**:
  - Viết tài liệu đặc tả yêu cầu chi tiết (SRS). Lên quy trình User Flow.
  - Review UI/UX trên Figma cùng C và D.
  - Thiết kế db

### Giai đoạn 3: Luồng Đặt sân & Tích hợp Redis (Tuần 3 - 4)

- **Thành viên A (BE)**:
  - Viết logic xử lý **Distributed Lock** trong Spring Boot sử dụng Spring Data Redis (dùng `RedisTemplate`). 
  - Khóa khung giờ sân khi người dùng bắt đầu giữ chỗ, cài đặt TTL (Time-To-Live).
  - Tích hợp cổng thanh toán (VNPay/MoMo) vào Spring Boot.
- **Thành viên B (BE)**:
  - Viết Spring REST Controller & Service cho luồng Quản lý sân (CRUD sân bóng, thêm khung giờ trống).
  - Viết API tìm kiếm, lọc sân theo bộ tiêu chí (có phân trang - Pagination).
- **Thành viên C (FE)**:
  - Code luồng ghép nối API Tìm sân, Chọn giờ vào React. 
  - Hiển thị phản hồi UI từ BE nếu dính lỗi Redis Lock (Ví dụ alert: "Khung giờ này vừa có người nhanh tay hơn...").
- **Thành viên D (FE)**:
  - Code React CMS cho Chủ sân: Form đăng thông tin sân mới, Bảng quản lý đặt chỗ, Set trạng thái sân.
- **Thành viên E (DB/DevOps)**:
  - Cập nhật Prisma Schema nếu có phát sinh (ví dụ thêm bảng Payment).
  - Tối ưu hóa Database (đánh Index trên Supabase) cho các field tìm kiếm (Tên sân, Vị trí).
- **Thành viên F (BA/QA)**:
  - Viết Test Case cho luồng trả tiền và đặt sân.
  - Thực hiện test bắt lỗi concurrency (Thử dùng nhiều account book cùng lúc vào 1 sân).

### Giai đoạn 4: Luồng Ghép trận & Tính năng Thời gian thực (Tuần 5)

- **Thành viên A (BE)**:
  - Setup WebSockets trong Spring Boot (`@EnableWebSocketMessageBroker`, STOMP).
  - Code luồng đẩy Real-time Notification khi có người nhận kèo hoặc sân đổi trạng thái.
- **Thành viên B (BE)**:
  - Viết API phục vụ Bảng tin giao hữu (Đăng tin, nhận tin).
  - Viết logic xử lý lưu trữ tin nhắn Chat nội bộ.
- **Thành viên C (FE)**:
  - Tích hợp thư viện STOMP/SockJS hoặc WebSocket API thuần vào React.
  - Xử lý UI đổi màu sân tự động lập tức khi có trigger từ WebSocket.
- **Thành viên D (FE)**:
  - Code giao diện Bảng tin Giao hữu, tích hợp API lướt bài, nhận kèo.
  - Dựng UI Chatbox trong React, cập nhật danh sách tin nhắn real-time.
- **Thành viên E (DB/DevOps)**:
  - Hỗ trợ thiết kế bảng lưu trữ Tin nhắn Chat hiệu quả trong Supabase (qua Prisma Schema).
- **Thành viên F (BA/QA)**:
  - Test kịch bản luồng tạo bài đăng - nhận kèo - nhảy vào chat.
  - Đo lường độ trễ tin nhắn.

### Giai đoạn 5: Định giá linh hoạt & Tối ưu hóa (Tuần 6)

- **Thành viên A (BE)**:
  - Refactor các đoạn code Spring Boot nặng, xử lý N+1 query problem nếu có khi gọi DB.
- **Thành viên B (BE)**:
  - Xây dựng thuật toán Auto Pricing (Tính toán giá sân dựa theo logic Giờ vàng, Giờ bình thường) trong Service layer.
  - Viết API tính toán và trả về số liệu thống kê doanh thu cho Chủ sân.
- **Thành viên C (FE)**:
  - Tinh chỉnh Responsive UI để React App hiển thị đẹp trên cả Desktop lẫn Mobile (đặc biệt cho người dùng tìm sân trên điện thoại).
- **Thành viên D (FE)**:
  - Sử dụng thư viện Chart (như Chart.js hoặc Recharts) để vẽ biểu đồ doanh thu và tỷ lệ lấp đầy trên Dashboard Chủ sân.
- **Thành viên E (DB/DevOps)**:
  - Backup Supabase Database.
  - Đảm bảo Redis chạy ổn định với lưu lượng request cao.
- **Thành viên F (BA/QA)**:
  - Dùng Postman hoặc JMeter để chạy Load Testing các API nặng. Báo lỗi lại cho A và B.

### Giai đoạn 6 & 7: Hoàn thiện, Demo & Báo cáo (Tuần 7 - 8)

- **Thành viên E (DB/DevOps)**:
  - Deploy Frontend React lên Vercel hoặc Netlify.
  - Deploy Backend Spring Boot lên server (VPS / Heroku / Render). Xóa config localhost, thay bằng biến môi trường (Environment Variables).
- **Thành viên C & D (FE)**:
  - Chạy quét lỗi giao diện, fix các bug liên quan đến React state/lifecycle/hooks. Tối ưu bundle size.
- **Thành viên A & B (BE)**:
  - Xóa logs thừa. Đảm bảo toàn bộ route yêu cầu bảo mật đã chặn bằng Spring Security.
- **Thành viên F (BA/QA)**:
  - Viết API Docs hoàn chỉnh (dẫn link Swagger UI).
  - Viết script hoặc chủ động dùng Prisma Studio insert Data giả định (Sân, Users, Lịch sử đặt) cho lung linh.
- **Cả nhóm**:
  - Soạn Slide, tổng duyệt demo luồng thao tác. Quay Video dự phòng rớt mạng.

---
_Ghi chú:_ 
- _Prisma sẽ đóng vai trò đặc biệt quan trọng giúp cả nhóm đồng bộ DB nhanh chóng bằng các file `schema.prisma`. Thành viên E cần đảm bảo code schema Prisma luôn được push lên Git để mọi người có thể Sync về máy và chạy `npx prisma studio` mọi lúc!_
- _Tùy tình hình thực tế, các vai trò có thể linh hoạt support lẫn nhau (Cross-functional) nếu có thành viên bị quá tải._
