-- Kiểm tra và thêm cột payment_method (Lỗi bác vừa gặp)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Kiểm tra và thêm luôn cột stripe_payment_intent_id cho chắc cú
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- (Tùy chọn) Bác check xem bảng payments có thiếu cột status không, nếu thiếu thì gỡ comment dòng dưới:
-- ALTER TABLE payments ADD COLUMN IF NOT EXISTS status VARCHAR(50);