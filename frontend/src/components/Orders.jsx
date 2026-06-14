import React, { useState, useEffect } from 'react';

export default function Orders({ onOpenModal, triggerReload }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [triggerReload]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printOrderInvoice = (order) => {
    let items = [];
    try {
      items = JSON.parse(order.items);
    } catch (e) {}

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kvitansiya #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
            .details { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SHOPCO CRM INVOICE</h2>
            <p>Kiyim-kechak do'koni</p>
          </div>
          <div class="details">
            <p><strong>Buyurtma ID:</strong> #${order.id}</p>
            <p><strong>Mijoz:</strong> ${order.customer_name}</p>
            <p><strong>Sana:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Holat:</strong> ${order.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mahsulot</th>
                <th>Narx</th>
                <th>Soni</th>
                <th>Jami</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => `
                <tr>
                  <td>
                    ${it.name}
                    ${it.size && it.size !== '-' ? `<br><small style="color:#666; font-size:0.8rem;">O'lcham: ${it.size} | Rang: ${it.color}</small>` : ''}
                  </td>
                  <td>${it.price.toLocaleString()} UZS</td>
                  <td>${it.quantity} ta</td>
                  <td>${(it.price * it.quantity).toLocaleString()} UZS</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${order.coupon_code ? `<div style="text-align:right; margin-top:15px; color:#10B981;">Kupon chegirmasi (${order.coupon_code}): -${order.discount_amount.toLocaleString()} UZS</div>` : ''}
          <div class="total">
            Jami summa: ${order.total_amount.toLocaleString()} UZS
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Kutilmoqda': return 'badge-pending';
      case "Yo'lda": return 'badge-shipping';
      case 'Yetkazildi': return 'badge-delivered';
      case 'Bekor qilindi': return 'badge-cancelled';
      default: return '';
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
  );

  return (
    <section id="tab-orders" className="tab-pane">
      <div className="action-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buyurtmalarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={onOpenModal}>
          <i className="fa-solid fa-plus"></i> Yangi buyurtma yaratish
        </button>
      </div>

      <div className="data-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Buyurtma ID</th>
                <th>Mijoz</th>
                <th>Sanasi</th>
                <th>Summasi</th>
                <th>Holati</th>
                <th>Mahsulotlar</th>
                <th>Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                let itemsList = [];
                try {
                  itemsList = JSON.parse(o.items);
                } catch (e) {}

                const itemsDisplay = itemsList
                  .map((it) => `${it.name}${it.size && it.size !== '-' ? ` (${it.size}/${it.color})` : ''} (${it.quantity} ta)`)
                  .join(', ');

                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>
                      <strong>{o.customer_name}</strong>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      {new Intl.NumberFormat('uz-UZ').format(o.total_amount) + ' UZS'}
                      {o.coupon_code && (
                        <>
                          <br />
                          <small style={{ color: 'var(--color-success)' }}>
                            Kupon: {o.coupon_code} (-{new Intl.NumberFormat('uz-UZ').format(o.discount_amount)} UZS)
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      <select
                        className={`badge ${getBadgeClass(o.status)}`}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{ padding: '2px 6px', borderRadius: 4 }}
                      >
                        <option value="Kutilmoqda">Kutilmoqda</option>
                        <option value="Yo'lda">Yo'lda</option>
                        <option value="Yetkazildi">Yetkazildi</option>
                        <option value="Bekor qilindi">Bekor qilindi</option>
                      </select>
                    </td>
                    <td
                      style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={itemsDisplay}
                    >
                      {itemsDisplay}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => printOrderInvoice(o)}>
                        <i className="fa-solid fa-print"></i> Kvitansiya
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    Buyurtma topilmadi
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
