import React, { useState, useEffect } from 'react';

export default function Customers({ onOpenModal, triggerReload }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [triggerReload]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <section id="tab-customers" className="tab-pane">
      <div className="action-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Mijozlarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={onOpenModal}>
          <i className="fa-solid fa-user-plus"></i> Yangi mijoz
        </button>
      </div>

      <div className="data-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Mijoz ID</th>
                <th>Ism-familiya</th>
                <th>Telefon</th>
                <th>Elektron pochta</th>
                <th>Sotib olgan summasi</th>
                <th>Buyurtmalar soni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>
                    <strong>{c.full_name}</strong>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email || <span style={{ color: 'var(--text-muted)' }}>Kiritilmagan</span>}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                    {new Intl.NumberFormat('uz-UZ').format(c.total_spent) + ' UZS'}
                  </td>
                  <td>
                    <strong>{c.orders_count} ta</strong>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    Mijoz topilmadi
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
