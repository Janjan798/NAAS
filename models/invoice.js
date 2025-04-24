// =========== models/invoice.js ===========
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'ISSUED'
  },
  billingPeriodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  billingPeriodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = Invoice;