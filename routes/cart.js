const express = require('express');
const { prepare } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const items = prepare('SELECT c.id, c.quantity, p.id as product_id, p.name, p.slug, p.price, p.compare_price, p.image, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?').all(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ items, total: Math.round(total * 100) / 100, count: items.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID required' });
    const product = prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const existing = prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
    if (existing) { prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id); }
    else { prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?,?,?)').run(req.user.id, product_id, quantity); }
    res.json({ message: 'Added to cart' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) { prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id); }
    else { prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.user.id); }
    res.json({ message: 'Cart updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try { prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id); res.json({ message: 'Removed' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/', authenticateToken, (req, res) => {
  try { prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id); res.json({ message: 'Cart cleared' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
