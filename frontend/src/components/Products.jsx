import React, { useState, useEffect } from 'react';

export default function Products({ onOpenModal, triggerReload, setTriggerReload }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [triggerReload]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Rostdan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchProducts();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <section id="tab-products" className="tab-pane">
      <div className="action-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Mahsulotlarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Barcha kategoriyalar</option>
            <option value="Kostyumlar">Kostyumlar</option>
            <option value="Futbolkalar">Futbolkalar</option>
            <option value="Shimlar">Shimlar</option>
            <option value="Ko'ylaklar">Ko'ylaklar</option>
            <option value="Poyabzallar">Poyabzallar</option>
            <option value="Kurtkalar">Kurtkalar</option>
          </select>
          <button className="btn btn-primary" onClick={() => onOpenModal(null)}>
            <i className="fa-solid fa-plus"></i> Yangi mahsulot
          </button>
        </div>
      </div>

      <div className="product-grid">
        {filtered.map((p) => (
          <div className="product-card" key={p.id}>
            <img src={p.image_url} className="product-img" alt={p.name} />
            <div className="product-info">
              <div className="p-meta">
                <span className="p-cat">{p.category}</span>
                <span className={`p-stock ${p.stock <= 5 ? 'low' : 'ok'}`}>
                  {p.stock <= 5 ? `Kam qoldi: ${p.stock} ta` : `Omborda: ${p.stock} ta`}
                </span>
              </div>
              <h4 className="p-name" title={p.name}>
                {p.name}
              </h4>
              <div className="p-price">
                {new Intl.NumberFormat('uz-UZ').format(p.price) + ' UZS'}
              </div>
              <div className="p-actions">
                <button className="btn btn-outline btn-block btn-sm" onClick={() => onOpenModal(p)}>
                  <i className="fa-solid fa-pen"></i> Tahrirlash
                </button>
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(p.id)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Mahsulot topilmadi
          </div>
        )}
      </div>
    </section>
  );
}
