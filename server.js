require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, prepare } = require('./database');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/categories', require('./routes/categories'));
  app.use('/api/cart', require('./routes/cart'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/wishlist', require('./routes/wishlist'));
  app.use('/api/newsletter', require('./routes/newsletter'));

  app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
    try {
      const totalProducts = prepare('SELECT COUNT(*) as count FROM products').get().count;
      const totalOrders = prepare('SELECT COUNT(*) as count FROM orders').get().count;
      const totalUsers = prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('customer').count;
      const totalRevenue = prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != ?').get('cancelled').total;
      const recentOrders = prepare('SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5').all();
      const parsed = recentOrders.map(o => ({ ...o, items: JSON.parse(o.items) }));
      res.json({ totalProducts, totalOrders, totalUsers, totalRevenue: Math.round(totalRevenue * 100) / 100, recentOrders: parsed });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    try {
      const users = prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
      res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

  app.listen(PORT, () => console.log(`\n  🛍️  LUXE Shop is running at http://localhost:${PORT}\n`));
}

startServer().catch(console.error);
