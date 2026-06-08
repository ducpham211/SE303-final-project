import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import authService from '../../services/authService'

/**
 * Reset password page — /dat-lai-mat-khau
 * Handles the redirect from Supabase recovery email.
 * Parses the access_token from the URL hash.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Parse the hash: #access_token=...&refresh_token=...&type=recovery
    const hash = location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)) // remove '#'
      const token = params.get('access_token')
      const type = params.get('type')
      
      if (token && type === 'recovery') {
        setAccessToken(token)
      } else {
        setError('Liên kết khôi phục không hợp lệ hoặc đã hết hạn.')
      }
    } else {
      setError('Không tìm thấy token khôi phục trong URL.')
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!accessToken) {
      setError('Không có quyền thực hiện thao tác này.')
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
      await authService.resetPassword(accessToken, password)
      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        'Không thể đặt lại mật khẩu. Vui lòng thử lại.'
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
            Tạo mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {success ? (
            /* ── Success State ── */
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
            /* ── Form State ── */
            <>
              <h2 className="auth-form-card__title">Đặt lại mật khẩu</h2>
              <p className="auth-form-card__sub">
                Vui lòng nhập mật khẩu mới.
              </p>

              <form id="reset-password-form" onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* New Password */}
                <div className="auth-field">
                  <label htmlFor="reset-password" className="auth-label">
                    Mật khẩu mới
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`auth-input ${error ? 'auth-input--error' : ''}`}
                    disabled={!accessToken || loading}
                  />
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                  <label htmlFor="confirm-password" className="auth-label">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`auth-input ${error ? 'auth-input--error' : ''}`}
                    disabled={!accessToken || loading}
                  />
                </div>

                {/* Error */}
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

                {/* Submit */}
                <button
                  id="reset-submit"
                  type="submit"
                  disabled={loading || !accessToken}
                  className="auth-btn-primary"
                >
                  {loading ? <span className="auth-spinner" /> : 'Lưu mật khẩu mới'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
