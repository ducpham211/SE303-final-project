-- Xóa cột 'method' bị dư thừa (do đã dùng cột 'payment_method')
ALTER TABLE payments DROP COLUMN IF EXISTS method;