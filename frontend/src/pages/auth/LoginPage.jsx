import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Sai định dạng email!';
    }
    if (!form.password) {
      errors.password = 'Vui lòng nhập mật khẩu!';
    } else if (form.password.length < 6) {
      errors.password = 'Mật khẩu phải chứa ít nhất 6 kí tự!';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      const user = await login(form);
      const roleRoutes = {
        PLAYER: '/player',
        OWNER: '/owner',
        ADMIN: '/admin',
      };
      navigate(roleRoutes[user.role] || '/');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--bg)] transition-colors duration-300">
      {/* Decorative background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.07] blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.05] blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] mb-4 shadow-lg">
            <svg className="w-8 h-8 text-[var(--accent)]" width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-h)] tracking-tight">
            XIN CHÀO
          </h1>
          <p className="mt-2 text-sm text-[var(--text)]">
            Đăng nhập vào tài khoản của bạn
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative backdrop-blur-xl bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-card space-y-5"
        >
          {/* API Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-[fadeIn_0.2s_ease-out]">
              <svg className="w-4 h-4 shrink-0" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-h)]">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[var(--text)]" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--code-bg)] border text-[var(--text-h)] placeholder-[var(--text)] text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-border)] focus:border-[var(--accent-border)] ${
                  validationErrors.email
                    ? 'border-red-500/60'
                    : 'border-[var(--border)]'
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-xs text-red-400 mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-h)]">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[var(--text)]" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl bg-[var(--code-bg)] border text-[var(--text-h)] placeholder-[var(--text)] text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-border)] focus:border-[var(--accent-border)] ${
                  validationErrors.password
                    ? 'border-red-500/60'
                    : 'border-[var(--border)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-xs text-red-400 mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text)]">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--code-bg)] text-[var(--accent)] focus:ring-[var(--accent-border)] focus:ring-offset-0"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              to="/forgot-password"
              className="text-[var(--accent)] hover:underline hover:underline-offset-2 transition-all"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-[var(--accent)] hover:opacity-90 focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--text)] mt-6">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-[var(--accent)] font-medium hover:underline hover:underline-offset-2 transition-all"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
