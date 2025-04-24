const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('PAYMENT_REMINDER', 'SUBSCRIPTION_CONFIRMATION', 'DELIVERY_UPDATE', 'PAYMENT_CONFIRMATION', 'SUBSCRIPTION_MODIFICATION'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED', 'READ'),
    defaultValue: 'PENDING'
  },
  sentAt: {
    type: DataTypes.DATE
  }
});

module.exports = Notification;
