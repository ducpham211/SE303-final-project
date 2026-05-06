-- 1. Xóa sổ hoàn toàn bảng reviews cũ (Dùng CASCADE để tránh lỗi dính líu khóa ngoại nếu có)
DROP TABLE IF EXISTS reviews CASCADE;

-- 2. Tạo lại bảng reviews mới tinh tươm theo đúng thiết kế "không ràng buộc" (Loosely Coupled)
CREATE TABLE reviews (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Các ID lưu dưới dạng UUID độc lập, KHÔNG DÙNG REFERENCES (Khóa ngoại) nữa
                         reviewer_id UUID,
                         reviewee_id UUID,
                         match_request_id UUID,

    -- Các trường dữ liệu cũ
                         score_change INT,
                         reason TEXT,

    -- Các trường dành cho AI
                         ai_suggested_penalty INT,
                         status VARCHAR(50) DEFAULT 'PENDING_ADMIN_REVIEW',

                         created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- (Khuyên dùng) Tạo thêm Index để sau này bạn SELECT tìm kiếm Review theo User hoặc theo Trận đấu cho nhanh
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_match_request ON reviews(match_request_id);