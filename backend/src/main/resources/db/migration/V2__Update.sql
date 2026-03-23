-- ==============================================================================
-- 4. TẠO BẢNG REVIEWS (ĐÁNH GIÁ & ĐIỂM UY TÍN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reviews (
                                       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                       reviewer_id uuid REFERENCES users(id) ON DELETE CASCADE,   -- Người đi đánh giá
                                       reviewee_id uuid REFERENCES users(id) ON DELETE CASCADE,   -- Người bị đánh giá
                                       match_id uuid REFERENCES match_post(id) ON DELETE SET NULL, -- Trận đấu mà 2 đội đã đá (hoặc dùng booking_id)
                                       score_change integer NOT NULL, -- Số điểm cộng/trừ (vd: +5, -10)
                                       reason text,                   -- Lý do đánh giá
                                       created_at timestamp without time zone DEFAULT now()
);

-- Tạo index để truy xuất lịch sử đánh giá nhanh hơn
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
-- ==============================================================================
-- 1. XỬ LÝ RÀNG BUỘC PASSWORD
-- ==============================================================================
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;

-- ==============================================================================
-- 2. TRIGGER ĐỒNG BỘ AUTH.USERS -> PUBLIC.USERS (ĐĂNG KÝ & XÓA TÀI KHOẢN)
-- ==============================================================================

-- Hàm: Copy thông tin khi có đăng ký mới
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

-- Hàm: Xóa thông tin khi tài khoản bị xóa ở Auth
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

-- Gắn cò súng Đăng ký
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Gắn cò súng Xóa tài khoản
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_user();


-- ==============================================================================
-- 3. TRIGGER TỰ ĐỘNG CẬP NHẬT CỘT 'updated_at'
-- ==============================================================================

-- Hàm: Đặt thời gian hiện tại
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Gắn cò súng vào bảng users
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- Gắn cò súng vào bảng booking
DROP TRIGGER IF EXISTS set_booking_updated_at ON public.booking;
CREATE TRIGGER set_booking_updated_at
    BEFORE UPDATE ON public.booking
    FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();