1. Về việc tạo nhánh (Branching): Tạo một nhánh mới khi code 1 chức năng mới

Bước 1: Từ nhánh dev, khi bạn nhận làm chức năng "Đăng nhập", bạn gõ: git checkout -b feature/login-page.
Bước 2: Bạn viết code, test trên máy tính của bạn xong xuôi, bạn commit và push nhánh feature/login-page đó lên Github.
Bước 3: Bạn lên Github nhấn nút tạo Pull Request (PR) yêu cầu gộp nhánh feature/login-page vào nhánh dev. Team sẽ review và nhấn Merge.
Bước 4: Khi chuyển sang làm tính năng "Thanh toán", bạn lại kéo code mới nhất từ dev về máy và tạo nhánh mới: git checkout -b feature/payment.
