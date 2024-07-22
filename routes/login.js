const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Users = [
  { id: 1, username: 'mgwadmin', password: 'mgw2021' },
  { id: 2, username: 'elmer', password: '04261994' },
];

router.post('/', (req, res) => {
  const { username, password } = req.body;

  if (username == '' || password == '') {
    return res.render('login', {
      message: 'Username or password must not empty!',
    });
  }

  const hasUser = Users.find(
    (user) => user.username == username && user.password == password
  );

  if (hasUser) {
    const token = jwt.sign({ id: hasUser.id }, process.env.SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 1800000, //expires after 30mins
    });
    return res.redirect('/dashboard');
  } else {
    return res.render('login', { message: 'Incorrect username or password' });
  }
});

module.exports = router;
