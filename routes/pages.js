const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../lib/authMiddleware');

router.get('/login', authMiddleware, (req, res) => {
  if (!req.user) return res.render('login', { message: '' });
  res.redirect('/dashboard');
});

router.get('/', authMiddleware, (req, res) => {
  res.redirect('/dashboard');
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('index', { page: 'dashboard' });
});

router.get('/hotspot', authMiddleware, (req, res) => {
  res.render('index', { page: 'hotspot' });
});

router.get('/pppoe', authMiddleware, (req, res) => {
  res.render('index', { page: 'pppoe' });
});

router.get('/report', authMiddleware, (req, res) => {
  res.render('index', { page: 'report' });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
