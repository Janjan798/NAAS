// =========== models/subscription.js ===========
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'),
    defaultValue: 'ACTIVE'
  },
  suspensionStartDate: {
    type: DataTypes.DATEONLY
  },
  suspensionEndDate: {
    type: DataTypes.DATEONLY
  },
  modificationDate: {
    type: DataTypes.DATE
  },
  cancellationDate: {
    type: DataTypes.DATE
  },
  billingCycle: {
    type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'BIANNUALLY', 'ANNUALLY'),
    defaultValue: 'MONTHLY'
  }
});

module.exports = Subscription;