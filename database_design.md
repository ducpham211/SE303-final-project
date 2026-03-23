# Thiết Kế Cơ Sở Dữ Liệu và API Hệ Thống Đặt Sân & Ghép Trận

Tài liệu này mô tả chi tiết thiết kế Cơ sở dữ liệu (Database Schema) bao gồm các bảng, thuộc tính, mối quan hệ (references) và danh sách các API Core để phục vụ cho các chức năng của hệ thống.

---

## I. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Hệ thống sử dụng hệ quản trị CSDL quan hệ (PostgreSQL/MySQL).
 
### 1. Phân hệ Người dùng & Đội bóng (Users & Teams)

**Bảng `users` (Người dùng)**

- `id` (PK, UUID): Mã định danh người dùng.
- `email` (String, Unique): Email đăng nhập.
- `password` (String): Mật khẩu đã mã hóa.
- `role` (Enum): Vai trò (`PLAYER`, `OWNER`, `ADMIN`).
- `full_name` (String): Họ và tên.
- `phone` (String, Unique): Số điện thoại liên hệ.
- `trust_score` (Int, Default 100): Điểm uy tín (dành cho gamification/rating xếp hạng).
- `created_at` (Timestamp): Ngày tạo.
- `updated_at` (Timestamp): Ngày cập nhật.

**Bảng `teams` (Đội bóng / CLB)**

- `id` (PK, UUID): Mã định danh đội bóng.
- `name` (String): Tên đội bóng.
- `description` (Text, Nullable): Mô tả, giới thiệu lối đá.
- `captain_id` (FK -> `users.id`): Đội trưởng (Người tạo).
- `level` (Enum): Trình độ (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
- `created_at` (Timestamp): Ngày tạo.

**Bảng `reviews` (Lịch sử Đánh giá / Gamification)**

- `id` (PK, UUID): Mã định danh đánh giá.
- `reviewer_id` (FK -> `users.id`): Người đánh giá.
- `reviewee_id` (FK -> `users.id`): Người / Đội trưởng bị đánh giá.
- `match_id` (FK -> `bookings.id`, Nullable): Lấy Booking ID hoặc Post ID đại diện cho trận đấu.
- `score_change` (Int): Số điểm uy tín bị cộng/trừ (vd: +5, -10).
- `reason` (Text): Lý do cộng/trừ điểm (VD: "Đi muộn", "Đá xấu", "Hủy kèo phút chót", "Fair-play").
- `created_at` (Timestamp).

### 2. Phân hệ Sân bóng & Tiện ích (Fields & Facilities)

**Bảng `fields` (Sân bóng)**

- `id` (PK, UUID): Mã định danh sân bóng.
- `name` (String): Tên sân (VD: Sân 1, Sân 2, Sân A).
- `type` (Enum): Loại sân (`5_A_SIDE`, `7_A_SIDE`, `11_A_SIDE`).
- `cover_image` (String, Nullable): Hình ảnh của sân.
- `status` (Enum): `AVAILABLE`, `MAINTENANCE`, `BOOKED`.
- `created_at` (Timestamp), `updated_at` (Timestamp).

**Bảng `time_slots` (Khung giờ & Giá cả)**

- `id` (PK, UUID): Mã khung giờ.
- `field_id` (FK -> `fields.id`): Thuộc sân nào.
- `start_time` (Time): Giờ bắt đầu (Ví dụ: 17:30).
- `end_time` (Time): Giờ kết thúc (Ví dụ: 19:00).
- `price` (Decimal): Giá cho khung giờ này.

### 3. Phân hệ Đặt sân & Thanh toán (Booking & Payment)

**Bảng `bookings` (Chuyến đặt sân)**

- `id` (PK, UUID): Mã hóa đơn đặt sân.
- `user_id` (FK -> `users.id`): Người đặt.
- `field_id` (FK -> `fields.id`): Sân được đặt.
- `time_slot_id` (FK -> `time_slots.id`): Khung giờ được đặt.
- `booking_date` (Date): Ngày đá cụ thể.
- `status` (Enum): Trạng thái (`PENDING`, `DEPOSIT_PAID`, `CONFIRMED`, `CANCELLED`, `COMPLETED`).
- `deposit_amount` (Decimal): Tiền cọc yêu cầu.
- `total_amount` (Decimal): Tổng tiền (Gồm cả dịch vụ add-on nếu có).
- `note` (Text, Nullable): Ghi chú của khách hàng.
- `created_at` (Timestamp), `updated_at` (Timestamp).

**Bảng `payments` (Giao dịch thanh toán)**

- `id` (PK, UUID): Mã giao dịch thanh toán.
- `booking_id` (FK -> `bookings.id`): Thanh toán cho lượt đặt nào (Nếu có).
- `user_id` (FK -> `users.id`): Ai là người trả.
- `amount` (Decimal): Số tiền giao dịch.
- `payment_method` (Enum): `STRIPE`, `CASH`.
- `stripe_payment_intent_id` (String, Unique, Nullable): Mã Payment Intent từ hệ thống Stripe (dành cho theo dõi giao dịch).
- `status` (Enum): `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`.
- `created_at` (Timestamp).

### 4. Phân hệ Ghép trận & Xã hội (Matchmaking & Social)

**Bảng `match_posts` (Bài đăng tìm đối, tìm người)**

- `id` (PK, UUID): Mã bài đăng.
- `user_id` (FK -> `users.id`): Người đăng bài.
- `team_id` (FK -> `teams.id`, Nullable): Đăng đại diện cho đội (nếu có).
- `field_id` (FK -> `fields.id`, Nullable): Sân định ghép (Nếu đã có sân). Hoặc rỗng để đi đá sân khách.
- `booking_id` (FK -> `bookings.id`, Nullable): Mã hóa đơn đặt sân (Nếu đội đã đặt thành công trước khi đăng, hệ thống sẽ xác thực bài đăng uy tín và tự động khóa lên bảng tin, block lịch đặt sân. Nếu hóa đơn bị thay đổi/hủy, tự động cập nhật).
- `date` (Date): Ngày mong muốn đá.
- `time_start` (Time), `time_end` (Time): Giờ mong muốn.
- `post_type` (Enum): Loại bài (`FIND_OPPONENT` - Tìm đối thủ, `FIND_MEMBER` - Tìm cầu thủ ghép (đá phủi)).
- `skill_level` (Enum): Trình độ mong muốn.
- `cost_sharing` (String): Quy tắc chia tiền (VD: "50-50", "Thua trả hết", "Cam kết free").
- `message` (Text): Lời mời, điều khoản khác.
- `status` (Enum): `OPEN`, `MATCHED`, `CLOSED`, `EXPIRED`.
- `created_at` (Timestamp).

**Bảng `match_requests` (Yêu cầu nhận kèo)**

- `id` (PK, UUID): Mã yêu cầu.
- `post_id` (FK -> `match_posts.id`): Kèo nào đang được bắt.
- `requester_id` (FK -> `users.id`): Người gửi yêu cầu nhận kèo.
- `message` (Text, Nullable): Lời chào hỏi nhận kèo.
- `status` (Enum): `PENDING`, `ACCEPTED`, `REJECTED`.
- `created_at` (Timestamp).

### 5. Phân hệ Giao tiếp & Thông báo (Chat & Notifications)

**Bảng `conversations` (Cuộc hội thoại)**

- `id` (PK, UUID)
- `type` (Enum): `DIRECT` (1-1), `MATCH_GROUP` (Group cho kèo đấu).
- `created_at` (Timestamp).

**Bảng `conversation_members` (Thành viên hộp thoại)**

- `conversation_id` (PK, FK -> `conversations.id`)
- `user_id` (PK, FK -> `users.id`)

**Bảng `messages` (Tin nhắn nội bộ)**

- `id` (PK, UUID)
- `conversation_id` (FK -> `conversations.id`)
- `sender_id` (FK -> `users.id`)
- `content` (Text): Nội dung tin nhắn.
- `created_at` (Timestamp).

**Bảng `notifications` (Thông báo Push)**

- `id` (PK, UUID)
- `user_id` (FK -> `users.id`): Người nhận.
- `title` (String): Tiêu đề thông báo.
- `content` (Text): Nội dung.
- `type` (Enum): `SYSTEM`, `BOOKING_UPDATE`, `MATCH_REQUEST`, `NEW_MESSAGE`.
- `is_read` (Boolean, Default false): Trạng thái đã đọc.
- `created_at` (Timestamp).

---

## II. THIẾT KẾ CÁC API CORE (APIs SPECIFICATION)

### 1. APIs Xác thực & Tài khoản (Authentication & Users)

- **`POST /api/auth/register`**: Đăng ký tài khoản (Người chơi / Chủ sân).
- **`POST /api/auth/login`**: Đăng nhập (Trả về JWT Token).
- **`GET /api/users/me`**: Lấy thông tin tài khoản đang đăng nhập.
- **`PUT /api/users/me`**: Cập nhật hồ sơ (Tên, Ảnh đại diện).

### 2. APIs Quản lý Đội bóng (Teams)

- **`POST /api/teams`**: Tạo đội bóng mới.
- **`PUT /api/teams/:id`**: Cập nhật thông tin đội bóng.

### 3. APIs Quản lý Sân (Fields)

- **`GET /api/fields`**: Lấy danh sách các sân bóng trong hệ thống (Có filter theo type, price).
- **`GET /api/fields/:id`**: Xem chi tiết sân bóng.
- **`GET /api/fields/:id/availability`**: Tham số truyền ngày (`?date=yyyy-mm-dd`). Trả về danh sách time slots cùng trạng thái đã đặt/chưa đặt ngay thời điểm tra cứu.
- **`POST /api/fields`**: (Owner) Tạo sân bóng mới.
- **`POST /api/fields/:id/time-slots`**: (Owner) Thêm khung giờ mới cho sân.
- **`PUT /api/fields/:id`**: (Owner) Cập nhật thông tin sơ bộ của sân bóng.
- **`PUT /api/fields/:id/time-slots/:slot_id`**: (Owner) Cập nhật giá/giờ cho khung giờ.
- **`PUT /api/fields/:id/time-slots/:slot_id/status`**: (Owner) Cập nhật trạng thái khung giờ (available, maintenance, booked).
- **`DELETE /api/fields/:id/time-slots/:slot_id`**: (Owner) Xóa khung giờ.
- **`DELETE /api/fields/:id`**: (Owner) Xóa sân bóng.

### 4. APIs Đặt Sân & Thanh Toán (Bookings & Payments)

- **`GET /api/bookings`**: Lấy lịch sử đặt sân của user (hoặc Owner xem lịch của sân mình).
- **`PUT /api/bookings/:id/cancel`**: Hủy sân (Kiểm tra chính sách thời gian để quyết định refund/không refund tiền cọc).
- **`PUT /api/bookings/:id/check-in`**: (Owner) Xác nhận khách đã đến (check-in).
- **`PUT /api/bookings/:id/check-out`**: (Owner) Xác nhận khách đã trả tiền và rời sân.
- **`POST /api/payments/create-intent`**: Khởi tạo Stripe Payment Intent dựa trên Booking ID. Trả về `clientSideToken` để Frontend gọi Stripe Elements thanh toán.
- **`POST /api/payments/webhook/stripe`**: Cổng Callback để Stripe chọc gọi về xác nhận `payment_intent.succeeded` hoặc `payment_intent.payment_failed`. Sau đó cập nhật trạng thái hóa đơn.
- **`POST /api/bookings`**: (Player) Gửi request khởi tạo đặt sân.
  - _Logic Check_: Hệ thống Request Redis Lock khóa `[field_id]_[time_slot_id]_[date]`. Nếu thành công, giữ pending trong 5-10 phút để đợi user thanh toán cọc. Nếu khóa đã bị giữ, báo lỗi "Sân đã có người đặt".

### 5. APIs Bảng Tin & Ghép Trận (Matchmaking)

- **`GET /api/match-posts`**: Lấy danh sách bảng tin tìm kèo (Có phân trang, bộ lọc: trung tâm, level, thời gian).
- **`POST /api/match-posts`**: Tạo bài tìm người / tìm đội.
- **`POST /api/match-posts/:id/requests`**: Gửi yêu cầu nhận kèo.
- **`PUT /api/match-requests/:req_id/status`**: (Đội trưởng người đăng) Chấp nhận / Từ chối yêu cầu ghép trận.
  - _Side Effect_: Nếu Chấp nhận (ACCEPT), tự động tạo 1 Conversation dành cho 2 user để chat thông qua API Chat.
- **`PUT /api/match-posts/:id`**: (Đội trưởng người đăng) sửa thông tin bài đăng.
- **`DELETE /api/match-posts/:id`**: (Đội trưởng người đăng) xóa bài đăng.

### 6. APIs Chat & Thông Báo (WebSocket/REST tích hợp)

**REST APIs (Nền tảng):**
- **`GET /api/conversations`**: Lắng danh sách chat (Inbox).
- **`GET /api/conversations/:id/messages`**: Lấy lịch sử tin nhắn trong phòng chat.
- **`POST /api/conversations/:id/messages`**: Send tin nhắn (Sẽ trigger event đẩy Socket).
- **`GET /api/notifications`**: Lấy lịch sử thông báo push.

**WebSocket Events (Real-time):**
- **`Emit: joinRoom`**: Join vào một `conversation_id` cụ thể để lắng nghe tin nhắn.
- **`Emit: sendMessage`**: Bắn tin nhắn trực tiếp qua Socket thay vì gọi REST (Tùy chọn cho client cần mượt mà).
- **`Listen: receiveMessage`**: Lắng nghe tin nhắn mới đẩy về cho phòng hoặc cá nhân.
- **`Listen: matchRequestStatusChanged`**: Cập nhật trạng thái duyệt yêu cầu "Nhận Kèo" lập tức trên màn hình.
- **`Listen: newMatchRequest`**: Đối thủ gửi yêu cầu nhận kèo của mình thì lập tức nảy Notification Real-time.
- **`Listen: bookingStatusAmended`**: Khi trạng thái sân bị người khác lock hoặc người của bảng tin thay đổi/hủy sân, phát Broadcast để reload bảng tin hoặc giao diện đặt sân tương ứng.

### 7. APIs Quản Trị Hệ Thống (Admin)

**7.1 Quản lý Người dùng (User Management)**
- **`GET /api/admin/users`**: Lấy danh sách toàn bộ người dùng (Player, Owner) kèm bộ lọc (theo role, trạng thái `ACTIVE` / `BANNED`, điểm trust_score).
- **`PUT /api/admin/users/:id/status`**: Khóa (Ban) hoặc Mở khóa (Unban) tài khoản người dùng vi phạm (Ví dụ: bùng kèo quá nhiều lần).
- **`GET /api/admin/reviews`**: Xem toàn bộ lịch sử đánh giá cộng/trừ điểm của hệ thống để xác minh các report gian lận đánh giá.

**7.2 Kiểm duyệt Nội dung & Dữ liệu (Moderation)**
- **`GET /api/admin/fields`**: Lấy danh sách toàn bộ sân bóng trên hệ thống để kiểm duyệt.
- **`PUT /api/admin/fields/:id/status`**: Đình chỉ / Tạm khóa một sân bóng (khi có khiếu nại sân ảo, lừa đảo cọc).
- **`DELETE /api/admin/match-posts/:id`**: Xóa bắt buộc một bài đăng tìm kèo trên Bảng tin nếu vi phạm tiêu chuẩn cộng đồng (ngôn từ đả kích, content rác).

**7.3 Thống kê Toàn hệ thống (System Analytics)**
- **`GET /api/admin/dashboard/overview`**: Lấy các key metrics tổng quan: Tổng số Users, Tổng số Sân hiện có, Số lượng Trận đấu đã ghép thành công.
- **`GET /api/admin/dashboard/transactions`**: Lấy thống kê tổng luồng tiền giao dịch chảy qua hệ thống (Tổng doanh thu của tất cả sân gộp lại) phục vụ cho việc tính phí nền tảng/hoa hồng sau này.
