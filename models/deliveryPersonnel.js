// =========== models/deliveryPersonnel.js ===========
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryPersonnel = sequelize.define('DeliveryPersonnel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  commissionRate: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 2.50  // 2.5% as mentioned in requirements
  }
});

module.exports = DeliveryPersonnel;