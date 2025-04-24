const express = require('express');
const routerRep = express.Router();
const {
  generateDeliverySummary,
  generateFinancialReport,
  generateCustomerReport
} = require('../controllers/reportController');

routerRep.get('/delivery', generateDeliverySummary);
routerRep.get('/financial', generateFinancialReport);
routerRep.get('/customers', generateCustomerReport);

module.exports = routerRep;
