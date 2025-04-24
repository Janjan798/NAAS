const User = require('./user');
const Role = require('./role');
const Customer = require('./customer');
const Publication = require('./publication');
const Subscription = require('./subscription');
const DeliveryPersonnel = require('./deliveryPersonnel');
const DeliverySchedule = require('./deliverySchedule');
const Invoice = require('./invoice');
const Payment = require('./payment');
const Notification = require('./notification');

// Define relationships
User.belongsTo(Role);
Role.hasMany(User);

Customer.belongsTo(User);
User.hasOne(Customer);

DeliveryPersonnel.belongsTo(User);
User.hasOne(DeliveryPersonnel);

Subscription.belongsTo(Customer);
Customer.hasMany(Subscription);

Subscription.belongsTo(Publication);
Publication.hasMany(Subscription);

DeliverySchedule.belongsTo(DeliveryPersonnel);
DeliveryPersonnel.hasMany(DeliverySchedule);

DeliverySchedule.belongsTo(Subscription);
Subscription.hasMany(DeliverySchedule);

Invoice.belongsTo(Customer);
Customer.hasMany(Invoice);

Payment.belongsTo(Invoice);
Invoice.hasMany(Payment);

Notification.belongsTo(User);
User.hasMany(Notification);

module.exports = {
  User,
  Role,
  Customer,
  Publication,
  Subscription,
  DeliveryPersonnel,
  DeliverySchedule,
  Invoice,
  Payment,
  Notification
};