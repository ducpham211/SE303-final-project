import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

/**
 * Payment Success callback page — /payment/success
 * Stripe redirects here with ?session_id={CHECKOUT_SESSION_ID}
 * after a successful deposit payment.
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Hide confetti animation after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="payment-callback-page">
      {/* Confetti / celebration animation */}
      {showConfetti && (
        <div className="payment-confetti" aria-hidden="true">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="payment-confetti__piece"
              style={{
                '--x': `${Math.random() * 100}vw`,
                '--delay': `${Math.random() * 2}s`,
                '--color': ['#60D86E', '#45c45a', '#ffd700', '#4fc3f7', '#ff8a65', '#ba68c8'][i % 6],
                '--duration': `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="payment-callback-card">
        {/* Success Icon */}
        <div className="payment-icon payment-icon--success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="payment-callback-title">Đặt sân thành công!</h1>
        <p className="payment-callback-desc">
          Thanh toán cọc đã được xác nhận. Chúng tôi đã ghi nhận đơn đặt sân của bạn.
        </p>

        {sessionId && (
          <div className="payment-session-info">
            <span className="payment-session-label">Mã phiên thanh toán</span>
            <code className="payment-session-code">{sessionId.slice(0, 28)}...</code>
          </div>
        )}

        <div className="payment-callback-steps">
          <div className="payment-step">
            <div className="payment-step__num payment-step__num--done">1</div>
            <div>
              <h4 className="payment-step__title">Cọc 30% đã thanh toán</h4>
              <p className="payment-step__desc">Qua Stripe — an toàn & bảo mật</p>
            </div>
          </div>
          <div className="payment-step">
            <div className="payment-step__num payment-step__num--next">2</div>
            <div>
              <h4 className="payment-step__title">Đến sân đúng giờ</h4>
              <p className="payment-step__desc">Thanh toán phần còn lại tại sân</p>
            </div>
          </div>
          <div className="payment-step">
            <div className="payment-step__num">3</div>
            <div>
              <h4 className="payment-step__title">Chơi bóng vui vẻ!</h4>
              <p className="payment-step__desc">Chúc bạn có trận đấu tuyệt vời</p>
            </div>
          </div>
        </div>

        <div className="payment-callback-actions">
          <Link to="/booking-history" className="payment-btn payment-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Xem lịch đặt
          </Link>
          <Link to="/" className="payment-btn payment-btn--ghost">
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
