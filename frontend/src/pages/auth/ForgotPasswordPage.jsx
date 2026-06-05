import { useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../../services/authService'

/**
 * Forgot password page — /quen-mat-khau
 * Calls Supabase directly to send a password reset email.
 * Same split-panel layout as LoginPage / RegisterPage.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.')
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error_description ||
        'Không thể gửi email khôi phục. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ── Brand Panel ── */}
      <div className="auth-brand">
        <div className="auth-brand__inner">
          <div className="auth-logo">
            <span className="auth-logo__icon">T</span>
          </div>
          <h1 className="auth-brand__title">Timsanbong</h1>
          <p className="auth-brand__sub">
            Khôi phục mật khẩu để truy cập lại tài khoản của bạn.
          </p>

          <ul className="auth-brand__features">
            <li>
              <span className="auth-feat-dot" />
              Nhập email đã đăng ký
            </li>
            <li>
              <span className="auth-feat-dot" />
              Kiểm tra hộp thư để nhận liên kết đặt lại
            </li>
            <li>
              <span className="auth-feat-dot" />
              Đặt mật khẩu mới và đăng nhập lại
            </li>
          </ul>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {sent ? (
            /* ── Success State ── */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="auth-form-card__title" style={{ marginBottom: '8px' }}>Email đã được gửi!</h2>
              <p className="text-sm text-gray-500 mb-6" style={{ maxWidth: '320px', margin: '0 auto' }}>
                Chúng tôi đã gửi liên kết khôi phục mật khẩu đến <strong className="text-[#1a202c]">{email}</strong>. Vui lòng kiểm tra hộp thư (cả mục spam).
              </p>
              <Link
                to="/dang-nhap"
                className="auth-btn-primary"
                style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <h2 className="auth-form-card__title">Quên mật khẩu?</h2>
              <p className="auth-form-card__sub">
                Nhớ mật khẩu rồi?{' '}
                <Link to="/dang-nhap" className="auth-link">
                  Đăng nhập
                </Link>
              </p>

              <form id="forgot-password-form" onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* Email */}
                <div className="auth-field">
                  <label htmlFor="forgot-email" className="auth-label">
                    Email đã đăng ký
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ban@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`auth-input ${error && !email.trim() ? 'auth-input--error' : ''}`}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div id="forgot-error" className="auth-error" role="alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="auth-btn-primary"
                >
                  {loading ? <span className="auth-spinner" /> : 'Gửi email khôi phục'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
