# Cài đặt và Chạy Stripe CLI (Cổng thanh toán)

Để test được tính năng thanh toán và tự động đổi trạng thái đơn hàng, chúng ta cần giả lập một đường hầm (Tunnel) để Stripe gọi Webhook về localhost:8080.

## 1. Cài đặt Stripe CLI:

Tải Stripe CLI tại: https://stripe.com/docs/stripe-cli

Giải nén và để file stripe.exe ở một thư mục cố định (VD: D:\Downloads\).

## 2. Đăng nhập (Chỉ làm 1 lần duy nhất):

Mở Terminal, trỏ đến thư mục chứa stripe.exe và gõ:

```powershell
stripe login
```

Hoặc : kéo file exe đó vào cmd để nó tự trỏ đến, sẽ có định dạng thế này D:\Downloads\stripe.exe , chỉ cần bấm thêm "login" để hoàn tất
là sẽ trở thành D:\Downloads\stripe.exe login

## 3. Khởi chạy Webhook Listener:

Để không phải gõ lệnh dài dòng mỗi ngày, đã có sẵn 1 file start-stripe.bat ở thư mục dự án với nội dung sau:

```dos
D:\Downloads\stripe.exe listen --forward-to localhost:8080/api/payments/webhook
```

(Lưu ý: Nhớ sửa lại đường dẫn D:\Downloads\stripe.exe cho đúng với máy của bạn). Mỗi khi code, chỉ cần bấm run cái file đó là mở cổng thanh toán

## 4. Lấy Webhook Secret:

Ngay khi chạy lệnh Listen ở trên (hoặc chạy file .bat), màn hình Terminal đen sẽ in ra một dòng:

```text
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxx...
```

👉 Copy cái đoạn whsec_... đó và dán vào biến STRIPE_WEBHOOK_SECRET trong file .env ở Bước 1.

# Bước 4: Chạy Server và Test luồng thanh toán

Mở IntelliJ, đảm bảo đã Reload Maven để tải đủ thư viện.

Chạy file BackendApplication.java để bật Spring Boot.

Đảm bảo file start-stripe.bat (cửa sổ đen) đang được bật và treo ngầm.

Test luồng thanh toán bằng Postman hoặc giao diện Frontend.

# Chạy Redis Server (Bằng Docker Compose)

Hệ thống sử dụng Redis để lưu trữ Cache và quản lý trạng thái. Cả team sẽ dùng Docker Compose để chạy môi trường đồng nhất.

1. Đảm bảo máy đã cài đặt **Docker Desktop** và đang mở app Docker.
2. Mở Terminal / PowerShell tại thư mục gốc của project (chỗ có file `docker-compose.yml`).
3. Gõ lệnh sau để khởi động Redis ngầm:

```bash
docker-compose up -d
```
