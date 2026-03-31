# 6. ⚙️ [Backend Architecture] Kiến trúc và Luồng xử lý WebSocket (Spring Boot)

Hệ thống Real-time chat được thiết kế dựa trên kiến trúc Lai (Hybrid Approach), kết hợp giữa mô hình Pub/Sub (Publish/Subscribe) qua giao thức STOMP/WebSocket và các REST API truyền thống. Dưới đây là chi tiết luồng vận hành kỹ thuật tại tầng Backend:

## Bước 1: Khởi tạo Endpoint và Message Broker (WebSocketConfig)

Hệ thống yêu cầu thiết lập điểm kết nối mạng và bộ định tuyến tin nhắn (Router/Broker).

- **Endpoint (`/ws`):** Điểm nết nối vật lý (Physical Connection) dành cho Client khởi tạo luồng WebSocket. Tích hợp thư viện SockJS làm fallback mechanism nhằm đảm bảo kết nối vẫn duy trì trên các trình duyệt không hỗ trợ WebSocket thuần.
- **Message Broker (`/topic`):** Đóng vai trò là trung tâm phân phối tin nhắn. Các phòng chat được phân tách thành các không gian ảo (Channel) độc lập (ví dụ: `/topic/conversations/{conversationId}`). Client thực hiện lệnh subscribe vào kênh tương ứng để nhận luồng dữ liệu bất đồng bộ.

## Bước 2: Cấu hình Phân quyền và Nới lỏng Endpoint (SecurityConfig)

Khác với các REST API thông thường chịu sự kiểm soát nghiêm ngặt của JwtAuthenticationFilter, endpoint `/ws/**` được cấu hình quyền truy cập công khai (`permitAll()`).

- **Mục đích:** Quá trình khởi tạo kết nối (Handshake) của WebSocket cần được diễn ra liền mạch. Việc nới lỏng endpoint này tạo điều kiện thuận lợi cho Client thiết lập kết nối và subscribe nhanh chóng.
- **Tính bảo mật:** Đảm bảo an toàn tuyệt đối do kênh WebSocket trong kiến trúc này được thiết lập ở trạng thái Chỉ đọc (Read-only) đối với Client. Mọi hành động ghi/gửi dữ liệu đều bị chặn ở tầng này.

## Bước 3: Tiếp nhận Dữ liệu đầu vào qua REST API (MessageController)

Để đảm bảo tính toàn vẹn và bảo mật, khi Client gửi tin nhắn, hệ thống không cho phép đẩy dữ liệu trực tiếp qua đường truyền WebSocket. Thay vào đó, Client phải gọi HTTP POST Request tới endpoint `/api/conversations/{id}/messages`.

**Ưu điểm của kiến trúc Hybrid:**

- Bắt buộc đính kèm JWT Token trong Header, giúp Backend xác thực và định danh chính xác người gửi.
- Cho phép Backend thực hiện Validate dữ liệu, kiểm duyệt nội dung, hoặc kiểm tra quyền hạn (Role/Permission) trước khi đưa vào Database.
- Linh hoạt mở rộng để hỗ trợ các payload phức tạp (Multipart file, hình ảnh, video, tài liệu) mà giao thức WebSocket thuần túy xử lý kém hiệu quả.

## Bước 4: Xử lý Lưu trữ và Phát sóng Sự kiện (MessageServiceImpl)

Đây là khâu xử lý cốt lõi liên kết giữa Database và Real-time Broker. Khi tầng Service tiếp nhận Request từ Controller:

- **Xác thực và Lưu trữ:** Hệ thống kiểm tra quyền tham gia phòng chat của người dùng (`isMember`). Nếu hợp lệ, bản ghi tin nhắn mới được lưu vào hệ quản trị cơ sở dữ liệu (PostgreSQL).
- **Phát sóng (Broadcast) qua STOMP:** Ngay sau khi transaction lưu trữ thành công, Service khởi tạo một DTO Response và sử dụng `SimpMessagingTemplate` để đẩy payload JSON này vào Message Broker.

```java
// Chuyển đổi Entity thành DTO
MessageResponse response = messageMapper.toMessageResponse(savedMessage);

// Phát sóng tin nhắn tới đích đến (Destination) cụ thể
messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, response);
```

- **Phân phối:** Message Broker lập tức broadcast payload này tới tất cả các Client đang duy trì kết nối (Subscribed) tại đích đến tương ứng. Frontend nhận được dữ liệu và re-render giao diện ngay lập tức mà không cần gửi HTTP GET Request (Polling).