import React, { useState } from 'react';

export default function Auth({ initialMode = 'login', onAuthSuccess, onBackToHome }) {
  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', username: '', password: '' });
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Noma\'lum xatolik yuz berdi');
      }
    } catch (err) {
      setError('Serverga ulanib bo\'lmadi');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: registerForm.fullName,
          username: registerForm.username,
          password: registerForm.password
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    } catch (err) {
      setError('Serverga ulanib bo\'lmadi');
    }
  };

  return (
    <div id="auth-screen" className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <i className="fa-solid fa-globe"></i>
            <span>Shop<span>Co</span></span>
          </div>
          <h3>B2B Portal Access</h3>
          <p>Manage wholesale catalog, bulk orders, and tracking</p>
        </div>

        {mode === 'login' ? (
          <div id="login-view-container">
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label htmlFor="username"><i className="fa-solid fa-user"></i> Login</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Loginni kiriting"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="password"><i className="fa-solid fa-lock"></i> Parol</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Parolni kiriting"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">
                Access Portal <i className="fa-solid fa-arrow-right"></i>
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Hisobingiz yo'qmi?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('register');
                    setError('');
                  }}
                  style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Ro'yxatdan o'tish
                </a>
              </div>

              <button type="button" className="btn btn-secondary btn-block mt-3" onClick={onBackToHome}>
                <i className="fa-solid fa-arrow-left"></i> Orqaga qaytish
              </button>
            </form>
          </div>
        ) : (
          <div id="register-view-container">
            <form onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label htmlFor="reg-fullname"><i className="fa-solid fa-address-card"></i> Ism-Familiya *</label>
                <input
                  type="text"
                  id="reg-fullname"
                  placeholder="To'liq ismingizni kiriting"
                  required
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="reg-username"><i className="fa-solid fa-user"></i> Login (Foydalanuvchi nomi) *</label>
                <input
                  type="text"
                  id="reg-username"
                  placeholder="Login yarating"
                  required
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="reg-password"><i className="fa-solid fa-lock"></i> Parol *</label>
                <input
                  type="password"
                  id="reg-password"
                  placeholder="Parol yarating"
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" className="btn btn-accent btn-block" style={{ color: '#0b0f19' }}>
                Ro'yxatdan o'tish <i className="fa-solid fa-user-plus"></i>
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Hisobingiz bormi?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('login');
                    setError('');
                  }}
                  style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Tizimga kirish
                </a>
              </div>

              <button type="button" className="btn btn-secondary btn-block mt-3" onClick={onBackToHome}>
                <i className="fa-solid fa-arrow-left"></i> Orqaga qaytish
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
