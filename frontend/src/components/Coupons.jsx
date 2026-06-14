import React, { useState, useEffect } from 'react';

export default function Coupons({ onOpenModal, triggerReload }) {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetchCoupons();
  }, [triggerReload]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section id="tab-coupons" className="tab-pane">
      <div className="action-bar">
        <h3 style={{ fontWeight: 600 }}>Chegirma va Promokodlar</h3>
        <button className="btn btn-primary" onClick={onOpenModal}>
          <i className="fa-solid fa-plus"></i> Yangi Kupon
        </button>
      </div>
      <div className="data-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kupon kodi</th>
                <th>Chegirma foizi</th>
                <th>Holati</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>
                    <strong style={{ color: 'var(--color-primary)' }}>{c.code}</strong>
                  </td>
                  <td>
                    <strong>{c.discount_percent}%</strong>
                  </td>
                  <td>
                    <span className={`badge ${c.active ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {c.active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    Kuponlar topilmadi
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
