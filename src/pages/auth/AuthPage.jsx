import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

import { useAuth } from '../../context/useAuth';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(
          form.email,
          form.password,
        );

        if (user?.roleCode === 'COMPANY_ADMIN') {
          navigate('/company');
        } else {
          navigate('/');
        }

        return;
      }

      await register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone,
      });

      setMode('login');
      setError(
        'Đăng ký thành công. Vui lòng đăng nhập.',
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="section-eyebrow">
            SMART TRAVEL SYSTEM
          </span>

          <h1>
            {mode === 'login'
              ? 'Đăng nhập'
              : 'Tạo tài khoản'}
          </h1>

          <p>
            {mode === 'login'
              ? 'Đăng nhập để tiếp tục hành trình của bạn.'
              : 'Tạo tài khoản khách hàng mới.'}
          </p>
        </div>

        {error && (
          <div className="auth-message">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {mode === 'register' && (
            <>
              <label>
                Họ và tên
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={loading}
          >
            {mode === 'login' ? (
              <LogIn size={17} />
            ) : (
              <UserPlus size={17} />
            )}

            {loading
              ? 'Đang xử lý...'
              : mode === 'login'
                ? 'Đăng nhập'
                : 'Đăng ký'}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(
              mode === 'login'
                ? 'register'
                : 'login',
            );
            setError('');
          }}
        >
          {mode === 'login'
            ? 'Chưa có tài khoản? Đăng ký'
            : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </section>
    </main>
  );
}
