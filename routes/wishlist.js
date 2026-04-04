const express = require('express');
const { prepare } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const items = prepare('SELECT w.id, w.created_at, p.id as product_id, p.name, p.slug, p.price, p.compare_price, p.image, p.rating, p.stock FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ? ORDER BY w.created_at DESC').all(req.user.id);
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID required' });
    prepare('INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?,?)').run(req.user.id, product_id);
    res.json({ message: 'Added to wishlist' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:product_id', authenticateToken, (req, res) => {
  try { prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.product_id); res.json({ message: 'Removed' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/check/:product_id', authenticateToken, (req, res) => {
  try {
    const item = prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(req.user.id, req.params.product_id);
    res.json({ in_wishlist: !!item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
