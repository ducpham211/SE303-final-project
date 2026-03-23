# Hướng Dẫn Cài Đặt & Chạy Backend (Dành Cho Frontend Dev)

Chào bạn! Tài liệu này sẽ hướng dẫn bạn cách khởi chạy server Backend (Spring Boot) dưới Local để phục vụ cho việc gọi API và tích hợp UI. Quá trình này rất nhanh và đã được tự động hóa tối đa.

## 🛠 1. Yêu Cầu Cài Đặt (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt các công cụ sau:

- **Java Development Kit (JDK) 21**: Bắt buộc phải là bản 21 (khuyên dùng Microsoft OpenJDK hoặc Oracle).
- **IDE (Trình soạn thảo code)**: Khuyên dùng IntelliJ IDEA (bản Community miễn phí là đủ). Bạn cũng có thể dùng VS Code nếu đã rành cấu hình Java.
- **Git**: Để clone project.

## 🚀 2. Thiết Lập Môi Trường (Environment Setup)

Hệ thống sử dụng file `.env` để bảo mật thông tin Database và API Keys.

Tại thư mục gốc của project (cùng cấp với file `pom.xml`), hãy tạo một file tên là `.env`.

Xin Backend Dev file `.env` chuẩn hoặc copy nội dung mẫu dưới đây và điền các thông số tương ứng (được cung cấp nội bộ):

```
# Server
SERVER_PORT=8080
SPRING_PROFILE_ACTIVE=local

# Database (Supabase IPv4 Pooler)
SPRING_DATASOURCE_URL=jdbc:postgresql://<link-supabase-pooler>:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres.<project-id>
SPRING_DATASOURCE_PASSWORD=<database-password>

# JPA Settings
SPRING_JPA_HIBERNATE_DDL_AUTO=none
SPRING_JPA_SHOW_SQL=true

# Redis (Nếu sử dụng sau này)
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379

# Supabase Auth Keys (Dùng cho API xác thực)
JWT_SECRET=<jwt-secret-key>
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

(Lưu ý: Tuyệt đối không commit file `.env` lên GitHub).

## 🗄 3. Khởi Tạo Database (Tin vui: Tự động 100%!)

Bạn KHÔNG CẦN phải cài đặt PostgreSQL dưới máy hay tự chạy các file `.sql` bằng tay!

Hệ thống Backend đã được tích hợp Flyway. Khi bạn chạy Server ở Bước 4, Flyway sẽ tự động kiểm tra, tạo các bảng (users, fields, bookings...) và cấu hình triggers thẳng lên Supabase dựa trên các file migration có sẵn.

## ▶️ 4. Chạy Server Spring Boot

### Nếu dùng IntelliJ IDEA (Khuyên dùng):

- Mở thư mục project bằng IntelliJ: File -> Open... -> Chọn file `pom.xml` -> Chọn Open as Project.
- Mở tab Maven ở lề bên phải màn hình -> Bấm nút Reload All Maven Projects (biểu tượng 2 mũi tên xoay tròn) để tải thư viện về.
- Chờ thanh tiến trình góc dưới bên phải chạy xong.
- Điều hướng tới file chính: `src/main/java/com/example/backend/BackendApplication.java`.
- Nhấn nút Play (▶️) màu xanh lá cạnh dòng `public class BackendApplication` hoặc trên thanh công cụ trên cùng.

### Nếu dùng Terminal/Command Line:

Mở terminal tại thư mục gốc và gõ lệnh:

```bash
# Đối với Windows
./mvnw spring-boot:run

# Đối với macOS/Linux
./mvnw spring-boot:run
```

## ✅ 5. Kiểm Tra Hoạt Động

Sau khi thấy dòng chữ `Started BackendApplication in ... seconds` trên Terminal, server của bạn đã chạy thành công!

- **Base URL**: http://localhost:8080

Hãy dùng Postman (hoặc trình duyệt) gọi thử API sau để test kết nối:

- **Đăng nhập**: POST http://localhost:8080/api/auth/login
