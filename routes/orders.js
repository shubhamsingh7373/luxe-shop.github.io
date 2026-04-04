const express = require('express');
const nodemailer = require('nodemailer');
const { prepare } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

let transporter;
async function initMailer() {
  if (process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER || 'shubhamkhushwaha300@gmail.com', pass: process.env.EMAIL_PASS } });
  } else {
    const testAcc = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({ host: "smtp.ethereal.email", port: 587, auth: { user: testAcc.user, pass: testAcc.pass } });
    console.log('✉️  Mailer ready: Test mode enabled (No password needed!)');
  }
}
initMailer();

router.post('/', authenticateToken, (req, res) => {
  try {
    const { shipping_address, payment_method = 'card' } = req.body;
    if (!shipping_address) return res.status(400).json({ error: 'Shipping address required' });
    const cartItems = prepare('SELECT c.quantity, p.id, p.name, p.price, p.image, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?').all(req.user.id);
    if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });
    for (const item of cartItems) { if (item.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${item.name}` }); }
    const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderItems = cartItems.map(i => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image }));
    const result = prepare('INSERT INTO orders (user_id, items, total, shipping_address, payment_method) VALUES (?,?,?,?,?)').run(req.user.id, JSON.stringify(orderItems), Math.round(total * 100) / 100, JSON.stringify(shipping_address), payment_method);
    for (const item of cartItems) { prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id); }
    prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
    res.status(201).json({ message: 'Order placed', order_id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), shipping_address: JSON.parse(o.shipping_address) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin routes MUST come before /:id to avoid Express matching 'admin' as an id param
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id';
    const params = [];
    if (status) { query += ' WHERE o.status = ?'; params.push(status); }
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const orders = prepare(query).all(...params);
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), shipping_address: JSON.parse(o.shipping_address) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','processing','shipped','delivered','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);

    // Send Email to User
    try {
      const orderInfo = prepare('SELECT o.id, u.email, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(req.params.id);
      if (orderInfo && transporter) {
        const trackingText = ['shipped', 'delivered'].includes(status) ? `<p>🎯 Tracking ID: <b style="color:#10b981">TRK-${827000 + orderInfo.id * 812}LUXE</b></p>` : '';
        const info = await transporter.sendMail({
          from: '"LUXE Shop" <shubhamkhushwaha300@gmail.com>',
          to: orderInfo.email,
          subject: `🛒 Order Status Update - #${orderInfo.id}`,
          html: `<p>Hello <b>${orderInfo.user_name}</b>,</p><p>Your order <b>#${orderInfo.id}</b> status has been updated to: <b style="color:#7c3aed">${status.toUpperCase()}</b>.</p>${trackingText}<p>Thanks for shopping with LUXE Shop! 😊</p>`
        });
        
        if (!process.env.EMAIL_PASS) {
          console.log('\n=======================================');
          console.log('✉️ EMAIL SENT TO: ' + orderInfo.email);
          console.log('👁️ PREVIEW LINK: ' + nodemailer.getTestMessageUrl(info));
          console.log('=======================================\n');
        }
      }
    } catch(emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const order = prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...order, items: JSON.parse(order.items), shipping_address: JSON.parse(order.shipping_address) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
