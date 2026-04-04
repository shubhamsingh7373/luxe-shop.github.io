const express = require('express');
const { prepare } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { category, search, sort, order = 'asc', min_price, max_price, featured, page = 1, limit = 12 } = req.query;
    let where = '1=1'; const params = [];
    if (category) { where += ' AND c.slug = ?'; params.push(category); }
    if (search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (min_price) { where += ' AND p.price >= ?'; params.push(parseFloat(min_price)); }
    if (max_price) { where += ' AND p.price <= ?'; params.push(parseFloat(max_price)); }
    if (featured === '1') { where += ' AND p.featured = 1'; }

    const total = prepare(`SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${where}`).get(...params).total;

    const validSorts = ['price', 'name', 'created_at', 'rating'];
    let orderBy = 'p.created_at DESC';
    if (sort && validSorts.includes(sort)) orderBy = `p.${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const products = prepare(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    res.json({ products, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.get('/:slug', (req, res) => {
  try {
    const product = prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?').get(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const reviews = prepare('SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC').all(product.id);
    const related = prepare('SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 4').all(product.category_id, product.id);
    res.json({ ...product, reviews, related });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, price, compare_price, category_id, image, stock, featured, tags } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = prepare('INSERT INTO products (name, slug, description, price, compare_price, category_id, image, stock, featured, tags) VALUES (?,?,?,?,?,?,?,?,?,?)').run(name, slug, description || '', price, compare_price || 0, category_id || null, image || '', stock || 0, featured ? 1 : 0, JSON.stringify(tags || []));
    res.status(201).json({ message: 'Product created', id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try { prepare('DELETE FROM products WHERE id = ?').run(req.params.id); res.json({ message: 'Product deleted' }); }
  catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.post('/:id/reviews', authenticateToken, (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });
    prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)').run(req.params.id, req.user.id, rating, comment || '');
    const stats = prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?').get(req.params.id);
    prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?').run(Math.round(stats.avg_rating * 10) / 10, stats.count, req.params.id);
    res.status(201).json({ message: 'Review added' });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

module.exports = router;
