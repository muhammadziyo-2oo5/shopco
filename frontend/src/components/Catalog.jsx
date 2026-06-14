import React, { useState, useEffect } from 'react';

export default function Catalog({ user, onCheckoutSuccess }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('default');
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });

  // Size/Color selection states for cards
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        setCouponMsg({ text: `${data.discount_percent}% chegirma qo'llanildi`, isError: false });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ text: data.error || 'Xato kupon', isError: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) return;
    const option = selectedOptions[product.id] || {
      size: product.sizes ? product.sizes.split(',')[0].trim() : '-',
      color: product.colors ? product.colors.split(',')[0].trim() : '-',
      qty: 1
    };

    const qty = parseInt(option.qty);
    if (isNaN(qty) || qty < 1) {
      alert("Iltimos, to'g'ri miqdorni kiriting");
      return;
    }
    if (qty > product.stock) {
      alert(`Omborda faqat ${product.stock} ta tovar mavjud!`);
      return;
    }

    const existingIdx = cart.findIndex(
      (item) => item.id === product.id && item.size === option.size && item.color === option.color
    );

    if (existingIdx > -1) {
      const newCart = [...cart];
      if (newCart[existingIdx].quantity + qty > product.stock) {
        alert(`Ombordagi cheklovdan ko'p tovar qo'shib bo'lmaydi. Savatda allaqachon ${newCart[existingIdx].quantity} ta bor.`);
        return;
      }
      newCart[existingIdx].quantity += qty;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          size: option.size,
          color: option.color,
          quantity: qty,
          stock: product.stock
        }
      ]);
    }
  };

  const updateCartQty = (idx, delta) => {
    const newCart = [...cart];
    const item = newCart[idx];
    if (item.quantity + delta > item.stock) {
      alert(`Kechirasiz, omborda faqat ${item.stock} ta tovar bor!`);
      return;
    }
    item.quantity += delta;
    if (item.quantity <= 0) {
      newCart.splice(idx, 1);
    }
    setCart(newCart);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Savat bo'sh. Tovar tanlang!");
      return;
    }

    let customerId = 1;
    try {
      const clientsRes = await fetch('/api/customers');
      if (clientsRes.ok) {
        const clients = await clientsRes.json();
        const matches = clients.find((c) => c.full_name === user.full_name);
        if (matches) {
          customerId = matches.id;
        } else {
          const makeCust = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: user.full_name, phone: '+998990001122', email: user.username + '@shopco.com' })
          });
          if (makeCust.ok) {
            const newCust = await makeCust.json();
            customerId = newCust.id;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const discount = appliedCoupon ? (subtotal * appliedCoupon.discount_percent) / 100 : 0;

    const payload = {
      customer_id: customerId,
      items: cart,
      total_amount: subtotal - discount,
      coupon_code: appliedCoupon ? appliedCoupon.code : '',
      discount_amount: discount
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Rahmat! Buyurtmangiz qabul qilindi.');
        setCart([]);
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMsg({ text: '', isError: false });
        onCheckoutSuccess();
      } else {
        const errData = await res.json();
        alert('Xatolik: ' + (errData.error || 'Noma\'lum xatolik'));
      }
    } catch (e) {
      console.error(e);
      alert('Server bilan ulanish xatoligi.');
    }
  };

  // Sorting and filtering
  let filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || p.category === category;
    return matchesSearch && matchesCat;
  });

  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'uz'));
  }

  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount_percent) / 100 : 0;
  const grandTotal = subtotal - discount;

  const handleOptionChange = (prodId, key, value) => {
    const prev = selectedOptions[prodId] || {
      size: products.find(p => p.id === prodId).sizes?.split(',')[0].trim() || '-',
      color: products.find(p => p.id === prodId).colors?.split(',')[0].trim() || '-',
      qty: 1
    };
    setSelectedOptions({
      ...selectedOptions,
      [prodId]: { ...prev, [key]: value }
    });
  };

  return (
    <section id="tab-catalog" className="tab-pane active">
      <div className="catalog-layout-grid">
        {/* Left Catalog items grid */}
        <div className="catalog-items-container">
          <div className="action-bar">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Katalogdan qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Barcha bo'limlar</option>
                <option value="Kostyumlar">Kostyumlar</option>
                <option value="Futbolkalar">Futbolkalar</option>
                <option value="Shimlar">Shimlar</option>
                <option value="Ko'ylaklar">Ko'ylaklar</option>
                <option value="Poyabzallar">Poyabzallar</option>
                <option value="Kurtkalar">Kurtkalar</option>
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Saralash: Standart</option>
                <option value="price-asc">Narx: Arzonroqlaridan</option>
                <option value="price-desc">Narx: Qimmatroqlaridan</option>
                <option value="name-asc">Nomi bo'yicha: A-Z</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {filtered.map((p) => {
              const opt = selectedOptions[p.id] || {
                size: p.sizes ? p.sizes.split(',')[0].trim() : '-',
                color: p.colors ? p.colors.split(',')[0].trim() : '-',
                qty: 1
              };

              return (
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

                    <div className="product-options mt-2">
                      <div className="option-select-group">
                        <label>O'lcham:</label>
                        <select
                          disabled={p.stock === 0}
                          value={opt.size}
                          onChange={(e) => handleOptionChange(p.id, 'size', e.target.value)}
                        >
                          {p.sizes ? (
                            p.sizes.split(',').map((s) => (
                              <option key={s} value={s.trim()}>
                                {s.trim()}
                              </option>
                            ))
                          ) : (
                            <option value="-">-</option>
                          )}
                        </select>
                      </div>
                      <div className="option-select-group mt-1">
                        <label>Rang:</label>
                        <select
                          disabled={p.stock === 0}
                          value={opt.color}
                          onChange={(e) => handleOptionChange(p.id, 'color', e.target.value)}
                        >
                          {p.colors ? (
                            p.colors.split(',').map((c) => (
                              <option key={c} value={c.trim()}>
                                {c.trim()}
                              </option>
                            ))
                          ) : (
                            <option value="-">-</option>
                          )}
                        </select>
                      </div>
                      <div className="option-select-group mt-1">
                        <label>Soni:</label>
                        <input
                          type="number"
                          value={opt.qty}
                          min="1"
                          max={p.stock}
                          disabled={p.stock === 0}
                          onChange={(e) => handleOptionChange(p.id, 'qty', e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      className="btn btn-accent btn-block btn-sm mt-2"
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stock === 0}
                      style={{ color: '#0b0f19', fontWeight: 600 }}
                    >
                      {p.stock === 0 ? 'Tugagan' : 'Savatga Qo\'shish'} <i className="fa-solid fa-basket-shopping"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Shopping Cart Sidebar */}
        <aside className="catalog-cart-sidebar">
          <h3>Xarid Savati</h3>
          <div className="cart-items-list">
            {cart.map((it, idx) => (
              <div key={idx} className="cart-item-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 8, marginBottom: 8 }}>
                <div className="cart-item-info">
                  <span className="cart-item-name" title={it.name}>
                    {it.name}
                  </span>
                  <span className="cart-item-variation" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    O'lcham: {it.size} | Rang: {it.color}
                  </span>
                  <span className="cart-item-price" style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                    {new Intl.NumberFormat('uz-UZ').format(it.price) + ' UZS'}
                  </span>
                </div>
                <div className="cart-item-actions">
                  <button className="qty-btn" onClick={() => updateCartQty(idx, -1)}>
                    -
                  </button>
                  <span className="qty-val">{it.quantity}</span>
                  <button className="qty-btn" onClick={() => updateCartQty(idx, 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                Savat bo'sh
              </div>
            )}
          </div>

          <div className="cart-coupon-section mt-3">
            <label>Promokod</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
              <input
                type="text"
                placeholder="Masalan: SHOPCO10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flexGrow: 1, padding: 8 }}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleApplyCoupon}>
                Apply
              </button>
            </div>
            {couponMsg.text && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'block',
                  marginTop: 4,
                  color: couponMsg.isError ? 'var(--color-danger)' : 'var(--color-success)'
                }}
              >
                {couponMsg.text}
              </span>
            )}
          </div>

          <div className="cart-summary-box mt-3">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{new Intl.NumberFormat('uz-UZ').format(subtotal) + ' UZS'}</span>
            </div>
            {appliedCoupon && (
              <div className="summary-row text-success">
                <span>Discount:</span>
                <span>-{new Intl.NumberFormat('uz-UZ').format(discount) + ' UZS'}</span>
              </div>
            )}
            <div className="summary-row total-row mt-2">
              <span>Jami Summa:</span>
              <span>{new Intl.NumberFormat('uz-UZ').format(grandTotal) + ' UZS'}</span>
            </div>
          </div>

          <button className="btn btn-accent btn-block mt-3" onClick={handleCheckout} style={{ color: '#0b0f19', fontWeight: 600 }}>
            Buyurtma berish <i className="fa-solid fa-cash-register"></i>
          </button>
        </aside>
      </div>
    </section>
  );
}
