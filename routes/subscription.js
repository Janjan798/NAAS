const express = require('express');
const routerSub = express.Router();
const {
  createSubscription,
  modifySubscription,
  suspendSubscription,
  cancelSubscription,
  getCustomerSubscriptions
} = require('../controllers/subscriptionController');

routerSub.post('/', createSubscription);
routerSub.put('/:id', modifySubscription);
routerSub.patch('/:id/suspend', suspendSubscription);
routerSub.patch('/:id/cancel', cancelSubscription);
routerSub.get('/customer/:customerId', getCustomerSubscriptions);

module.exports = routerSub;
