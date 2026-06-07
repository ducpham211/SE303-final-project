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
          Bạn đã hủy quá trình thanh toán. Đừng lo — đơn đặt sân <strong>vẫn còn đó</strong>!
          Bạn có thể vào <strong>Lịch đặt sân</strong> để tiếp tục thanh toán cọc trước khi slot bị giải phóng.
        </p>

        <div className="payment-cancel-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Slot sân vẫn được giữ trong <strong>5 phút</strong>. Sau đó sẽ tự động được trả lại nếu chưa thanh toán.</p>
        </div>

        <div className="payment-callback-actions">
          <Link to="/booking-history" className="payment-btn payment-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Vào lịch đặt sân để tiếp tục
          </Link>
          <Link to="/fields" className="payment-btn payment-btn--ghost">
            Đặt sân mới
          </Link>
        </div>
      </div>
    </main>
  )
}
