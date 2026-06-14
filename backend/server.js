const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'shopco-super-secret-key-12345';
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Connect to SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      full_name TEXT,
      role TEXT
    )`);

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      price REAL,
      stock INTEGER,
      sizes TEXT,
      colors TEXT,
      image_url TEXT
    )`);

    // Customers Table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      total_spent REAL DEFAULT 0,
      orders_count INTEGER DEFAULT 0
    )`);

    // Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      customer_name TEXT,
      total_amount REAL,
      status TEXT DEFAULT 'Kutilmoqda',
      items TEXT,
      coupon_code TEXT,
      discount_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure coupon_code and discount_amount columns exist if orders table was created previously without them
    db.run("ALTER TABLE orders ADD COLUMN coupon_code TEXT", (err) => {
      // Ignore if column already exists
    });
    db.run("ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0", (err) => {
      // Ignore if column already exists
    });

    // Coupons Table
    db.run(`CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      discount_percent INTEGER,
      active INTEGER DEFAULT 1
    )`);

    // Update existing manager roles to user
    db.run("UPDATE users SET role = 'user' WHERE role = 'manager'");

    // Seed default admin user
    db.get("SELECT * FROM users WHERE username = 'admin'", [], (err, row) => {
      if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
          ['admin', hashedPassword, 'ShopCo Administrator', 'admin']);
        console.log('Default admin seeded (admin / admin123)');
      }
    });

    // Seed default coupons if empty
    db.get("SELECT COUNT(*) as count FROM coupons", [], (err, row) => {
      if (row && row.count === 0) {
        db.run("INSERT INTO coupons (code, discount_percent, active) VALUES (?, ?, ?)", ['SHOPCO10', 10, 1]);
        db.run("INSERT INTO coupons (code, discount_percent, active) VALUES (?, ?, ?)", ['SPRING15', 15, 1]);
        console.log('Default coupons seeded.');
      }
    });

    // Seed initial products if empty
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
      if (row && row.count === 0) {
        const products = [
          ['Klassik Erkaklar Kostyumi', 'Kostyumlar', 1200000, 15, 'M,L,XL', 'Qora,To\'q ko\'k', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60'],
          ['Trikotaj Erkaklar T-Shirt', 'Futbolkalar', 150000, 50, 'S,M,L', 'Oq,Qora,Kulrang', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'],
          ['Slim Fit Djinsi Shim', 'Shimlar', 350000, 25, '30,32,34', 'Moviy,To\'q ko\'k', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60'],
          ['Yozgi Ayollar Ko\'ylagi', 'Ko\'ylaklar', 450000, 18, 'S,M,L', 'Sariq,Gullik', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60'],
          ['Krossovka Nike Air Force', 'Poyabzallar', 950000, 12, '40,41,42,43', 'Oq', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60'],
          ['Qishki Issiq Kurtka', 'Kurtkalar', 850000, 8, 'M,L,XL', 'Yashil,Qora', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60']
        ];
        products.forEach(p => {
          db.run("INSERT INTO products (name, category, price, stock, sizes, colors, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)", p);
        });
        console.log('Default products seeded.');
      }
    });

    // Seed initial customers if empty
    db.get("SELECT COUNT(*) as count FROM customers", [], (err, row) => {
      if (row && row.count === 0) {
        const customers = [
          ['Anvar Sadullayev', 'anvar@gmail.com', '+998901234567', 1550000, 2],
          ['Dina Karimova', 'dina@mail.ru', '+998935552211', 450000, 1],
          ['Jasur Alimov', 'jasur@alimov.uz', '+998977778899', 0, 0]
        ];
        customers.forEach(c => {
          db.run("INSERT INTO customers (full_name, email, phone, total_spent, orders_count) VALUES (?, ?, ?, ?, ?)", c);
        });
        console.log('Default customers seeded.');
      }
    });
  });
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Ruxsat berilmagan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token yaroqsiz' });
    }
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password, full_name } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'user')",
    [username, hashedPassword, full_name],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Ushbu login band. Boshqa login tanlang' });
        }
        return res.status(500).json({ error: err.message });
      }

      const userId = this.lastID;

      // Automatically create matching customer profile
      db.run("INSERT INTO customers (full_name, email, phone) VALUES (?, ?, ?)",
        [full_name, username + '@shopco.com', '+998990001122'],
        function(err2) {
          // Send response regardless of customer table insert errors
          const token = jwt.sign({ id: userId, username, full_name, role: 'user' }, JWT_SECRET, { expiresIn: '12h' });
          res.cookie('token', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
          res.json({ success: true, user: { username, full_name, role: 'user' } });
        }
      );
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username va parolni kiriting' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Tizim xatoligi' });
    }
    if (!row) {
      return res.status(400).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const validPassword = bcrypt.compareSync(password, row.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Parol noto\'g\'ri' });
    }

    const token = jwt.sign({ id: row.id, username: row.username, full_name: row.full_name, role: row.role }, JWT_SECRET, { expiresIn: '12h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
    res.json({ success: true, user: { username: row.username, full_name: row.full_name, role: row.role } });
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Check Current User Auth
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ authenticated: false });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ authenticated: false });
    }
    res.json({ authenticated: true, user: decoded });
  });
});

// Update Profile Settings
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { username, full_name, password } = req.body;
  const userId = req.user.id;

  if (!username || !full_name) {
    return res.status(400).json({ error: 'Foydalanuvchi nomi va to\'liq ism majburiy' });
  }

  // Check if username is taken by another user
  db.get("SELECT * FROM users WHERE username = ? AND id != ?", [username, userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Ushbu foydalanuvchi nomi band' });

    if (password && password.trim() !== '') {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.run("UPDATE users SET username = ?, full_name = ?, password = ? WHERE id = ?",
        [username, full_name, hashedPassword, userId],
        function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          finalizeProfileUpdate();
        }
      );
    } else {
      db.run("UPDATE users SET username = ?, full_name = ? WHERE id = ?",
        [username, full_name, userId],
        function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          finalizeProfileUpdate();
        }
      );
    }

    function finalizeProfileUpdate() {
      // Also update matching customer name if role is user/manager so orders align
      db.run("UPDATE customers SET full_name = ?, email = ? WHERE email = ?",
        [full_name, username + '@shopco.com', req.user.username + '@shopco.com']);

      // Get updated user data to sign a new token
      db.get("SELECT id, username, full_name, role FROM users WHERE id = ?", [userId], (err3, updatedUser) => {
        if (err3 || !updatedUser) return res.status(500).json({ error: 'Tizim xatoligi' });

        const token = jwt.sign({ id: updatedUser.id, username: updatedUser.username, full_name: updatedUser.full_name, role: updatedUser.role }, JWT_SECRET, { expiresIn: '12h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
        res.json({ success: true, user: updatedUser });
      });
    }
  });
});

// Users (Staff) APIs
app.get('/api/users', authenticateToken, (req, res) => {
  db.all("SELECT id, username, full_name, role FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', authenticateToken, (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
    [username, hashedPassword, full_name, role || 'user'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Bu login allaqachon mavjud' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, username, full_name, role: role || 'user' });
    });
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (parseInt(req.params.id) === 1) {
    return res.status(400).json({ error: 'Asosiy admin foydalanuvchisini o\'chirib bo\'lmaydi' });
  }
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Coupons APIs
app.get('/api/coupons', authenticateToken, (req, res) => {
  db.all("SELECT * FROM coupons ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/coupons', authenticateToken, (req, res) => {
  const { code, discount_percent } = req.body;
  if (!code || !discount_percent) {
    return res.status(400).json({ error: 'Kupon kodi va foiz majburiy' });
  }

  const cleanCode = code.toUpperCase().trim();
  db.run("INSERT INTO coupons (code, discount_percent, active) VALUES (?, ?, 1)",
    [cleanCode, parseInt(discount_percent)],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Bu kupon kodi allaqachon mavjud' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, code: cleanCode, discount_percent, active: 1 });
    });
});

app.post('/api/coupons/validate', authenticateToken, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Kupon kodini kiriting' });

  db.get("SELECT * FROM coupons WHERE code = ? AND active = 1", [code.toUpperCase().trim()], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Yaroqsiz yoki eskirgan kupon kodi' });
    res.json(row);
  });
});

// Dashboard Statistics
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};
  db.get("SELECT SUM(total_amount) as total_sales, COUNT(*) as total_orders FROM orders WHERE status != 'Bekor qilindi'", [], (err, row1) => {
    stats.total_sales = row1 ? (row1.total_sales || 0) : 0;
    stats.total_orders = row1 ? (row1.total_orders || 0) : 0;

    db.get("SELECT COUNT(*) as active_customers FROM customers", [], (err, row2) => {
      stats.active_customers = row2 ? row2.active_customers : 0;

      db.all("SELECT COUNT(*) as count FROM products WHERE stock <= 5", [], (err, row3) => {
        stats.low_stock = row3 ? row3[0].count : 0;

        // Sales by categories
        db.all(`SELECT category, COUNT(*) as count FROM products group by category`, [], (err, row4) => {
          stats.categories = row4 || [];

          // Recent 5 orders
          db.all("SELECT * FROM orders ORDER BY id DESC LIMIT 5", [], (err, recent_orders) => {
            stats.recent_orders = recent_orders || [];
            res.json(stats);
          });
        });
      });
    });
  });
});

// Products CRUD
app.get('/api/products', authenticateToken, (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { name, category, price, stock, sizes, colors, image_url } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Nomi, kategoriya va narxi majburiy' });
  }

  const img = image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60';
  db.run("INSERT INTO products (name, category, price, stock, sizes, colors, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, category, price, stock || 0, sizes || '', colors || '', img],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, category, price, stock, sizes, colors, image_url: img });
    });
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { name, category, price, stock, sizes, colors, image_url } = req.body;
  const { id } = req.params;

  db.run("UPDATE products SET name = ?, category = ?, price = ?, stock = ?, sizes = ?, colors = ?, image_url = ? WHERE id = ?",
    [name, category, price, stock, sizes, colors, image_url, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Customers CRUD
app.get('/api/customers', authenticateToken, (req, res) => {
  db.all("SELECT * FROM customers ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', authenticateToken, (req, res) => {
  const { full_name, email, phone } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Ism-familiya va telefon raqami majburiy' });
  }

  db.run("INSERT INTO customers (full_name, email, phone) VALUES (?, ?, ?)",
    [full_name, email || '', phone],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, full_name, email, phone, total_spent: 0, orders_count: 0 });
    });
});

// Orders CRUD
app.get('/api/orders', authenticateToken, (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const { customer_id, items, total_amount, coupon_code, discount_amount } = req.body;
  if (!customer_id || !items || items.length === 0 || !total_amount) {
    return res.status(400).json({ error: 'Mijoz, mahsulotlar va umumiy summa kiritilishi kerak' });
  }

  // Get customer info
  db.get("SELECT full_name FROM customers WHERE id = ?", [customer_id], (err, customer) => {
    if (err || !customer) {
      return res.status(400).json({ error: 'Mijoz topilmadi' });
    }

    const itemsJson = JSON.stringify(items);
    db.run("INSERT INTO orders (customer_id, customer_name, total_amount, items, coupon_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?)",
      [customer_id, customer.full_name, total_amount, itemsJson, coupon_code || '', discount_amount || 0],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;

        // Update customer statistics
        db.run("UPDATE customers SET total_spent = total_spent + ?, orders_count = orders_count + 1 WHERE id = ?",
          [total_amount, customer_id]);

        // Deduct inventory stock
        items.forEach(item => {
          db.run("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", [item.quantity, item.id]);
        });

        res.json({ id: orderId, customer_id, customer_name: customer.full_name, total_amount, status: 'Kutilmoqda', items });
      });
  });
});

app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['Kutilmoqda', 'Yo\'lda', 'Yetkazildi', 'Bekor qilindi'].includes(status)) {
    return res.status(400).json({ error: 'Noto\'g\'ri status' });
  }

  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Catch-all to serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
