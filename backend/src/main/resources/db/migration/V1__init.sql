-- Initial schema for the booking system
-- Uses pgcrypto for gen_random_uuid(); enable it if not already present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CÁC BẢNG ĐỘC LẬP (Không phụ thuộc khóa ngoại)
-- Users
CREATE TABLE IF NOT EXISTS users (
                                     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                     email varchar(255) UNIQUE NOT NULL,
                                     password varchar(255) NOT NULL,
                                     role varchar(50),
                                     full_name varchar(255),
                                     phone varchar(50) UNIQUE,
                                     trust_score integer DEFAULT 100,
                                     created_at timestamp without time zone DEFAULT now(),
                                     updated_at timestamp without time zone DEFAULT now()
);

-- Fields
CREATE TABLE IF NOT EXISTS field (
                                     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                     name varchar(255) NOT NULL,
                                     address text,
                                     type varchar(50),
                                     status varchar(50),
                                     price_per_hour numeric,
                                     created_at timestamp without time zone DEFAULT now()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversation (
                                            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                            type varchar(50),
                                            created_at timestamp without time zone DEFAULT now()
);

-- 2. CÁC BẢNG LEVEL 1 (Phụ thuộc vào các bảng độc lập ở trên)
-- Teams (Phụ thuộc users)
CREATE TABLE IF NOT EXISTS teams (
                                     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                     name varchar(255) NOT NULL,
                                     captain_id uuid REFERENCES users(id) ON DELETE SET NULL,
                                     level varchar(50),
                                     created_at timestamp without time zone DEFAULT now()
);

-- Time slots (Phụ thuộc field)
CREATE TABLE IF NOT EXISTS time_slot (
                                         id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                         field_id uuid REFERENCES field(id) ON DELETE CASCADE,
                                         start_time time NOT NULL,
                                         end_time time NOT NULL,
                                         created_at timestamp without time zone DEFAULT now()
);

-- Messages (Phụ thuộc conversation, users)
CREATE TABLE IF NOT EXISTS message (
                                       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                       conversation_id uuid REFERENCES conversation(id) ON DELETE CASCADE,
                                       sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
                                       content text,
                                       created_at timestamp without time zone DEFAULT now()
);

-- Conversation members (Phụ thuộc conversation, users)
CREATE TABLE IF NOT EXISTS conversation_member (
                                                   conversation_id uuid REFERENCES conversation(id) ON DELETE CASCADE,
                                                   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
                                                   joined_at timestamp without time zone DEFAULT now(),
                                                   PRIMARY KEY (conversation_id, user_id)
);

-- Notifications (Phụ thuộc users)
CREATE TABLE IF NOT EXISTS notification (
                                            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                            user_id uuid REFERENCES users(id) ON DELETE CASCADE,
                                            type varchar(50),
                                            message text,
                                            read boolean DEFAULT false,
                                            created_at timestamp without time zone DEFAULT now()
);

-- Match posts (Phụ thuộc users)
CREATE TABLE IF NOT EXISTS match_post (
                                          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                          user_id uuid REFERENCES users(id) ON DELETE SET NULL,
                                          title varchar(255),
                                          description text,
                                          type varchar(50),
                                          status varchar(50),
                                          created_at timestamp without time zone DEFAULT now()
);

-- 3. CÁC BẢNG LEVEL 2 & 3 (Phụ thuộc chéo nhiều bảng)
-- Match requests (Phụ thuộc users, match_post)
CREATE TABLE IF NOT EXISTS match_request (
                                             id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                             requester_id uuid REFERENCES users(id) ON DELETE SET NULL,
                                             post_id uuid REFERENCES match_post(id) ON DELETE CASCADE,
                                             status varchar(50),
                                             created_at timestamp without time zone DEFAULT now()
);

-- Bookings (Phụ thuộc users, field, time_slot)
CREATE TABLE IF NOT EXISTS booking (
                                       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                       user_id uuid REFERENCES users(id) ON DELETE SET NULL,
                                       field_id uuid REFERENCES field(id) ON DELETE SET NULL,
                                       time_slot_id uuid REFERENCES time_slot(id) ON DELETE SET NULL,
                                       status varchar(50),
                                       total_amount numeric,
                                       created_at timestamp without time zone DEFAULT now(),
                                       updated_at timestamp without time zone DEFAULT now()
);

-- Payments (Phụ thuộc users, booking)
CREATE TABLE IF NOT EXISTS payment (
                                       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                       user_id uuid REFERENCES users(id) ON DELETE SET NULL,
                                       booking_id uuid REFERENCES booking(id) ON DELETE SET NULL,
                                       method varchar(50),
                                       status varchar(50),
                                       amount numeric,
                                       created_at timestamp without time zone DEFAULT now()
);

-- 4. INDEXES
-- Simple index examples
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_booking_user ON booking(user_id);
CREATE INDEX IF NOT EXISTS idx_field_name ON field(name);