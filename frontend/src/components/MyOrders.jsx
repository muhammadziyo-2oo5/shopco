import React, { useState, useEffect } from 'react';

export default function MyOrders({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const allOrders = await res.json();
      const myOrders = allOrders.filter((o) => o.customer_name === user.full_name);
      setOrders(myOrders);
    } catch (e) {
      console.error(e);
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

  return (
    <section id="tab-myorders" className="tab-pane">
      <div className="data-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Buyurtma ID</th>
                <th>Sana</th>
                <th>Summa</th>
                <th>Holati</th>
                <th>Mahsulotlar</th>
                <th>Harakat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
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
                    <td>{new Date(o.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
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
                      <span className={`badge ${getBadgeClass(o.status)}`}>{o.status}</span>
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    Hozircha buyurtmalaringiz yo'q
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
