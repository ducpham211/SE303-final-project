# Quy định và Hướng dẫn làm việc nhóm dành cho Devs 🚀

Chào mừng các bạn đến với dự án! Do team chúng ta đa số là những người mới bắt đầu, tài liệu này được tạo ra để thiết lập các quy tắc chung, giúp mọi người làm việc trơn tru, tránh giẫm chân lên nhau (conflict code) và dễ dàng quản lý tiến độ.

---

## 1. Quản lý mã nguồn (Git & GitHub/Gitlab Workflow)

Đây là phần vô cùng quan trọng để code của các thành viên không bị ghi đè hay mất mát.

### 1.1. Cấu trúc nhánh (Branching Model)

- `main` / `master`: Nhánh chính thức. Code ở đây **luôn luôn phải chạy được** và là bản cuối cùng. **Không ai được code trực tiếp trên nhánh này.**
- `develop`: (Tùy chọn) Nhánh gom các tính năng mới trước khi đưa lên `main`.
- `feature/...`: Nhánh dùng để phát triển một tính năng mới.
  - **Cú pháp đặt tên:** `feature/[tên-tính-năng-ngắn-gọn]`
  - Ví dụ: `feature/login-page`, `feature/database-setup`
- `fix/...` hoặc `bugfix/...`: Nhánh dùng để sửa lỗi.
  - Ví dụ: `fix/button-not-clickable`

### 1.2. Quy tắc viết tin nhắn Commit (Commit Message)

Viết commit rõ ràng giúp lúc có lỗi, ta biết được dòng code đó được thêm vào để làm gì. Khuyến khích dùng chuẩn Conventional Commits:

- `feat: [Mô tả]` - Khi bạn thêm một tính năng mới (Ví dụ: `feat: Thêm trang đăng ký tài khoản`)
- `fix: [Mô tả]` - Khi bạn sửa một lỗi (Ví dụ: `fix: Lỗi crash app khi bấm nút submit`)
- `docs: [Mô tả]` - Khi bạn viết hoặc cập nhật tài liệu (Ví dụ: `docs: Cập nhật file README hướng dẫn chạy web`)
- `style: [Mô tả]` - Chỉnh sửa format, thiếu dấu chấm phẩy... (không ảnh hưởng logic code)
- `refactor: [Mô tả]` - Sửa lại code cho gọn/sạch hơn nhưng không đổi chức năng.

### 1.3. Quy trình gộp code (Pull Request / Merge Request)

1. Tuyệt đối **KHÔNG PUSH THẲNG** code vào `main` hay `develop`.
2. Sau khi push nhánh `feature/...` của bạn lên Github, hãy tạo một Pull Request (PR) yêu cầu gộp vào nhánh chính.
3. Nhờ ít nhất **1 thành viên khác** trong đội xem qua code (Code Review). Mục đích không phải để soi mói, mà là để học hỏi lẫn nhau và phát hiện lỗi sớm.
4. Nếu nhánh chính vừa có người khác gộp code vào, bạn phải pull code mới đó về máy mình, xử lý xung đột (Resolve Conflicts) nếu có định trước khi tiến hành merge PR của mình.

---

## 2. Quy chuẩn viết Code (Coding Conventions)

- **Đặt tên Biến và Hàm:** Phải có ý nghĩa và đọc hiểu được nó làm gì.
  - ❌ _Không tốt:_ `let a = 1;`, `function xd() {}`
  - ✅ _Tốt:_ `let userCount = 1;`, `function calculateTotalPrice() {}`
- **Ngôn ngữ đặt tên:** Cố gắng thống nhất đặt tên biến/hàm và tên file hoàn toàn bằng **Tiếng Anh**. (Ví dụ: `getUserInfo` thay vì `layThongTinUser`).
- **Làm sạch code:** Lắp đặt các công cụ như Prettier hoặc ESLint trên VSCode để tự động sắp xếp code (format) giống nhau cho cả đội.
- **Bình luận (Comments):** Chỉ comment giải thích **TẠI SAO** bạn lại viết đoạn logic đó nếu nó phức tạp. Không cần comment phần **LÀ GÌ** nếu tên hàm đã quá rõ ràng. Đừng quên xóa phần code thừa (đang bị comment out) trước khi push.
- **Đừng thay đổi code của người khác** nếu không có sự đồng ý của họ.
- **Viết code phải clean, dễ đọc, dễ hiểu, dễ bảo trì, Tuyệt đối không được viết theo kiểu nguyên khối.**

---

## 3. Quản lý Task và Quy trình làm việc

- **Nhận việc (Assign task):** Sử dụng các công cụ như Trello, Jira, Github Projects... Khi bắt đầu làm việc gì, hãy tự gán tên mình vào thẻ (card) đó và kéo sang cột `In Progress` hoặc `Doing`.
- **Cập nhật trạng thái:** Khi làm xong và tạo PR, kéo task sang cột `Review`. Khi code đã được merge, kéo sang `Done`.
- **Quy tắc "Không ôm bom":** Vì mọi người đều là người mới, gặp lỗi là chuyện rất bình thường.
  - Hãy tự tìm cách sửa (Google, ChatGPT, StackOverflow) trong tối đa **30 - 45 phút**.
  - Nếu quá thời gian trên vẫn không tìm ra cách, **phải chủ động hỏi ý kiến hoặc nhờ team hỗ trợ ngay**. Đừng ngồi loay hoay 1 mình tốn cả ngày cho một lỗi nhỏ gây chậm tiến độ chung.

---

## 4. Sau khi hoàn thành task

- **Lưu ý :** Phải có một file description về phần mình vừa làm, trong đó ghi rõ các thay đổi, chức năng, cách sử dụng và các lưu ý cần thiết.

---

## 5. Môi trường cài đặt

- **Tài liệu hướng dẫn (README):** Cần duy trì một file `README.md` chung ở ngoài cùng của dự án. Ghi chi tiết các bước để một người từ máy tính trắng tinh có thể chạy được dự án (Ví dụ: Cần chạy lệnh npm gì, khởi chạy databse như thế nào...).
- **Cẩn thận Bảo mật:** **Tuyệt đối không commit các file chứa mật khẩu, API Keys, thư mục `node_modules` hay thông tin kết nối Database lên Github.**
  - Đảm bảo bạn đã đưa chúng vào trong file `.gitignore`, Không push các key của dự án, node_modules, cần kiểm tra kỹ lại mọi thứ trước khi push code.
  - Các thông tin cấu hình này hãy tạo ra một file tên là `.env.example` (chỉ chứa tên biến, làm mẫu gởi lên git) và tự chia sẻ file `.env` thật cho nhau qua nhóm chat kín.

---

_Chúc cả đội chúng ta có một kỳ dự án thành công và học hỏi được nhiều thứ nhé!_ 🎉
