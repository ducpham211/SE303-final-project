🏟️ Hệ Thống Đặt Sân \& Ghép Trận Thể Thao (Sport Hub)

Tài liệu mô tả kiến trúc Database và luồng nghiệp vụ cốt lõi của hệ thống. Thiết kế tập trung vào tính thực tế: đặt sân nhanh, ghép kèo uy tín và quản lý dòng tiền minh bạch.

📊 Sơ đồ Thực thể (ERD)

!\[Database Schema Image](./erd-diagram.png)

🛠️ Phân hệ \& Logic Kỹ thuật (Technical Notes)

1\. Quản lý Khung giờ (Time Slots)

Cơ chế linh hoạt: Thay vì để giờ cứng, bảng time\_slots cho phép chủ sân tự định nghĩa các khung giờ (ví dụ: 17:30 - 19:00) với mức giá (price) khác nhau cho từng khung.

Ràng buộc đặt sân: Khi thực hiện bookings, Backend cần kiểm tra tính duy nhất của bộ: field\_id + time\_slot\_id + booking\_date để tránh tình trạng Double Booking (trùng lịch).

2\. Hệ thống Ghép trận \& Kèo uy tín (Matchmaking)

Kèo "Xịn" (Verified Match): Một bài đăng match\_posts được coi là uy tín khi có gắn kèm booking\_id (đã đặt sân và đặt cọc).

Tính đa dụng: field\_id và booking\_id có thể để trống (NULL) trong trường hợp đội bóng đang đi "tìm đối có sân" hoặc "tìm sân trung gian".

Luồng phê duyệt: match\_requests cho phép chủ bài đăng duyệt đối thủ (ACCEPTED) hoặc từ chối (REJECTED) trước khi bắt đầu trận.

3\. Hệ thống Uy tín \& Đánh giá (Trust Score)

Trust Score: Điểm mặc định là 100.

Cơ chế trừ điểm: Thông qua bảng reviews, hệ thống ghi lại score\_change.

Ví dụ: Bùng kèo (No-show) bị trừ 20 điểm. Đi muộn bị trừ 5 điểm.

Hệ quả: User có điểm uy tín thấp (< 50) có thể bị hệ thống tự động từ chối quyền đăng bài ghép trận.

4\. Giao tiếp \& Thông báo (Communication)

Messenger nội bộ: Hỗ trợ chat 1-1 hoặc chat nhóm trận đấu thông qua conversations và messages.

Real-time Notifications: Bảng notifications lưu vết mọi biến động (Có người thách đấu, Đã cọc tiền thành công, Tin nhắn mới).

🚦 Quy ước Trạng thái (Enums)

Để đảm bảo tính nhất nhất, Backend cần tuân thủ các tập giá trị sau:

BookingStatus: PENDING (Chờ thanh toán), PAID (Đã cọc), CANCELLED (Đã hủy), COMPLETED (Đã đá).

PostType: FIND\_OPPONENT (Tìm đối thủ), FIND\_MEMBER (Tìm đồng đội ghép đội).

NotificationType: SYSTEM, BOOKING\_UPDATE, MATCH\_REQUEST, NEW\_MESSAGE.

PaymentMethod: STRIPE, MOMO, CASH.
