/* ==========================================
   SHOPCO CRM - FRONTEND APPLICATION LOGIC
   ========================================== */

// Global State
const state = {
  user: null,
  activeTab: 'dashboard',
  products: [],
  orders: [],
  customers: [],
  coupons: [],
  staff: [],
  dashboardStats: null,
  
  // Admin Order builder state
  currentOrderItems: [],
  appliedCoupon: null,

  // Client Cart state
  cartItems: [],
  cartCoupon: null
};

// DOM Elements
const elements = {
  landingPage: document.getElementById('landing-page'),
  authScreen: document.getElementById('auth-screen'),
  appContainer: document.getElementById('app-container'),
  
  // Auth containers
  loginViewContainer: document.getElementById('login-view-container'),
  registerViewContainer: document.getElementById('register-view-container'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginError: document.getElementById('login-error'),
  registerError: document.getElementById('register-error'),
  linkGoToRegister: document.getElementById('link-go-to-register'),
  linkGoToLogin: document.getElementById('link-go-to-login'),
  
  btnLogout: document.getElementById('btn-logout'),
  menuItems: document.querySelectorAll('.menu-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  tabTitle: document.getElementById('tab-title'),
  tabSubtitle: document.getElementById('tab-subtitle'),
  userDisplayName: document.getElementById('user-display-name'),
  userDisplayRole: document.getElementById('user-display-role'),

  // Stats (Admin)
  statSales: document.getElementById('stat-sales'),
  statOrders: document.getElementById('stat-orders'),
  statCustomers: document.getElementById('stat-customers'),
  statStockAlert: document.getElementById('stat-stock-alert'),
  recentOrdersList: document.getElementById('recent-orders-list'),

  // Products (Admin)
  productListContainer: document.getElementById('product-list-container'),
  searchProduct: document.getElementById('search-product'),
  filterProductCat: document.getElementById('filter-product-cat'),
  btnOpenProductModal: document.getElementById('btn-open-product-modal'),
  productModal: document.getElementById('product-modal'),
  productForm: document.getElementById('product-form'),
  productModalTitle: document.getElementById('product-modal-title'),

  // Orders (Admin)
  ordersListTable: document.getElementById('orders-list-table'),
  searchOrder: document.getElementById('search-order'),
  btnOpenOrderModal: document.getElementById('btn-open-order-modal'),
  orderModal: document.getElementById('order-modal'),
  orderForm: document.getElementById('order-form'),
  orderCustomerSelect: document.getElementById('order-customer'),
  orderProductSelect: document.getElementById('order-select-product'),
  orderProductQty: document.getElementById('order-product-qty'),
  btnAddItemToList: document.getElementById('btn-add-item-to-list'),
  orderItemsTbody: document.getElementById('order-items-tbody'),
  orderGrandTotal: document.getElementById('order-grand-total'),
  orderCouponInput: document.getElementById('order-coupon-input'),
  btnApplyCoupon: document.getElementById('btn-apply-coupon'),
  couponStatusMsg: document.getElementById('coupon-status-msg'),
  orderDiscountContainer: document.getElementById('order-discount-container'),
  orderDiscountValue: document.getElementById('order-discount-value'),

  // Customers (Admin)
  customersListTable: document.getElementById('customers-list-table'),
  searchCustomer: document.getElementById('search-customer'),
  btnOpenCustomerModal: document.getElementById('btn-open-customer-modal'),
  customerModal: document.getElementById('customer-modal'),
  customerForm: document.getElementById('customer-form'),

  // Reports (Admin)
  reportAvgCart: document.getElementById('report-avg-cart'),
  reportMaxSale: document.getElementById('report-max-sale'),

  // Coupons (Admin)
  couponsListTable: document.getElementById('coupons-list-table'),
  btnOpenCouponModal: document.getElementById('btn-open-coupon-modal'),
  couponModal: document.getElementById('coupon-modal'),
  couponForm: document.getElementById('coupon-form'),
  couponError: document.getElementById('coupon-error'),

  // Staff (Admin)
  staffListTable: document.getElementById('staff-list-table'),
  btnOpenStaffModal: document.getElementById('btn-open-staff-modal'),
  staffModal: document.getElementById('staff-modal'),
  staffForm: document.getElementById('staff-form'),
  staffError: document.getElementById('staff-error'),

  // --- CLIENT KATALOG TAB DOM ---
  catalogSearch: document.getElementById('catalog-search'),
  catalogFilterCat: document.getElementById('catalog-filter-cat'),
  catalogSort: document.getElementById('catalog-sort'),
  catalogProductsGrid: document.getElementById('catalog-products-grid'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  cartCouponInput: document.getElementById('cart-coupon-input'),
  btnCartApplyCoupon: document.getElementById('btn-cart-apply-coupon'),
  cartCouponMsg: document.getElementById('cart-coupon-msg'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartDiscountRow: document.getElementById('cart-discount-row'),
  cartDiscountVal: document.getElementById('cart-discount-val'),
  cartGrandTotal: document.getElementById('cart-grand-total'),
  btnCheckoutCart: document.getElementById('btn-checkout-cart'),
  myordersListTable: document.getElementById('myorders-list-table')
};

// Charts references
let salesChart = null;
let categoryChart = null;
let yearlySalesChart = null;

// Currency Formatter
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

// Format Date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('uz-UZ', options);
}

// Map order status to CSS badge classes
function getBadgeClass(status) {
  switch (status) {
    case 'Kutilmoqda': return 'badge-pending';
    case 'Yo\'lda': return 'badge-shipping';
    case 'Yetkazildi': return 'badge-delivered';
    case 'Bekor qilindi': return 'badge-cancelled';
    default: return '';
  }
}

// Document Load & Check Auth
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Setup Events
function setupEventListeners() {
  // Landing Navigation to Login
  document.querySelectorAll('.btn-signin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginScreen();
    });
  });

  // Landing Navigation to Register
  document.querySelectorAll('.btn-register').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterScreen();
    });
  });

  // Switch Auth Card views
  elements.linkGoToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterScreen();
  });

  elements.linkGoToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginScreen();
  });

  // Back to Landing from Auth card
  document.querySelectorAll('.btn-back-to-home').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showLandingScreen();
    });
  });

  // Login Form
  elements.loginForm.addEventListener('submit', handleLogin);

  // Register Form
  elements.registerForm.addEventListener('submit', handleRegister);

  // Logout
  elements.btnLogout.addEventListener('click', handleLogout);

  // Navigation Tabs
  elements.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Navigate to Orders from Dashboard
  document.querySelector('.btn-navigate-orders').addEventListener('click', () => {
    switchTab('orders');
  });

  // Modal Closers
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  // Products CRUD handlers
  elements.btnOpenProductModal.addEventListener('click', () => openProductModal());
  elements.productForm.addEventListener('submit', saveProduct);
  elements.searchProduct.addEventListener('input', renderProducts);
  elements.filterProductCat.addEventListener('change', renderProducts);

  // Customers CRUD handlers
  elements.btnOpenCustomerModal.addEventListener('click', () => openCustomerModal());
  elements.customerForm.addEventListener('submit', saveCustomer);
  elements.searchCustomer.addEventListener('input', renderCustomers);

  // Orders creation handlers
  elements.btnOpenOrderModal.addEventListener('click', () => openOrderModal());
  elements.btnAddItemToList.addEventListener('click', addItemToOrderBuilder);
  elements.orderForm.addEventListener('submit', saveOrder);
  elements.searchOrder.addEventListener('input', renderOrders);
  elements.btnApplyCoupon.addEventListener('click', applyCouponCode);

  // Coupons handlers
  elements.btnOpenCouponModal.addEventListener('click', () => openCouponModal());
  elements.couponForm.addEventListener('submit', saveCoupon);

  // Staff handlers
  elements.btnOpenStaffModal.addEventListener('click', () => openStaffModal());
  elements.staffForm.addEventListener('submit', saveStaff);

  // --- CLIENT CATALOG SEARCH / FILTER ---
  elements.catalogSearch.addEventListener('input', renderCatalogProducts);
  elements.catalogFilterCat.addEventListener('change', renderCatalogProducts);
  elements.catalogSort.addEventListener('change', renderCatalogProducts);
  elements.btnCartApplyCoupon.addEventListener('click', applyCartCouponCode);
  elements.btnCheckoutCart.addEventListener('click', checkoutShoppingProductCart);

  // Profile Settings Form
  document.getElementById('profile-settings-form').addEventListener('submit', saveProfileData);
}

// Authentication Check
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.authenticated) {
      state.user = data.user;
      showAppScreen();
    } else {
      showLandingScreen();
    }
  } catch (err) {
    showLandingScreen();
  }
}

function showLandingScreen() {
  elements.landingPage.classList.remove('hidden');
  elements.authScreen.classList.add('hidden');
  elements.appContainer.classList.add('hidden');
}

function showLoginScreen() {
  elements.landingPage.classList.add('hidden');
  elements.authScreen.classList.remove('hidden');
  elements.appContainer.classList.add('hidden');
  elements.loginViewContainer.classList.remove('hidden');
  elements.registerViewContainer.classList.add('hidden');
}

function showRegisterScreen() {
  elements.landingPage.classList.add('hidden');
  elements.authScreen.classList.remove('hidden');
  elements.appContainer.classList.add('hidden');
  elements.loginViewContainer.classList.add('hidden');
  elements.registerViewContainer.classList.remove('hidden');
}

function showAppScreen() {
  elements.landingPage.classList.add('hidden');
  elements.authScreen.classList.add('hidden');
  elements.appContainer.classList.remove('hidden');
  elements.userDisplayName.textContent = state.user.full_name;
  elements.userDisplayRole.textContent = state.user.role === 'admin' ? 'Administrator' : 'Foydalanuvchi';
  document.getElementById('menu-item-profile').classList.remove('hidden');
  
  // Role based menu toggler
  if (state.user.role === 'admin') {
    // Show Admin tabs
    document.getElementById('menu-item-dashboard').classList.remove('hidden');
    document.getElementById('menu-item-products').classList.remove('hidden');
    document.getElementById('menu-item-orders').classList.remove('hidden');
    document.getElementById('menu-item-customers').classList.remove('hidden');
    document.getElementById('menu-item-reports').classList.remove('hidden');
    document.getElementById('menu-item-coupons').classList.remove('hidden');
    document.getElementById('menu-item-staff').classList.remove('hidden');
    
    // Hide Client tabs
    document.getElementById('menu-item-catalog').classList.add('hidden');
    document.getElementById('menu-item-myorders').classList.add('hidden');
    
    switchTab('dashboard');
  } else {
    // Hide Admin tabs
    document.getElementById('menu-item-dashboard').classList.add('hidden');
    document.getElementById('menu-item-products').classList.add('hidden');
    document.getElementById('menu-item-orders').classList.add('hidden');
    document.getElementById('menu-item-customers').classList.add('hidden');
    document.getElementById('menu-item-reports').classList.add('hidden');
    document.getElementById('menu-item-coupons').classList.add('hidden');
    document.getElementById('menu-item-staff').classList.add('hidden');
    
    // Show Client tabs
    document.getElementById('menu-item-catalog').classList.remove('hidden');
    document.getElementById('menu-item-myorders').classList.remove('hidden');
    
    switchTab('catalog');
  }
}

// Login Handler
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      state.user = data.user;
      elements.loginError.textContent = '';
      showAppScreen();
    } else {
      elements.loginError.textContent = data.error || 'Noma\'lum xatolik yuz berdi';
    }
  } catch (err) {
    elements.loginError.textContent = 'Serverga ulanib bo\'lmadi';
  }
}

// Register Handler
async function handleRegister(e) {
  e.preventDefault();
  const full_name = document.getElementById('reg-fullname').value;
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      state.user = data.user;
      elements.registerError.textContent = '';
      showAppScreen();
    } else {
      elements.registerError.textContent = data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
    }
  } catch(e) {
    elements.registerError.textContent = 'Serverga ulanib bo\'lmadi';
  }
}

// Logout Handler
async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    state.user = null;
    showLandingScreen();
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// Tab switcher
function switchTab(tabId) {
  state.activeTab = tabId;

  // Active Menu Link
  elements.menuItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Active Tab Pane
  elements.tabPanes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.remove('hidden');
    } else {
      pane.classList.add('hidden');
    }
  });

  // Header Titles
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

  elements.tabTitle.textContent = titles[tabId].title;
  elements.tabSubtitle.textContent = titles[tabId].subtitle;

  // Load data corresponding to tab
  loadTabData(tabId);
}

// Fetch corresponding Tab Data
function loadTabData(tabId) {
  if (tabId === 'dashboard') {
    fetchDashboardStats();
  } else if (tabId === 'products') {
    fetchProducts();
  } else if (tabId === 'orders') {
    fetchOrders();
  } else if (tabId === 'customers') {
    fetchCustomers();
  } else if (tabId === 'reports') {
    fetchReportsData();
  } else if (tabId === 'coupons') {
    fetchCoupons();
  } else if (tabId === 'staff') {
    fetchStaff();
  } else if (tabId === 'profile') {
    fetchProfileData();
  } else if (tabId === 'catalog') {
    fetchCatalogProducts();
  } else if (tabId === 'myorders') {
    fetchMyOrders();
  }
}

// Modals management
function closeAllModals() {
  elements.productModal.classList.add('hidden');
  elements.orderModal.classList.add('hidden');
  elements.customerModal.classList.add('hidden');
  elements.couponModal.classList.add('hidden');
  elements.staffModal.classList.add('hidden');
}

// --- CLIENT-FACING CATALOGUE EXPERIENCES ---
async function fetchCatalogProducts() {
  try {
    const res = await fetch('/api/products');
    state.products = await res.json();
    renderCatalogProducts();
  } catch(e) {
    console.error(e);
  }
}

function renderCatalogProducts() {
  const searchQuery = elements.catalogSearch.value.toLowerCase();
  const categoryFilter = elements.catalogFilterCat.value;
  const sortBy = elements.catalogSort.value;

  let filtered = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort logic
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'uz'));
  }

  elements.catalogProductsGrid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${p.image_url}" class="product-img" alt="${p.name}">
      <div class="product-info">
        <div class="p-meta">
          <span class="p-cat">${p.category}</span>
          <span class="p-stock ${p.stock <= 5 ? 'low' : 'ok'}">${p.stock <= 5 ? `Kam qoldi: ${p.stock} ta` : `Omborda: ${p.stock} ta`}</span>
        </div>
        <h4 class="p-name" title="${p.name}">${p.name}</h4>
        <div class="p-price">${formatCurrency(p.price)}</div>
        
        <div class="product-options mt-2">
          <div class="option-select-group">
            <label for="p-size-${p.id}">O'lcham:</label>
            <select id="p-size-${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
              ${p.sizes ? p.sizes.split(',').map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('') : '<option value="-">-</option>'}
            </select>
          </div>
          <div class="option-select-group mt-1">
            <label for="p-color-${p.id}">Rang:</label>
            <select id="p-color-${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
              ${p.colors ? p.colors.split(',').map(c => `<option value="${c.trim()}">${c.trim()}</option>`).join('') : '<option value="-">-</option>'}
            </select>
          </div>
          <div class="option-select-group mt-1">
            <label for="p-qty-${p.id}">Soni:</label>
            <input type="number" id="p-qty-${p.id}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
          </div>
        </div>

        <button class="btn btn-accent btn-block btn-sm" onclick="addCatalogItemToCart(${p.id})" ${p.stock === 0 ? 'disabled' : ''} style="color:#0b0f19; font-weight:600;">
          ${p.stock === 0 ? 'Tugagan' : 'Savatga Qo\'shish <i class="fa-solid fa-basket-shopping"></i>'}
        </button>
      </div>
    </div>
  `).join('') || '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary)">Katalogda tovarlar topilmadi</div>';
}

window.addCatalogItemToCart = function(id) {
  const product = state.products.find(p => p.id === id);
  if (!product || product.stock === 0) return;

  const sizeEl = document.getElementById(`p-size-${id}`);
  const colorEl = document.getElementById(`p-color-${id}`);
  const qtyEl = document.getElementById(`p-qty-${id}`);

  const size = sizeEl ? sizeEl.value : '-';
  const color = colorEl ? colorEl.value : '-';
  const qty = qtyEl ? parseInt(qtyEl.value) : 1;

  if (isNaN(qty) || qty < 1) {
    alert('Iltimos, to\'g\'ri miqdorni kiriting');
    return;
  }

  if (qty > product.stock) {
    alert(`Omborda faqat ${product.stock} ta tovar mavjud!`);
    return;
  }

  const existing = state.cartItems.find(it => it.id === id && it.size === size && it.color === color);
  if (existing) {
    if (existing.quantity + qty > product.stock) {
      alert(`Ombordagi cheklovdan ko'p tovar qo'shib bo'lmaydi. Savatda allaqachon ${existing.quantity} ta bor.`);
      return;
    }
    existing.quantity += qty;
  } else {
    state.cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      color: color,
      quantity: qty
    });
  }

  // Reset quantity input
  if (qtyEl) qtyEl.value = 1;

  renderCartSidebar();
};

function renderCartSidebar() {
  let subtotal = 0;
  elements.cartItemsContainer.innerHTML = state.cartItems.map((it, idx) => {
    const rowTotal = it.price * it.quantity;
    subtotal += rowTotal;
    return `
      <div class="cart-item-row" style="border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px; margin-bottom: 8px;">
        <div class="cart-item-info">
          <span class="cart-item-name" title="${it.name}">${it.name}</span>
          <span class="cart-item-variation" style="font-size:0.7rem; color:var(--text-muted);">O'lcham: ${it.size} | Rang: ${it.color}</span>
          <span class="cart-item-price" style="font-size: 0.8rem; color: var(--color-accent); font-weight:600;">${formatCurrency(it.price)}</span>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
          <span class="qty-val">${it.quantity}</span>
          <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
        </div>
      </div>
    `;
  }).join('') || '<div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding: 20px 0;">Savat bo\'sh</div>';

  let discount = 0;
  if (state.cartCoupon) {
    discount = (subtotal * state.cartCoupon.discount_percent) / 100;
    elements.cartDiscountRow.style.display = 'flex';
    elements.cartDiscountVal.textContent = '-' + formatCurrency(discount);
  } else {
    elements.cartDiscountRow.style.display = 'none';
  }

  const grandTotal = subtotal - discount;

  elements.cartSubtotal.textContent = formatCurrency(subtotal);
  elements.cartGrandTotal.textContent = formatCurrency(grandTotal);
}

window.updateCartItemQty = function(index, delta) {
  const item = state.cartItems[index];
  const product = state.products.find(p => p.id === item.id);

  if (item.quantity + delta > product.stock) {
    alert(`Kechirasiz, omborda faqat ${product.stock} ta tovar bor!`);
    return;
  }

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cartItems.splice(index, 1);
  }
  renderCartSidebar();
};

async function applyCartCouponCode() {
  const code = elements.cartCouponInput.value.trim();
  if (!code) return;

  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (res.ok) {
      state.cartCoupon = data;
      elements.cartCouponMsg.style.color = 'var(--color-success)';
      elements.cartCouponMsg.textContent = `${data.discount_percent}% chegirma qo'llanildi`;
      renderCartSidebar();
    } else {
      state.cartCoupon = null;
      elements.cartCouponMsg.style.color = 'var(--color-danger)';
      elements.cartCouponMsg.textContent = data.error || 'Xato kupon';
      renderCartSidebar();
    }
  } catch(e) {
    console.error(e);
  }
}

async function checkoutShoppingProductCart() {
  if (state.cartItems.length === 0) {
    alert('Savat bo\'sh. Tovar tanlang!');
    return;
  }

  let customerId = 1; // Default client id
  try {
    const clientsRes = await fetch('/api/customers');
    if (clientsRes.ok) {
      const clients = await clientsRes.json();
      if (Array.isArray(clients)) {
        const matches = clients.find(c => c.full_name === state.user.full_name);
        if (matches) {
          customerId = matches.id;
        } else {
          // Create a client mapping profile in customers table
          const makeCust = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: state.user.full_name, phone: '+998990001122', email: state.user.username + '@shopco.com' })
          });
          if (makeCust.ok) {
            const newCust = await makeCust.json();
            customerId = newCust.id;
          }
        }
      }
    }
  } catch(e) {
    console.error('Error fetching/creating customer profile:', e);
  }

  const subtotal = state.cartItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const discount = state.cartCoupon ? (subtotal * state.cartCoupon.discount_percent) / 100 : 0;

  const payload = {
    customer_id: customerId,
    items: state.cartItems,
    total_amount: subtotal - discount,
    coupon_code: state.cartCoupon ? state.cartCoupon.code : '',
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
      state.cartItems = [];
      state.cartCoupon = null;
      elements.cartCouponInput.value = '';
      elements.cartCouponMsg.textContent = '';
      renderCartSidebar();
      switchTab('myorders');
    } else {
      const errData = await res.json();
      alert('Buyurtma berishda xatolik yuz berdi: ' + (errData.error || 'Noma\'lum xatolik'));
    }
  } catch(e) {
    console.error(e);
    alert('Buyurtma berishda server bilan ulanish xatoligi yuz berdi.');
  }
}

// Fetch user's own orders
async function fetchMyOrders() {
  try {
    const res = await fetch('/api/orders');
    const allOrders = await res.json();
    
    // Filter to only show orders placed by this user profile
    const myOrders = allOrders.filter(o => o.customer_name === state.user.full_name);
    
    elements.myordersListTable.innerHTML = myOrders.map(o => {
      let itemsList = [];
      try {
        itemsList = JSON.parse(o.items);
      } catch(e) {}

      const itemsDisplay = itemsList.map(it => `${it.name}${it.size && it.size !== '-' ? ` (${it.size}/${it.color})` : ''} (${it.quantity} ta)`).join(', ');

      return `
        <tr>
          <td>#${o.id}</td>
          <td>${formatDate(o.created_at)}</td>
          <td style="color:var(--color-accent); font-weight:700;">
            ${formatCurrency(o.total_amount)}
            ${o.coupon_code ? `<br><small style="color:var(--color-success)">Kupon: ${o.coupon_code} (-${formatCurrency(o.discount_amount)})</small>` : ''}
          </td>
          <td><span class="badge ${getBadgeClass(o.status)}">${o.status}</span></td>
          <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsDisplay}">${itemsDisplay}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="printOrderInvoice(${o.id})"><i class="fa-solid fa-print"></i> Kvitansiya</button>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="6" style="text-align:center;">Hozircha buyurtmalaringiz yo\'q</td></tr>';
  } catch(e) {
    console.error(e);
  }
}

// --- ADMIN DASHBOARD DATA ---
async function fetchDashboardStats() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();
    state.dashboardStats = data;

    // Render Stats values
    elements.statSales.textContent = formatCurrency(data.total_sales);
    elements.statOrders.textContent = data.total_orders + ' ta';
    elements.statCustomers.textContent = data.active_customers + ' ta';
    elements.statStockAlert.textContent = data.low_stock + ' ta';

    // Render Recent Orders list
    elements.recentOrdersList.innerHTML = data.recent_orders.map(order => `
      <tr>
        <td>#${order.id}</td>
        <td>${order.customer_name}</td>
        <td>${formatDate(order.created_at)}</td>
        <td>${formatCurrency(order.total_amount)}</td>
        <td><span class="badge ${getBadgeClass(order.status)}">${order.status}</span></td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center;">Hozircha buyurtmalar yo'q</td></tr>`;

    initDashboardCharts(data);
  } catch (err) {
    console.error('Fetch dashboard statistics failed:', err);
  }
}

// Dashboard Charts Builder
function initDashboardCharts(data) {
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

  // 1. Sales Trend (Line Chart)
  if (salesChart) salesChart.destroy();
  const ctxSales = document.getElementById('salesChart').getContext('2d');
  salesChart = new Chart(ctxSales, {
    type: 'line',
    data: {
      labels: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
      datasets: [{
        label: 'Savdo hajmi (UZS)',
        data: [1200000, 1900000, 3000000, 5000000, 2300000, 4800000, data.total_sales > 18000000 ? 8000000 : 3500000],
        borderColor: '#2d4a7a',
        backgroundColor: 'rgba(45, 74, 122, 0.05)',
        fill: true,
        tension: 0.4
      }]
    },
    options: chartOptions
  });

  // 2. Categories breakdown (Doughnut Chart)
  if (categoryChart) categoryChart.destroy();
  const ctxCategory = document.getElementById('categoryChart').getContext('2d');
  const catNames = data.categories.map(c => c.category);
  const catCounts = data.categories.map(c => c.count);

  categoryChart = new Chart(ctxCategory, {
    type: 'doughnut',
    data: {
      labels: catNames.length > 0 ? catNames : ['Bo\'sh'],
      datasets: [{
        data: catCounts.length > 0 ? catCounts : [1],
        backgroundColor: ['#2d4a7a', '#c9a84c', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#6b7280', font: { family: 'Outfit' } } }
      }
    }
  });
}

// --- ANALYTICS / REPORTS ---
async function fetchReportsData() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();

    const statsRes = await fetch('/api/dashboard/stats');
    const stats = await statsRes.json();

    const avgCart = stats.total_orders > 0 ? (stats.total_sales / stats.total_orders) : 0;
    elements.reportAvgCart.textContent = formatCurrency(avgCart);

    const maxSale = orders.reduce((max, o) => o.total_amount > max ? o.total_amount : max, 0);
    elements.reportMaxSale.textContent = formatCurrency(maxSale);

    // Render Yearly line chart
    if (yearlySalesChart) yearlySalesChart.destroy();
    const ctxYearly = document.getElementById('yearlySalesChart').getContext('2d');
    yearlySalesChart = new Chart(ctxYearly, {
      type: 'bar',
      data: {
        labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
        datasets: [{
          label: 'Oylik daromad (UZS)',
          data: [12000000, 15000000, 18000000, 22000000, 31000000, stats.total_sales, 0, 0, 0, 0, 0, 0],
          backgroundColor: '#2d4a7a',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#6b7280', font: { family: 'Outfit' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#6b7280' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#6b7280' } }
        }
      }
    });

  } catch(e) {
    console.error('Fetch reports error:', e);
  }
}

// --- PRODUCTS ---
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    state.products = await res.json();
    renderProducts();
  } catch (err) {
    console.error('Fetch products error:', err);
  }
}

function renderProducts() {
  const searchQuery = elements.searchProduct.value.toLowerCase();
  const categoryFilter = elements.filterProductCat.value;

  const filtered = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  elements.productListContainer.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${p.image_url}" class="product-img" alt="${p.name}">
      <div class="product-info">
        <div class="p-meta">
          <span class="p-cat">${p.category}</span>
          <span class="p-stock ${p.stock <= 5 ? 'low' : 'ok'}">${p.stock <= 5 ? `Kam qoldi: ${p.stock} ta` : `Omborda: ${p.stock} ta`}</span>
        </div>
        <h4 class="p-name" title="${p.name}">${p.name}</h4>
        <div class="p-price">${formatCurrency(p.price)}</div>
        <div class="p-actions">
          <button class="btn btn-outline btn-block btn-sm" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i> Tahrirlash</button>
          <button class="btn btn-secondary btn-sm" style="color:var(--color-danger);" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('') || '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Mahsulot topilmadi</div>';
}

function openProductModal(product = null) {
  elements.productModal.classList.remove('hidden');
  elements.productForm.reset();

  if (product) {
    elements.productModalTitle.textContent = 'Mahsulotni tahrirlash';
    document.getElementById('product-id').value = product.id;
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-category').value = product.category;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-stock').value = product.stock;
    document.getElementById('p-sizes').value = product.sizes;
    document.getElementById('p-colors').value = product.colors;
    document.getElementById('p-image').value = product.image_url;
  } else {
    elements.productModalTitle.textContent = 'Yangi mahsulot qo\'shish';
    document.getElementById('product-id').value = '';
  }
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const payload = {
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    price: parseFloat(document.getElementById('p-price').value),
    stock: parseInt(document.getElementById('p-stock').value) || 0,
    sizes: document.getElementById('p-sizes').value,
    colors: document.getElementById('p-colors').value,
    image_url: document.getElementById('p-image').value
  };

  const url = id ? `/api/products/${id}` : '/api/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeAllModals();
      fetchProducts();
    }
  } catch (err) {
    console.error('Save product error:', err);
  }
}

window.editProduct = function(id) {
  const product = state.products.find(p => p.id === id);
  if (product) openProductModal(product);
};

window.deleteProduct = async function(id) {
  if (confirm('Rostdan ham ushbu mahsulotni o\'chirmoqchimisiz?')) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Delete product error:', err);
    }
  }
};

// --- CUSTOMERS ---
async function fetchCustomers() {
  try {
    const res = await fetch('/api/customers');
    state.customers = await res.json();
    renderCustomers();
  } catch (err) {
    console.error('Fetch customers error:', err);
  }
}

function renderCustomers() {
  const searchQuery = elements.searchCustomer.value.toLowerCase();
  const filtered = state.customers.filter(c => c.full_name.toLowerCase().includes(searchQuery) || c.phone.includes(searchQuery));

  elements.customersListTable.innerHTML = filtered.map(c => `
    <tr>
      <td>#${c.id}</td>
      <td><strong>${c.full_name}</strong></td>
      <td>${c.phone}</td>
      <td>${c.email || '<span style="color:var(--text-muted)">Kiritilmagan</span>'}</td>
      <td style="color:var(--color-success); font-weight: 600;">${formatCurrency(c.total_spent)}</td>
      <td><strong>${c.orders_count} ta</strong></td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="text-align:center;">Mijoz topilmadi</td></tr>';
}

function openCustomerModal() {
  elements.customerModal.classList.remove('hidden');
  elements.customerForm.reset();
}

async function saveCustomer(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('c-fullname').value,
    phone: document.getElementById('c-phone').value,
    email: document.getElementById('c-email').value
  };

  try {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeAllModals();
      fetchCustomers();
    }
  } catch (err) {
    console.error('Save customer error:', err);
  }
}

// --- COUPONS ---
async function fetchCoupons() {
  try {
    const res = await fetch('/api/coupons');
    state.coupons = await res.json();
    renderCoupons();
  } catch(e) {
    console.error('Fetch coupons failed:', e);
  }
}

function renderCoupons() {
  elements.couponsListTable.innerHTML = state.coupons.map(c => `
    <tr>
      <td>#${c.id}</td>
      <td><strong style="color:var(--color-primary);">${c.code}</strong></td>
      <td><strong>${c.discount_percent}%</strong></td>
      <td><span class="badge ${c.active ? 'badge-delivered' : 'badge-cancelled'}">${c.active ? 'Faol' : 'Nofaol'}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center;">Kuponlar topilmadi</td></tr>';
}

function openCouponModal() {
  elements.couponModal.classList.remove('hidden');
  elements.couponForm.reset();
  elements.couponError.textContent = '';
}

async function saveCoupon(e) {
  e.preventDefault();
  const payload = {
    code: document.getElementById('cp-code').value,
    discount_percent: parseInt(document.getElementById('cp-percent').value)
  };

  try {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      closeAllModals();
      fetchCoupons();
    } else {
      elements.couponError.textContent = data.error || 'Saqlashda xatolik yuz berdi';
    }
  } catch(e) {
    elements.couponError.textContent = 'Serverga ulanish xatoligi';
  }
}

// Apply Coupon validation in orders
async function applyCouponCode() {
  const code = elements.orderCouponInput.value.trim();
  if (!code) return;

  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (res.ok) {
      state.appliedCoupon = data;
      elements.couponStatusMsg.style.color = 'var(--color-success)';
      elements.couponStatusMsg.textContent = `Kupon qo'llanildi: ${data.discount_percent}% chegirma`;
      renderOrderBuilderList();
    } else {
      state.appliedCoupon = null;
      elements.couponStatusMsg.style.color = 'var(--color-danger)';
      elements.couponStatusMsg.textContent = data.error || 'Kupon topilmadi';
      renderOrderBuilderList();
    }
  } catch(e) {
    elements.couponStatusMsg.textContent = 'Xatolik yuz berdi';
  }
}

// --- STAFF (USERS) ---
async function fetchStaff() {
  try {
    const res = await fetch('/api/users');
    state.staff = await res.json();
    renderStaff();
  } catch(e) {
    console.error('Fetch staff failed:', e);
  }
}

function renderStaff() {
  elements.staffListTable.innerHTML = state.staff.map(s => `
    <tr>
      <td>#${s.id}</td>
      <td><strong>${s.full_name}</strong></td>
      <td>${s.username}</td>
      <td><span class="p-cat">${s.role === 'admin' ? 'Administrator' : 'Menajer'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" style="color:var(--color-danger);" ${s.id === 1 ? 'disabled style="opacity:0.5;"' : ''} onclick="deleteStaff(${s.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center;">Xodimlar topilmadi</td></tr>';
}

function openStaffModal() {
  elements.staffModal.classList.remove('hidden');
  elements.staffForm.reset();
  elements.staffError.textContent = '';
}

async function saveStaff(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('st-fullname').value,
    username: document.getElementById('st-username').value,
    password: document.getElementById('st-password').value,
    role: document.getElementById('st-role').value
  };

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      closeAllModals();
      fetchStaff();
    } else {
      elements.staffError.textContent = data.error || 'Saqlashda xatolik yuz berdi';
    }
  } catch(e) {
    elements.staffError.textContent = 'Serverga ulanish xatoligi';
  }
}

window.deleteStaff = async function(id) {
  if (confirm('Ushbu xodimni tizimdan o\'chirmoqchimisiz?')) {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStaff();
    } catch(e) {
      console.error(e);
    }
  }
};

// --- ORDERS ---
async function fetchOrders() {
  try {
    const res = await fetch('/api/orders');
    state.orders = await res.json();
    renderOrders();
  } catch (err) {
    console.error('Fetch orders error:', err);
  }
}

function renderOrders() {
  const searchQuery = elements.searchOrder.value.toLowerCase();
  const filtered = state.orders.filter(o => o.customer_name.toLowerCase().includes(searchQuery) || String(o.id).includes(searchQuery));

  elements.ordersListTable.innerHTML = filtered.map(o => {
    let itemsList = [];
    try {
      itemsList = JSON.parse(o.items);
    } catch(e) {}

    const itemsDisplay = itemsList.map(it => `${it.name}${it.size && it.size !== '-' ? ` (${it.size}/${it.color})` : ''} (${it.quantity} ta)`).join(', ');

    return `
      <tr>
        <td>#${o.id}</td>
        <td><strong>${o.customer_name}</strong></td>
        <td>${formatDate(o.created_at)}</td>
        <td style="color:var(--color-primary); font-weight: 700;">
          ${formatCurrency(o.total_amount)}
          ${o.coupon_code ? `<br><small style="color:var(--color-success)">Kupon: ${o.coupon_code} (-${formatCurrency(o.discount_amount)})</small>` : ''}
        </td>
        <td>
          <select class="badge ${getBadgeClass(o.status)}" onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 2px 6px; border-radius: 4px;">
            <option value="Kutilmoqda" ${o.status === 'Kutilmoqda' ? 'selected' : ''}>Kutilmoqda</option>
            <option value="Yo'lda" ${o.status === 'Yo\'lda' ? 'selected' : ''}>Yo'lda</option>
            <option value="Yetkazildi" ${o.status === 'Yetkazildi' ? 'selected' : ''}>Yetkazildi</option>
            <option value="Bekor qilindi" ${o.status === 'Bekor qilindi' ? 'selected' : ''}>Bekor qilindi</option>
          </select>
        </td>
        <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsDisplay}">
          ${itemsDisplay}
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="printOrderInvoice(${o.id})"><i class="fa-solid fa-print"></i> Kvitansiya</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="text-align:center;">Buyurtma topilmadi</td></tr>';
}

window.updateOrderStatus = async function(id, status) {
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
    console.error('Update status error:', err);
  }
};

window.printOrderInvoice = function(id) {
  const order = state.orders.find(o => o.id === id);
  if (!order) return;

  let items = [];
  try {
    items = JSON.parse(order.items);
  } catch(e) {}

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

// Order builder modal opener
async function openOrderModal() {
  state.currentOrderItems = [];
  state.appliedCoupon = null;
  elements.orderGrandTotal.textContent = '0 UZS';
  elements.orderCouponInput.value = '';
  elements.couponStatusMsg.textContent = '';
  elements.orderDiscountContainer.style.display = 'none';
  elements.orderItemsTbody.innerHTML = '';
  elements.orderModal.classList.remove('hidden');

  // Load Customers for dropdown
  try {
    const custRes = await fetch('/api/customers');
    state.customers = await custRes.json();
    elements.orderCustomerSelect.innerHTML = state.customers.map(c => `
      <option value="${c.id}">${c.full_name} (${c.phone})</option>
    `).join('');

    // Load Products for selector
    const prodRes = await fetch('/api/products');
    state.products = await prodRes.json();
    elements.orderProductSelect.innerHTML = state.products.filter(p => p.stock > 0).map(p => `
      <option value="${p.id}">${p.name} - ${formatCurrency(p.price)} (Qoldi: ${p.stock} ta)</option>
    `).join('') || '<option value="">Mahsulotlar mavjud emas (omborda tugagan)</option>';
  } catch (err) {
    console.error('Prepare order builder failed:', err);
  }
}

function addItemToOrderBuilder() {
  const productId = parseInt(elements.orderProductSelect.value);
  const qty = parseInt(elements.orderProductQty.value);

  if (!productId || qty < 1) return;

  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  if (qty > product.stock) {
    alert(`Omborda faqat ${product.stock} ta mahsulot bor!`);
    return;
  }

  // Check if item already exists in builder
  const existing = state.currentOrderItems.find(it => it.id === productId);
  if (existing) {
    if (existing.quantity + qty > product.stock) {
      alert(`Omborda jami faqat ${product.stock} ta mahsulot bor!`);
      return;
    }
    existing.quantity += qty;
  } else {
    state.currentOrderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty
    });
  }

  renderOrderBuilderList();
}

function removeBuilderItem(index) {
  state.currentOrderItems.splice(index, 1);
  renderOrderBuilderList();
}

function renderOrderBuilderList() {
  let subtotal = 0;
  elements.orderItemsTbody.innerHTML = state.currentOrderItems.map((it, idx) => {
    const rowTotal = it.price * it.quantity;
    subtotal += rowTotal;
    return `
      <tr>
        <td><strong>${it.name}</strong></td>
        <td>${formatCurrency(it.price)}</td>
        <td>${it.quantity} ta</td>
        <td>${formatCurrency(rowTotal)}</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" onclick="removeBuilderItem(${idx})" style="color:var(--color-danger);">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  let discount = 0;
  if (state.appliedCoupon) {
    discount = (subtotal * state.appliedCoupon.discount_percent) / 100;
    elements.orderDiscountContainer.style.display = 'block';
    elements.orderDiscountValue.textContent = '-' + formatCurrency(discount);
  } else {
    elements.orderDiscountContainer.style.display = 'none';
  }

  const grandTotal = subtotal - discount;
  elements.orderGrandTotal.textContent = formatCurrency(grandTotal);
}

// Global scope referencing for builder deletions
window.removeBuilderItem = removeBuilderItem;

async function saveOrder(e) {
  e.preventDefault();
  if (state.currentOrderItems.length === 0) {
    alert('Kamida bitta mahsulot qo\'shishingiz kerak');
    return;
  }

  let subtotal = state.currentOrderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  let discount = state.appliedCoupon ? (subtotal * state.appliedCoupon.discount_percent) / 100 : 0;
  const finalAmount = subtotal - discount;

  const payload = {
    customer_id: parseInt(elements.orderCustomerSelect.value),
    items: state.currentOrderItems,
    total_amount: finalAmount,
    coupon_code: state.appliedCoupon ? state.appliedCoupon.code : '',
    discount_amount: discount
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeAllModals();
      fetchOrders();
    }
  } catch (err) {
    console.error('Save order error:', err);
  }
}

// Load current user profile details into the profile settings inputs
function fetchProfileData() {
  if (state.user) {
    document.getElementById('prof-fullname').value = state.user.full_name || '';
    document.getElementById('prof-username').value = state.user.username || '';
    document.getElementById('prof-password').value = '';
    document.getElementById('profile-success-msg').style.display = 'none';
    document.getElementById('profile-error-msg').textContent = '';
  }
}

// Send profile update PUT request to the backend
async function saveProfileData(e) {
  e.preventDefault();
  const fullname = document.getElementById('prof-fullname').value;
  const username = document.getElementById('prof-username').value;
  const password = document.getElementById('prof-password').value;
  const successMsg = document.getElementById('profile-success-msg');
  const errorMsg = document.getElementById('profile-error-msg');

  successMsg.style.display = 'none';
  errorMsg.textContent = '';

  const payload = {
    full_name: fullname,
    username: username
  };

  if (password && password.trim() !== '') {
    if (password.length < 4) {
      errorMsg.textContent = 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak';
      return;
    }
    payload.password = password;
  }

  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      state.user = data.user;
      elements.userDisplayName.textContent = state.user.full_name;
      successMsg.style.display = 'block';
      document.getElementById('prof-password').value = '';
    } else {
      errorMsg.textContent = data.error || 'Profilni saqlashda xatolik';
    }
  } catch(err) {
    errorMsg.textContent = 'Serverga ulanish xatoligi';
  }
}
