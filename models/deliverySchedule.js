const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliverySchedule = sequelize.define('DeliverySchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'DELIVERED', 'MISSED', 'SUSPENDED'),
    defaultValue: 'SCHEDULED'
  },
  deliveryTime: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = DeliverySchedule;