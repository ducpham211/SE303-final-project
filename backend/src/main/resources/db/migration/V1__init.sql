-- ==============================================================================
-- GỘP 3 FILE (V1 + V2 + V3) THÀNH MỘT FILE DUY NHẤT CHUẨN XÁC 100% THEO ENTITY
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    password varchar(255),
    role varchar(50),
    full_name varchar(255),
    phone varchar(50) UNIQUE,
    trust_score integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- 2. TEAMS
CREATE TABLE IF NOT EXISTS teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    captain_id uuid REFERENCES users(id) ON DELETE SET NULL,
    level varchar(50),
    created_at timestamp without time zone DEFAULT now()
);

-- 3. FIELDS
CREATE TABLE IF NOT EXISTS fields (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    type varchar(50),
    cover_image text,
    status varchar(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- 4. TIME_SLOTS
CREATE TABLE IF NOT EXISTS time_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    price numeric,
    created_at timestamp without time zone DEFAULT now()
);

-- 5. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type varchar(50),
    created_at timestamp without time zone DEFAULT now()
);

-- 6. MATCH_POSTS
CREATE TABLE IF NOT EXISTS match_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
    field_id uuid REFERENCES fields(id) ON DELETE SET NULL,
    booking_id uuid, -- We'll add FK later if needed due to circular dependencies
    date date,
    time_start timestamp without time zone,
    time_end timestamp without time zone,
    post_type varchar(50),
    skill_level varchar(50),
    cost_sharing text,
    message text,
    status varchar(50),
    created_at timestamp without time zone DEFAULT now()
);

-- 7. MATCH_REQUESTS
CREATE TABLE IF NOT EXISTS match_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid REFERENCES users(id) ON DELETE SET NULL,
    post_id uuid REFERENCES match_posts(id) ON DELETE CASCADE,
    status varchar(50),
    message text,
    created_at timestamp without time zone DEFAULT now()
);

-- 8. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    field_id uuid REFERENCES fields(id) ON DELETE SET NULL,
    time_slot_id uuid REFERENCES time_slots(id) ON DELETE SET NULL,
    booking_date date,
    status varchar(50),
    deposit_amount numeric,
    total_amount numeric,
    note text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
    method varchar(50),
    status varchar(50),
    amount numeric,
    created_at timestamp without time zone DEFAULT now()
);

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id uuid REFERENCES users(id) ON DELETE CASCADE,
    match_id uuid REFERENCES match_posts(id) ON DELETE SET NULL,
    score_change integer NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now()
);

-- 11. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
    content text,
    created_at timestamp without time zone DEFAULT now()
);

-- 12. CONVERSATION_MEMBERS
CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    joined_at timestamp without time zone DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type varchar(50),
    title varchar(255),
    content text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);

-- ==============================================================================
-- CÁC TRIGGER CẬP NHẬT UPDATED_AT (TỪ V2 CŨ)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_booking_updated_at ON public.bookings;
CREATE TRIGGER set_booking_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- ==============================================================================
-- TRIGGER SUPABASE AUTH (TỪ V2 CŨ)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'PLAYER');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_deleted_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_user();