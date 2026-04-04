const express = require('express');
const { prepare } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const cats = prepare('SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count FROM categories c ORDER BY c.name').all();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', (req, res) => {
  try {
    const cat = prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = prepare('INSERT INTO categories (name, slug, description, image) VALUES (?,?,?,?)').run(name, slug, description || '', image || '');
    res.status(201).json({ message: 'Category created', id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try { prepare('DELETE FROM categories WHERE id = ?').run(req.params.id); res.json({ message: 'Category deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
