const express = require('express');
const router = express.Router();

const checkLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.render('login', { message: '' });
  }
};

router.get('/', checkLogin, (req, res) => {
  res.redirect('/report');
});

router.get('/dashboard', checkLogin, (req, res) => {
  res.render('index', { page: 'dashboard' });
});

router.get('/hotspot', checkLogin, (req, res) => {
  res.render('index', { page: 'hotspot' });
});

router.get('/pppoe', checkLogin, (req, res) => {
  res.render('index', { page: 'pppoe' });
});

router.get('/report', checkLogin, (req, res) => {
  res.render('index', { page: 'report' });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
