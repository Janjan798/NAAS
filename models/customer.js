const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  outstandingDue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  dueSince: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'DISCONTINUED'),
    defaultValue: 'ACTIVE'
  }
});

module.exports = Customer;
