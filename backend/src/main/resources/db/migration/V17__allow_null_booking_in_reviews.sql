DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(255),
    field_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);