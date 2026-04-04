const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prepare } = require('../database');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const existing = prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = bcrypt.hashSync(password, 10);
    const result = prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed);
    const token = jwt.sign({ id: result.lastInsertRowid, email, name, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Account created', token, user: { id: result.lastInsertRowid, name, email, role: 'customer' } });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = prepare('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (name) prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
    if (avatar) prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.user.id);
    res.json({ message: 'Profile updated' });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

// Step 1: Verify email exists (returns a reset token valid for one use, stored in memory)
const resetTokens = new Map(); // email -> { token, expires }

router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = prepare('SELECT id, name FROM users WHERE email = ?').get(email);
    if (!user) return res.status(404).json({ error: 'No account found with this email' });
    // Generate a simple 6-digit OTP-style token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(email, { token, expires: Date.now() + 15 * 60 * 1000 }); // 15 min
    // In production, send via email. For now, return it so user can use it directly.
    res.json({ message: 'Reset token generated', token, name: user.name });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

router.post('/reset-password', (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'Email, token, and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const entry = resetTokens.get(email);
    if (!entry) return res.status(400).json({ error: 'No reset request found. Please request again.' });
    if (Date.now() > entry.expires) { resetTokens.delete(email); return res.status(400).json({ error: 'Reset token has expired. Please request again.' }); }
    if (entry.token !== token) return res.status(400).json({ error: 'Invalid reset code' });
    const hashed = bcrypt.hashSync(newPassword, 10);
    prepare('UPDATE users SET password = ? WHERE email = ?').run(hashed, email);
    resetTokens.delete(email);
    res.json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ error: 'Server error: ' + err.message }); }
});

module.exports = router;

