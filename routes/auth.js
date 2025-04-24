const express = require('express');
const routerAuth = express.Router();
const { register, login } = require('../controllers/authController');
routerAuth.post('/register', register);
routerAuth.post('/login', login);
module.exports = routerAuth;
