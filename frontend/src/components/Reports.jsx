import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const stats = await res.json();
      
      const ordersRes = await fetch('/api/orders');
      const orders = await ordersRes.json();

      let maxSale = 0;
      let totalAmount = 0;
      orders.forEach((o) => {
        totalAmount += o.total_amount;
        if (o.total_amount > maxSale) maxSale = o.total_amount;
      });

      const avgCart = orders.length > 0 ? totalAmount / orders.length : 0;
      setReports({
        avgCart,
        maxSale,
        stats
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!reports) return <div style={{ color: 'var(--text-secondary)', padding: 20 }}>Yuklanmoqda...</div>;

  const barData = {
    labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    datasets: [{
      label: 'Oylik daromad (UZS)',
      data: [12000000, 15000000, 18000000, 22000000, 31000000, reports.stats.total_sales, 0, 0, 0, 0, 0, 0],
      backgroundColor: '#c9a84c',
      borderRadius: 4
    }]
  };

  const barOptions = {
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

  return (
    <section id="tab-reports" className="tab-pane">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-sales">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-title">O'rtacha Chek Summasi</span>
            <h3 className="kpi-value">{new Intl.NumberFormat('uz-UZ').format(reports.avgCart) + ' UZS'}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon icon-customers">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Maksimal Savdo</span>
            <h3 className="kpi-value">{new Intl.NumberFormat('uz-UZ').format(reports.maxSale) + ' UZS'}</h3>
          </div>
        </div>
      </div>
      <div className="dashboard-charts mt-4">
        <div className="chart-card card-large" style={{ gridColumn: '1 / -1' }}>
          <h3>Yillik Savdo Hisoboti</h3>
          <div className="chart-wrapper" style={{ height: 350 }}>
            <Bar options={barOptions} data={barData} />
          </div>
        </div>
      </div>
    </section>
  );
}
