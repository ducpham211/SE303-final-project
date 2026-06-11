import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import authService from '../../services/authService'

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    // Check if there is an access token in the URL hash (from Supabase recovery link)
    const hash = window.location.hash
    const urlParams = new URLSearchParams(hash.replace('#', '?'))
    const token = urlParams.get('access_token')
    
    if (token) {
      setAccessToken(token)
    } else if (!email) {
      // If no token and no email in state, redirect back to forgot password
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!accessToken && !otp.trim()) {
      setError('Vui lòng nhập mã OTP.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)
    try {
      if (accessToken) {
        // Reset using Supabase token
        await authService.resetPassword(accessToken, password)
      } else {
        // Reset using Backend OTP
        await authService.resetPasswordOTP(email, otp.trim(), password)
      }
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        'Liên kết hoặc mã OTP không hợp lệ/đã hết hạn.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!email && !accessToken) return null;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand__inner">
          <div className="auth-logo">
            <span className="auth-logo__icon">T</span>
          </div>
          <h1 className="auth-brand__title">Timsanbong</h1>
          <p className="auth-brand__sub">
            Vui lòng nhập mật khẩu mới của bạn.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60D86E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="auth-form-card__title" style={{ marginBottom: '8px' }}>Thành công!</h2>
              <p className="text-sm text-gray-500 mb-6" style={{ maxWidth: '320px', margin: '0 auto' }}>
                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển về trang đăng nhập trong giây lát.
              </p>
              <Link
                to="/login"
                className="auth-btn-primary"
                style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <h2 className="auth-form-card__title">Đặt lại mật khẩu</h2>
              <p className="auth-form-card__sub">
                Đang đặt lại mật khẩu cho tài khoản của bạn.
              </p>

              <form id="reset-password-form" onSubmit={handleSubmit} className="auth-form" noValidate>
                {!accessToken && (
                  <div className="auth-field">
                    <label htmlFor="otp" className="auth-label">Mã OTP (6 số)</label>
                    <input
                      id="otp"
                      type="text"
                      required
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className={`auth-input ${error ? 'auth-input--error' : ''}`}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="reset-password" className="auth-label">Mật khẩu mới</label>
                  <input
                    id="reset-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`auth-input ${error ? 'auth-input--error' : ''}`}
                    disabled={loading}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-password" className="auth-label">Xác nhận mật khẩu mới</label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`auth-input ${error ? 'auth-input--error' : ''}`}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div id="reset-error" className="auth-error" role="alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  id="reset-submit"
                  type="submit"
                  disabled={loading}
                  className="auth-btn-primary"
                >
                  {loading ? <span className="auth-spinner" /> : 'Đổi mật khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
