1. Cơ chế vận hành của hệ thống
   Hệ thống hoạt động theo mô hình nền tảng tập trung, kết nối trực tiếp Đơn vị cung cấp (Chủ sân) và Khách hàng thông qua hai luồng nghiệp vụ song song:
   Quy trình Đặt sân trực tuyến: Chủ sân tiến hành số hóa thông tin cơ sở vật chất và lịch trống lên nền tảng. Từ phía người chơi, họ sử dụng giao diện trực quan để tra cứu tình trạng sân bãi. Ngay khi người chơi chọn giờ và hoàn tất đặt cọc, hệ thống lập tức khóa khung giờ đó trên toàn mạng lưới và gửi xác nhận tự động đến các bên liên quan, đảm bảo tính minh bạch.
   Quy trình Kết nối và Ghép trận: Nhằm hỗ trợ các đội bóng bị hủy lịch đột xuất hoặc có nhu cầu cọ xát, hệ thống cung cấp "Bảng tin giao hữu". Người dùng có thể đăng tải yêu cầu thi đấu kèm theo điều kiện cụ thể (trình độ, tỷ lệ chia sẻ chi phí). Các đội bóng khác có thể tiếp nhận yêu cầu trên hệ thống và có thể thương lượng trực tiếp qua hệ thống nhắn tin nội bộ để đi đến thống nhất trận đấu ngoài ra hệ thống còn cho phép tìm thêm cầu thủ hỗ trợ từ bên ngoài những lúc mà đội bóng thiếu người hoặc gặp các vấn đề bất khả kháng về các thành viên trong đội.

2. Các điểm nhấn sáng tạo và đột phá
   Dự án không chỉ số hóa quy trình quản lý mà còn mang đến những giải pháp công nghệ nhằm tối ưu hóa trải nghiệm người dùng và hiệu quả kinh doanh:
   Cơ chế chống trùng lặp lịch (Phương pháp Khóa phân tán (Distributed Lock) với Redis): Ứng dụng thuật toán giữ chỗ thông minh. Khi có nhiều người dùng cùng truy cập và chọn một khung giờ, hệ thống sẽ tự động xếp hàng và ưu tiên xử lý giao dịch đầu tiên. Các yêu cầu đến sau sẽ nhận được thông báo chờ, loại bỏ hoàn toàn rủi ro trùng lịch cho chủ sân.
   Đồng bộ hóa dữ liệu tức thời: Mọi thay đổi về trạng thái sân, yêu cầu ghép trận hay tin nhắn mới đều được tự động cập nhật ngay lập tức trên màn hình của tất cả người dùng đang trực tuyến. Trải nghiệm xuyên suốt này giúp thông tin luôn chính xác mà không yêu cầu thao tác tải lại trang.
   Mô hình "Mạng xã hội thể thao thu nhỏ": Vượt ra khỏi chức năng đặt chỗ đơn thuần, tính năng ghép trận xây dựng một cộng đồng người chơi tương tác cao. Điều này không chỉ gia tăng giá trị cho người dùng mà còn giúp chủ sân lấp đầy các khoảng trống do việc hủy lịch đột xuất gây ra.
   Chiến lược định giá linh hoạt : Cung cấp công cụ quản trị giúp chủ sân điều chỉnh mức giá tự động dựa trên quy luật cung cầu. Hệ thống có thể áp dụng chính sách giảm giá kích cầu vào các giờ thấp điểm và duy trì mức giá tiêu chuẩn vào các khung giờ vàng, từ đó tối ưu hóa doanh thu.
3. Tech stack cơ bản
   Front end : React js
   Back end : Java Spring
   Database : Postgres ( Supabase ) + Prisma ORM
   Optimise : Redis
   Advanced : Web socket, Momo Payment
