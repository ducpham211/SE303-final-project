import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import useAuthStore from '../../store/useAuthStore'

/**
 * Register page — /dang-ky
 * Same split-panel layout as LoginPage.
 * Auth flow: POST /api/auth/register → { email, password }
 */
export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  const handleSendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email trước khi gửi OTP.')
      return
    }
    setSendingOtp(true)
    setError('')
    setSuccess('')
    try {
      await authService.sendRegisterOtp(email.trim())
      setOtpSent(true)
      setSuccess('Mã OTP đã được gửi đến email của bạn.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim() || !email || !password || !confirmPassword || !otp) {
      setError('Vui lòng nhập đầy đủ các thông tin bắt buộc (bao gồm OTP).')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    setLoading(true)
    try {
      const data = await authService.register(email, password, fullName.trim(), otp)
      // Backend returns success message; token may be null if email verification is required
      if (data.accessToken) {
        login(data.accessToken)
        navigate('/')
      } else {
        setSuccess(
          data.message || 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...'
        )
        // Redirect to login page after a brief delay so user sees the success message
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.'
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
            Tạo tài khoản miễn phí và bắt đầu hành trình thể thao của bạn.
          </p>

          <ul className="auth-brand__features">
            <li>
              <span className="auth-feat-dot" />
              Đăng ký nhanh chóng — chỉ cần email
            </li>
            <li>
              <span className="auth-feat-dot" />
              Đặt sân, tạo kèo đấu ngay sau khi đăng ký
            </li>
            <li>
              <span className="auth-feat-dot" />
              Hoàn toàn miễn phí cho người chơi
            </li>
          </ul>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2 className="auth-form-card__title">Tạo tài khoản</h2>
          <p className="auth-form-card__sub">
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </p>

          <form id="register-form" onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="auth-field">
              <label htmlFor="reg-fullname" className="auth-label">
                Họ và tên
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`auth-input ${error && !fullName.trim() ? 'auth-input--error' : ''}`}
              />
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email" className="auth-label">
                Email
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ban@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`auth-input ${error && !email ? 'auth-input--error' : ''}`}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="auth-btn-primary"
                  style={{ whiteSpace: 'nowrap', padding: '0 16px', width: 'auto', marginTop: 0 }}
                >
                  {sendingOtp ? 'Đang gửi...' : (otpSent ? 'Gửi lại OTP' : 'Gửi OTP')}
                </button>
              </div>
            </div>

            {/* OTP */}
            {otpSent && (
              <div className="auth-field">
                <label htmlFor="reg-otp" className="auth-label">
                  Mã OTP
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  required
                  placeholder="Nhập mã OTP 6 số từ email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`auth-input ${error && !otp ? 'auth-input--error' : ''}`}
                  maxLength={6}
                />
              </div>
            )}

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="reg-password" className="auth-label">
                Mật khẩu
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`auth-input auth-input--pass ${error && !password ? 'auth-input--error' : ''}`}
                />
                <button
                  type="button"
                  id="reg-toggle-pass"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="reg-confirm" className="auth-label">
                Xác nhận mật khẩu
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`auth-input auth-input--pass ${error && !confirmPassword ? 'auth-input--error' : ''}`}
                />
                <button
                  type="button"
                  id="reg-toggle-confirm"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="auth-strength">
                <div className={`auth-strength__bar ${password.length >= 8 ? 'auth-strength__bar--strong' : password.length >= 6 ? 'auth-strength__bar--ok' : 'auth-strength__bar--weak'}`} />
                <span className="auth-strength__label">
                  {password.length >= 8 ? 'Mạnh' : password.length >= 6 ? 'Trung bình' : 'Yếu'}
                </span>
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div id="reg-error" className="auth-error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div id="reg-success" className="auth-success" role="status">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? <span className="auth-spinner" /> : 'Tạo tài khoản'}
            </button>

            <p className="auth-terms">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link to="/terms-of-service" className="auth-link">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link to="/privacy-policy" className="auth-link">
                Chính sách bảo mật
              </Link>{' '}
              của chúng tôi.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
