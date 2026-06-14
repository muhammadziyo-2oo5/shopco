import React, { useState, useEffect } from 'react';

export default function Staff({ onOpenModal, triggerReload }) {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, [triggerReload]);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setStaff(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Ushbu xodimni tizimdan o'chirmoqchimisiz?")) {
      try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) fetchStaff();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <section id="tab-staff" className="tab-pane">
      <div className="action-bar">
        <h3 style={{ fontWeight: 600 }}>Do'kon Xodimlari</h3>
        <button className="btn btn-primary" onClick={onOpenModal}>
          <i className="fa-solid fa-user-plus"></i> Yangi xodim qo'shish
        </button>
      </div>
      <div className="data-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ism-familiya</th>
                <th>Foydalanuvchi nomi (Login)</th>
                <th>Lavozimi</th>
                <th>Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td>
                    <strong>{s.full_name}</strong>
                  </td>
                  <td>{s.username}</td>
                  <td>
                    <span className="p-cat">{s.role === 'admin' ? 'Administrator' : 'Foydalanuvchi (Xaridor)'}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      disabled={s.id === 1}
                      onClick={() => handleDelete(s.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    Xodimlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
