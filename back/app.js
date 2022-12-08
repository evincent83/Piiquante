const express = require("express"); // framework web
const cors = require('cors'); // CORS Cross-origin resource sharing
const mongoose = require("mongoose"); // framework DB
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const bodyParser = require('body-parser'); // Intégrer dans express Middleware req.body
const helmet = require('helmet'); // Security
const path = require('path'); // Fichier et rep
const cookieSession = require('cookie-session') // Security
const app = express();
// Permet d'utiliser un fichier .env afin de se connecter à la DB sans afficher les informations de connexion dans le fichier app.js
require('dotenv').config()

// MongoDB
mongoose
  .connect(process.env.DB_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// CORS Cross-origin resource sharing - Allow Origin / Headers / Methods
app.use(cors());

// Cookie session
app.use(cookieSession({
  name: 'session',
  secret: process.env.secret,

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// (OWASP) CSP / hidePoweredBy / hsts / ieNoOpen / noCache / noSniff / frameguard / xssFilter
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })); // Pour les images

// req.body can contain any values of any types (not only string)
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use json
app.use(bodyParser.json());
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
module.exports = app;