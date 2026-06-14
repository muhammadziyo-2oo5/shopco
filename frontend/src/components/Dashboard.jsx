import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <div style={{ color: 'var(--text-secondary)', padding: 20 }}>Yuklanmoqda...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { family: 'Outfit' } } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
    }
  };

  const lineData = {
    labels: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
    datasets: [{
      label: 'Savdo hajmi (UZS)',
      data: [1200000, 1900000, 3000000, 5000000, 2300000, 4800000, stats.total_sales > 18000000 ? 8000000 : 3500000],
      borderColor: '#c9a84c',
      backgroundColor: 'rgba(201, 168, 76, 0.05)',
      fill: true,
      tension: 0.4
    }]
  };

  const doughnutData = {
    labels: stats.categories.map(c => c.category),
    datasets: [{
      data: stats.categories.map(c => c.count),
      backgroundColor: ['#c9a84c', '#4b5563', '#1e293b', '#374151', '#4b5563', '#1f2937']
    }]
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
    <section id="tab-dashboard" className="tab-pane">
      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-sales">
            <i className="fa-solid fa-coins"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Umumiy Savdo</span>
            <h3 className="kpi-value">{new Intl.NumberFormat('uz-UZ').format(stats.total_sales) + ' UZS'}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-orders">
            <i className="fa-solid fa-dolly"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Buyurtmalar</span>
            <h3 className="kpi-value">{stats.total_orders} ta</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-customers">
            <i className="fa-solid fa-user-group"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Faol Xaridorlar</span>
            <h3 className="kpi-value">{stats.active_customers} ta</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-stock">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Kam Qolgan Tovar</span>
            <h3 className="kpi-value">{stats.low_stock} ta</h3>
          </div>
        </div>
      </div>

      {/* Charts & Widgets */}
      <div className="dashboard-charts">
        <div className="chart-card card-large">
          <h3>Savdo Diagrammasi</h3>
          <div className="chart-wrapper">
            <Line options={chartOptions} data={lineData} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Kategoriyalar ulushi</h3>
          <div className="chart-wrapper" style={{ position: 'relative' }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#9CA3AF', font: { family: 'Outfit' } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity table */}
      <div className="data-card mt-4">
        <div className="card-header">
          <h3>So'nggi buyurtmalar</h3>
          <button className="btn btn-sm btn-outline" onClick={() => onNavigate('orders')}>
            Barcha buyurtmalar <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mijoz</th>
                <th>Sana</th>
                <th>Summa</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>{new Intl.NumberFormat('uz-UZ').format(order.total_amount) + ' UZS'}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
              {stats.recent_orders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    Hozircha buyurtmalar yo'q
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
