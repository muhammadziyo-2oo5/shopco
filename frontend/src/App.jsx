import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Catalog from './components/Catalog';
import MyOrders from './components/MyOrders';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Reports from './components/Reports';
import Coupons from './components/Coupons';
import Staff from './components/Staff';
import Profile from './components/Profile';

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('loading'); // loading, landing, auth, app
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Trigger reload updates for admin lists
  const [reloadKey, setReloadKey] = useState(0);

  // Modals state
  const [modalState, setModalState] = useState({
    product: false,
    order: false,
    customer: false,
    coupon: false,
    staff: false
  });

  const [editingProduct, setEditingProduct] = useState(null);

  // Order Builder state
  const [orderItems, setOrderItems] = useState([]);
  const [orderCouponInput, setOrderCouponInput] = useState('');
  const [orderAppliedCoupon, setOrderAppliedCoupon] = useState(null);
  const [orderCouponMsg, setOrderCouponMsg] = useState({ text: '', isError: false });
  const [customersList, setCustomersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderProductQty, setOrderProductQty] = useState(1);

  // Modal forms states
  const [productForm, setProductForm] = useState({ name: '', category: 'Kostyumlar', price: 0, stock: 0, sizes: '', colors: '', image_url: '' });
  const [customerForm, setCustomerForm] = useState({ fullName: '', phone: '', email: '' });
  const [couponForm, setCouponForm] = useState({ code: '', percent: 15 });
  const [staffForm, setStaffForm] = useState({ fullName: '', username: '', password: '', role: 'user' });

  // Errors inside modals
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
        setActiveTab(data.user.role === 'admin' ? 'dashboard' : 'catalog');
        setScreen('app');
      } else {
        setScreen('landing');
      }
    } catch (err) {
      setScreen('landing');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setScreen('landing');
    } catch (err) {
      console.error(err);
    }
  };

  const openProductModal = (product = null) => {
    setModalError('');
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        sizes: product.sizes || '',
        colors: product.colors || '',
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', category: 'Kostyumlar', price: 0, stock: 0, sizes: '', colors: '', image_url: '' });
    }
    setModalState({ ...modalState, product: true });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          category: productForm.category,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          sizes: productForm.sizes,
          colors: productForm.colors,
          image_url: productForm.image_url
        })
      });
      if (res.ok) {
        setModalState({ ...modalState, product: false });
        setReloadKey(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openOrderModal = async () => {
    setOrderItems([]);
    setOrderAppliedCoupon(null);
    setOrderCouponInput('');
    setOrderCouponMsg({ text: '', isError: false });
    setModalState({ ...modalState, order: true });
    try {
      const cRes = await fetch('/api/customers');
      const cData = await cRes.json();
      setCustomersList(cData);
      if (cData.length > 0) setSelectedCustomerId(cData[0].id);

      const pRes = await fetch('/api/products');
      const pData = await pRes.json();
      const available = pData.filter(p => p.stock > 0);
      setProductsList(available);
      if (available.length > 0) setSelectedProductId(available[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const addProductToOrderList = () => {
    if (!selectedProductId) return;
    const qty = parseInt(orderProductQty);
    if (qty < 1) return;

    const prod = productsList.find(p => p.id === parseInt(selectedProductId));
    if (!prod) return;

    if (qty > prod.stock) {
      alert(`Omborda faqat ${prod.stock} ta mahsulot bor!`);
      return;
    }

    const existing = orderItems.find(it => it.id === prod.id);
    if (existing) {
      if (existing.quantity + qty > prod.stock) {
        alert(`Omborda jami faqat ${prod.stock} ta mahsulot bor!`);
        return;
      }
      setOrderItems(orderItems.map(it => it.id === prod.id ? { ...it, quantity: it.quantity + qty } : it));
    } else {
      setOrderItems([...orderItems, { id: prod.id, name: prod.name, price: prod.price, quantity: qty, stock: prod.stock }]);
    }
  };

  const checkOrderCoupon = async () => {
    if (!orderCouponInput.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: orderCouponInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderAppliedCoupon(data);
        setOrderCouponMsg({ text: `Kupon qo'llanildi: ${data.discount_percent}% chegirma`, isError: false });
      } else {
        setOrderAppliedCoupon(null);
        setOrderCouponMsg({ text: data.error || 'Kupon topilmadi', isError: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveOrder = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert("Kamida bitta mahsulot qo'shishingiz kerak");
      return;
    }
    const subtotal = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const discount = orderAppliedCoupon ? (subtotal * orderAppliedCoupon.discount_percent) / 100 : 0;

    const payload = {
      customer_id: parseInt(selectedCustomerId),
      items: orderItems,
      total_amount: subtotal - discount,
      coupon_code: orderAppliedCoupon ? orderAppliedCoupon.code : '',
      discount_amount: discount
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModalState({ ...modalState, order: false });
        setReloadKey(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: customerForm.fullName,
          phone: customerForm.phone,
          email: customerForm.email
        })
      });
      if (res.ok) {
        setModalState({ ...modalState, customer: false });
        setReloadKey(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveCoupon = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code,
          discount_percent: parseInt(couponForm.percent)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setModalState({ ...modalState, coupon: false });
        setReloadKey(prev => prev + 1);
      } else {
        setModalError(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      setModalError('Serverga ulanish xatoligi');
    }
  };

  const saveStaff = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: staffForm.fullName,
          username: staffForm.username,
          password: staffForm.password,
          role: staffForm.role
        })
      });
      const data = await res.json();
      if (res.ok) {
        setModalState({ ...modalState, staff: false });
        setReloadKey(prev => prev + 1);
      } else {
        setModalError(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      setModalError('Serverga ulanish xatoligi');
    }
  };

  if (screen === 'loading') {
    return <div className="glow-bg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-accent)' }}><h2>Yuklanmoqda...</h2></div>;
  }

  if (screen === 'landing') {
    return (
      <Landing
        onNavigate={(mode) => {
          setAuthMode(mode);
          setScreen('auth');
        }}
      />
    );
  }

  if (screen === 'auth') {
    return (
      <Auth
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setUser(user);
          setActiveTab(user.role === 'admin' ? 'dashboard' : 'catalog');
          setScreen('app');
        }}
        onBackToHome={() => setScreen('landing')}
      />
    );
  }

  const titles = {
    catalog: { title: 'Ulgurji Savdo Katalogi', subtitle: 'Mahsulotlarni tanlang va savat orqali buyurtma qiling' },
    myorders: { title: 'Mening Buyurtmalarim', subtitle: 'Hozirgacha joylashtirgan buyurtmalaringiz va ularning holati' },
    dashboard: { title: 'Boshqaruv Paneli', subtitle: 'Do\'koningizdagi umumiy holat va ko\'rsatkichlar' },
    products: { title: 'Mahsulotlar Ombori', subtitle: 'Kiyimlar ro\'yxati va inventarni boshqarish' },
    orders: { title: 'Buyurtmalar Jurnali', subtitle: 'Mijozlar buyurtmalarini boshqarish va nazorat qilish' },
    customers: { title: 'Mijozlar Bazasi', subtitle: 'Sodiq mijozlar va aloqa ma\'lumotlari' },
    reports: { title: 'Analitika va Hisobotlar', subtitle: 'Savdo ko\'rsatkichlari bo\'yicha chuqur tahlillar' },
    coupons: { title: 'Kuponlar boshqaruvi', subtitle: 'Do\'kon chegirma va promo-kodlarini sozlash' },
    staff: { title: 'Tizim xodimlari', subtitle: 'Do\'kon sotuvchilari va administratorlar ro\'yxati' },
    profile: { title: 'Profil Sozlamalari', subtitle: 'Shaxsiy ma\'lumotlaringiz va parolingizni yangilang' }
  };

  const currentTab = titles[activeTab] || { title: 'Boshqaruv Paneli', subtitle: 'Umumiy holat' };

  const subtotal = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const discount = orderAppliedCoupon ? (subtotal * orderAppliedCoupon.discount_percent) / 100 : 0;
  const grandTotal = subtotal - discount;

  return (
    <div id="app-container" className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <i className="fa-solid fa-globe"></i>
          <span>Shop<span>Co</span></span>
        </div>

        <nav className="sidebar-menu">
          {user.role === 'user' ? (
            <>
              <a href="#" className={`menu-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('catalog'); }}>
                <i className="fa-solid fa-tags"></i>
                <span>Katalog</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'myorders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('myorders'); }}>
                <i className="fa-solid fa-basket-shopping"></i>
                <span>Buyurtmalarim</span>
              </a>
            </>
          ) : (
            <>
              <a href="#" className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
                <i className="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'products' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}>
                <i className="fa-solid fa-shirt"></i>
                <span>Mahsulotlar</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Buyurtmalar</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('customers'); }}>
                <i className="fa-solid fa-users"></i>
                <span>Mijozlar</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}>
                <i className="fa-solid fa-chart-line"></i>
                <span>Hisobotlar</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('coupons'); }}>
                <i className="fa-solid fa-ticket"></i>
                <span>Kuponlar</span>
              </a>
              <a href="#" className={`menu-item ${activeTab === 'staff' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('staff'); }}>
                <i className="fa-solid fa-user-gear"></i>
                <span>Xodimlar</span>
              </a>
            </>
          )}
          <a href="#" className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
            <i className="fa-solid fa-address-card"></i>
            <span>Profil</span>
          </a>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-role">{user.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}</span>
          </div>
          <button id="btn-logout" title="Chiqish" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main-content">
        {/* Top header bar */}
        <header className="top-bar">
          <div className="welcome-text">
            <h2>{currentTab.title}</h2>
            <p>{currentTab.subtitle}</p>
          </div>
          <div className="top-bar-actions">
            <div className="store-badge">
              <span className="indicator online"></span>
              System Live
            </div>
          </div>
        </header>

        <div id="tab-content-area">
          {activeTab === 'catalog' && <Catalog user={user} onCheckoutSuccess={() => setActiveTab('myorders')} />}
          {activeTab === 'myorders' && <MyOrders user={user} />}
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'products' && (
            <Products
              onOpenModal={(prod) => openProductModal(prod)}
              triggerReload={reloadKey}
            />
          )}
          {activeTab === 'orders' && <Orders onOpenModal={openOrderModal} triggerReload={reloadKey} />}
          {activeTab === 'customers' && (
            <Customers
              onOpenModal={() => {
                setCustomerForm({ fullName: '', phone: '', email: '' });
                setModalState({ ...modalState, customer: true });
              }}
              triggerReload={reloadKey}
            />
          )}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'coupons' && (
            <Coupons
              onOpenModal={() => {
                setCouponForm({ code: '', percent: 15 });
                setModalError('');
                setModalState({ ...modalState, coupon: true });
              }}
              triggerReload={reloadKey}
            />
          )}
          {activeTab === 'staff' && (
            <Staff
              onOpenModal={() => {
                setStaffForm({ fullName: '', username: '', password: '', role: 'user' });
                setModalError('');
                setModalState({ ...modalState, staff: true });
              }}
              triggerReload={reloadKey}
            />
          )}
          {activeTab === 'profile' && <Profile user={user} onProfileUpdate={(updated) => setUser(updated)} />}
        </div>
      </main>

      {/* GLOBAL MODALS INJECTED AND MANAGED BY REACT STATE */}

      {/* PRODUCT MODAL */}
      {modalState.product && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
              <button className="close-modal" onClick={() => setModalState({ ...modalState, product: false })}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={saveProduct}>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="p-name">Mahsulot nomi *</label>
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Masalan: Erkaklar kostyumi" />
                </div>
                <div className="input-group">
                  <label htmlFor="p-category">Kategoriya *</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                    <option value="Kostyumlar">Kostyumlar</option>
                    <option value="Futbolkalar">Futbolkalar</option>
                    <option value="Shimlar">Shimlar</option>
                    <option value="Ko'ylaklar">Ko'ylaklar</option>
                    <option value="Poyabzallar">Poyabzallar</option>
                    <option value="Kurtkalar">Kurtkalar</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="p-price">Narxi (UZS) *</label>
                  <input type="number" required min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                </div>
                <div className="input-group">
                  <label htmlFor="p-stock">Ombordagi soni</label>
                  <input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="p-sizes">Mavjud o'lchamlar</label>
                  <input type="text" value={productForm.sizes} onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })} placeholder="S,M,L,XL" />
                </div>
                <div className="input-group">
                  <label htmlFor="p-colors">Mavjud ranglar</label>
                  <input type="text" value={productForm.colors} onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })} placeholder="Qora,Oq,Ko'k" />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="p-image">Rasm URL manzili</label>
                <input type="url" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="Link" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalState({ ...modalState, product: false })}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER CREATION MODAL */}
      {modalState.order && (
        <div className="modal">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h3>Yangi buyurtma rasmiylashtirish</h3>
              <button className="close-modal" onClick={() => setModalState({ ...modalState, order: false })}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={saveOrder}>
              <div className="input-group">
                <label>Mijozni tanlang *</label>
                <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="order-items-builder">
                <h4>Mahsulotlar ro'yxati</h4>
                <div className="builder-row">
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {new Intl.NumberFormat('uz-UZ').format(p.price)} UZS (Qoldi: {p.stock} ta)</option>
                    ))}
                    {productsList.length === 0 && <option value="">Mahsulotlar mavjud emas</option>}
                  </select>
                  <input type="number" min="1" value={orderProductQty} onChange={(e) => setOrderProductQty(e.target.value)} style={{ width: 80 }} />
                  <button type="button" className="btn btn-secondary" onClick={addProductToOrderList}>
                    <i className="fa-solid fa-plus"></i> Qo'shish
                  </button>
                </div>

                <div className="table-responsive mt-3">
                  <table className="table-compact">
                    <thead>
                      <tr>
                        <th>Mahsulot</th>
                        <th>Narxi</th>
                        <th>Soni</th>
                        <th>Jami</th>
                        <th>O'chirish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((it, idx) => (
                        <tr key={idx}>
                          <td><strong>{it.name}</strong></td>
                          <td>{new Intl.NumberFormat('uz-UZ').format(it.price)} UZS</td>
                          <td>{it.quantity} ta</td>
                          <td>{new Intl.NumberFormat('uz-UZ').format(it.price * it.quantity)} UZS</td>
                          <td>
                            <button type="button" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-row mt-3">
                <div className="input-group">
                  <label>Promokod / Kupon kodi</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="text" placeholder="Masalan: SHOPCO10" value={orderCouponInput} onChange={(e) => setOrderCouponInput(e.target.value)} style={{ flexGrow: 1 }} />
                    <button type="button" className="btn btn-secondary" onClick={checkOrderCoupon}>Tekshirish</button>
                  </div>
                  {orderCouponMsg.text && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: orderCouponMsg.isError ? 'var(--color-danger)' : 'var(--color-success)' }}>{orderCouponMsg.text}</span>}
                </div>
              </div>

              <div className="order-summary-box">
                <div>
                  <span>Umumiy jami summa:</span>
                  <span>{new Intl.NumberFormat('uz-UZ').format(subtotal) + ' UZS'}</span>
                </div>
                {orderAppliedCoupon && (
                  <div style={{ fontSize: '0.95rem', marginTop: 5, color: 'var(--color-success)' }}>
                    <span>Chegirma: </span>
                    <span>-{new Intl.NumberFormat('uz-UZ').format(discount) + ' UZS'}</span>
                  </div>
                )}
                <div className="mt-1" style={{ fontWeight: 700 }}>
                  <span>To'lanadigan summa: </span>
                  <span>{new Intl.NumberFormat('uz-UZ').format(grandTotal) + ' UZS'}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalState({ ...modalState, order: false })}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Buyurtmani yaratish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {modalState.customer && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yangi mijoz yaratish</h3>
              <button className="close-modal" onClick={() => setModalState({ ...modalState, customer: false })}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={saveCustomer}>
              <div className="input-group">
                <label>Ism-familiya *</label>
                <input type="text" required placeholder="Masalan: Sardor Rustamov" value={customerForm.fullName} onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Telefon raqami *</label>
                <input type="text" required placeholder="Masalan: +998901234567" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Elektron pochta (E-mail)</label>
                <input type="email" placeholder="Masalan: example@gmail.com" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalState({ ...modalState, customer: false })}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {modalState.coupon && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yangi Kupon Kodini Yaratish</h3>
              <button className="close-modal" onClick={() => setModalState({ ...modalState, coupon: false })}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={saveCoupon}>
              <div className="input-group">
                <label>Kupon Kodi (Promokod) *</label>
                <input type="text" required placeholder="SALE20" style={{ textTransform: 'uppercase' }} value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Chegirma Foizi (%) *</label>
                <input type="number" required min="1" max="100" placeholder="15" value={couponForm.percent} onChange={(e) => setCouponForm({ ...couponForm, percent: e.target.value })} />
              </div>
              {modalError && <div className="error-msg">{modalError}</div>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalState({ ...modalState, coupon: false })}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Yaratish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {modalState.staff && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yangi Xodim Qo'shish</h3>
              <button className="close-modal" onClick={() => setModalState({ ...modalState, staff: false })}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={saveStaff}>
              <div className="input-group">
                <label>To'liq ism-familiyasi *</label>
                <input type="text" required placeholder="Masalan: Kamola Aliyeva" value={staffForm.fullName} onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Foydalanuvchi nomi (Login) *</label>
                <input type="text" required placeholder="kamola" value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Parol *</label>
                <input type="password" required placeholder="Parolni kiriting" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Lavozimi / Roli *</label>
                <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                  <option value="user">Foydalanuvchi (Xaridor)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {modalError && <div className="error-msg">{modalError}</div>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalState({ ...modalState, staff: false })}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Xodimni saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
