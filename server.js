require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const login = require('./routes/login');
const pages = require('./routes/pages');
const system = require('./routes/api/system');
const hotspot = require('./routes/api/hotspot');

const app = express();
const port = process.env.PORT || 4000;

//bootstrap resources
const bootstrap_css = './node_modules/bootstrap/dist/css';
const bootstrap_js = './node_modules/bootstrap/dist/js';
const jquery_js = './node_modules/jquery/dist';

app.use('/css', express.static(path.join(__dirname, bootstrap_css)));
app.use('/js', express.static(path.join(__dirname, bootstrap_js)));
app.use('/js', express.static(path.join(__dirname, jquery_js)));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({ secret: 'asfxdf14', cookie: { maxAge: 3600000 }, resave: true })
);

app.use(pages);
app.use('/login', login);
app.use('/api/system', system);
app.use('/api/hotspot', hotspot);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
