import { Link } from 'react-router-dom'

/**
 * Payment Cancel callback page — /payment/cancel
 * Stripe redirects here when the user cancels or abandons the checkout.
 */
export default function PaymentCancelPage() {
  return (
    <main className="payment-callback-page">
      <div className="payment-callback-card">
        {/* Cancel Icon */}
        <div className="payment-icon payment-icon--cancel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="payment-callback-title">Thanh toán bị hủy</h1>
        <p className="payment-callback-desc">
          Bạn đã hủy quá trình thanh toán. Đơn đặt sân chưa được xác nhận.
          Đừng lo, bạn có thể thử lại bất cứ lúc nào!
        </p>

        <div className="payment-cancel-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Không có khoản phí nào được tính. Slot sân vẫn còn trống trong thời gian giới hạn.</p>
        </div>

        <div className="payment-callback-actions">
          <Link to="/dat-san" className="payment-btn payment-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Quay lại đặt sân
          </Link>
          <Link to="/" className="payment-btn payment-btn--ghost">
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
