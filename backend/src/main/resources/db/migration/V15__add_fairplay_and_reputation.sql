-- Thêm cột điểm uy tín cho user, mặc định là 100
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INT DEFAULT 100;
UPDATE users SET reputation_score = 100 WHERE reputation_score IS NULL;

-- Bảng lưu trữ đánh giá gửi lên Tòa án Fairplay
CREATE TABLE IF NOT EXISTS opponent_reviews (
    id UUID PRIMARY KEY,
    match_id UUID,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating_type VARCHAR(50) NOT NULL, -- GOOD, NO_SHOW, BAD_BEHAVIOR
    comment TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, RESOLVED, REJECTED
    points_applied INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_or_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_or_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);