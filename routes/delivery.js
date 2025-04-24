const express = require('express');
const routerDel = express.Router();
const {
  generateDailySchedules,
  getPersonnelSchedule,
  updateDeliveryStatus,
  calculateCommission
} = require('../controllers/deliveryController');

routerDel.post('/schedules', generateDailySchedules);
routerDel.get('/personnel/:personnelId/schedules', getPersonnelSchedule);
routerDel.patch('/schedules/:scheduleId', updateDeliveryStatus);
routerDel.get('/personnel/:personnelId/commission', calculateCommission);

module.exports = routerDel;
