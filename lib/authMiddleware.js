const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.cookie
    ? req.headers.cookie.split('token=')[1]
    : null;
  if (!token) return res.render('login', { message: '' });

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) return res.render('login', { message: 'Error token' });
    req.user = user;
    next();
  });
};

module.exports = { authMiddleware };
