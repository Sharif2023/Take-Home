import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Lock, Mail, Eye, EyeOff, Loader } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? '/admin/products' : '/products'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form.email, form.password);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span>🛒</span>
        </div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-sub">Sign in to access the admin dashboard</p>

        {error && (
          <div className="form-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="login-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input with-icon"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="form-input with-icon with-icon-right"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full login-submit" disabled={loading}>
            {loading ? (
              <><Loader size={16} className="spin" /> Signing in…</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>


      </div>
    </main>
  );
}
