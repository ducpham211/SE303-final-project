-- ==============================================================================
-- BẢN V5: CHUYỂN CỘT STATUS TỪ BẢNG FIELDS SANG TIME_SLOTS
-- ==============================================================================

-- 1. Xóa cột status thừa khỏi bảng fields vì Field không quản lý việc còn trống hay không
ALTER TABLE fields DROP COLUMN IF EXISTS status;

-- 2. Thêm cột status vào bảng time_slots để quản lý trạng thái từng khung giờ (AVAILABLE, MAINTENANCE...)
ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'AVAILABLE';
