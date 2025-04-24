const express = require('express');
const routerNot = express.Router();
const {
  sendPendingNotifications,
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

routerNot.post('/send', sendPendingNotifications);
routerNot.get('/', getUserNotifications);
routerNot.patch('/:id/read', markAsRead);

module.exports = routerNot;
