const express = require('express');
const router = express.Router();

const Users = [
  { username: 'mgwadmin', password: 'mgw2021' },
  { username: 'elmer', password: '04261994' },
];

router.get('/', (req, res) => {
  res.render('login', { message: '' });
});

router.post('/', (req, res) => {
  const { username, password } = req.body;
  let isLogin = false;

  if (username == '' || password == '') {
    return res.render('login', {
      message: 'Username or password must not empty!',
    });
  }

  isLogin = Users.some((user) => {
    return user.username == username && user.password == password;
  });

  if (isLogin) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.render('login', { message: 'Incorrect username or password' });
  }
});

module.exports = router;
