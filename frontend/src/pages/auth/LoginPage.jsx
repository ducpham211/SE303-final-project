import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import useAuthStore from '../../store/useAuthStore'

/**
 * Login page — /dang-nhap
 * Design: full-screen split layout with brand panel + form panel.
 * Follows Timsanbong design standards (flat, pill inputs, #60D86E primary).
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }

    setLoading(true)
    try {
      const data = await authService.login(email, password)
      if (data.accessToken) {
        login(data.accessToken)
        navigate('/')
      } else {
        setError(data.message || 'Đăng nhập thất bại.')
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Email hoặc mật khẩu không đúng.'
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
            Đặt sân bóng — tìm đối thủ — kết nối cộng đồng thể thao.
          </p>

          <ul className="auth-brand__features">
            <li>
              <span className="auth-feat-dot" />
              Đặt sân bóng online trong 60 giây
            </li>
            <li>
              <span className="auth-feat-dot" />
              Tìm đối thủ theo khu vực & trình độ
            </li>
            <li>
              <span className="auth-feat-dot" />
              Quản lý lịch đặt ngay trên điện thoại
            </li>
          </ul>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2 className="auth-form-card__title">Chào mừng trở lại</h2>
          <p className="auth-form-card__sub">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>

          <form id="login-form" onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`auth-input ${error && !email ? 'auth-input--error' : ''}`}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">
                Mật khẩu
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`auth-input auth-input--pass ${error && !password ? 'auth-input--error' : ''}`}
                />
                <button
                  type="button"
                  id="login-toggle-pass"
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

            {/* Error */}
            {error && (
              <div id="login-error" className="auth-error" role="alert">
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
              id="login-submit"
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? <span className="auth-spinner" /> : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
