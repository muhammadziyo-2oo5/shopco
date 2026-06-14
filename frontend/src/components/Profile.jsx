import React, { useState, useEffect } from 'react';

export default function Profile({ user, onProfileUpdate }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUsername(user.username || '');
      setPassword('');
      setSuccess(false);
      setError('');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    const payload = {
      full_name: fullName,
      username: username
    };

    if (password && password.trim() !== '') {
      if (password.length < 4) {
        setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak");
        return;
      }
      payload.password = password;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setPassword('');
        onProfileUpdate(data.user);
      } else {
        setError(data.error || 'Profilni saqlashda xatolik');
      }
    } catch (err) {
      setError('Serverga ulanish xatoligi');
    }
  };

  return (
    <section id="tab-profile" className="tab-pane">
      <div className="data-card" style={{ maxWidth: 600, margin: '0 auto', padding: 30 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
          <i className="fa-solid fa-address-card" style={{ color: 'var(--color-accent)', marginRight: 8 }}></i> Profil Ma'lumotlarini Tahrirlash
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="prof-fullname">To'liq ism-familiya *</label>
            <input
              type="text"
              id="prof-fullname"
              required
              placeholder="To'liq ismingiz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="prof-username">Foydalanuvchi nomi (Login) *</label>
            <input
              type="text"
              id="prof-username"
              required
              placeholder="Login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="prof-password">Yangi parol (O'zgartirmaslik uchun bo'sh qoldiring)</label>
            <input
              type="password"
              id="prof-password"
              placeholder="Kamida 4 ta belgi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {success && (
            <div className="text-success" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 15 }}>
              Profil muvaffaqiyatli saqlandi!
            </div>
          )}
          {error && <div className="error-msg" style={{ marginBottom: 15 }}>{error}</div>}
          <button type="submit" className="btn btn-accent btn-block" style={{ color: '#0b0f19', fontWeight: 600 }}>
            O'zgarishlarni Saqlash <i className="fa-solid fa-floppy-disk"></i>
          </button>
        </form>
      </div>
    </section>
  );
}
