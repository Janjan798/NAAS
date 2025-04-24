const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('CASH', 'CHEQUE', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'E_WALLET'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING
  },
  chequeNumber: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },
  receiptNumber: {
    type: DataTypes.STRING,
    unique: true
  }
});

module.exports = Payment;
