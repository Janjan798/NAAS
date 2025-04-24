const express = require('express');
const routerBill = express.Router();
const {
  generateMonthlyInvoices,
  processPayment,
  getCustomerInvoices,
  processOverdueInvoices
} = require('../controllers/billingController');

routerBill.post('/invoices', generateMonthlyInvoices);
routerBill.get('/invoices/:customerId', getCustomerInvoices);
routerBill.post('/payments', processPayment);
routerBill.post('/invoices/process-overdue', processOverdueInvoices);

module.exports = routerBill;
