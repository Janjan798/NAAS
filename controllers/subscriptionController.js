const { Subscription, Publication, Customer, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { customerId, publicationId, startDate, billingCycle } = req.body;
    
    // Validate customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Validate publication exists
    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      where: {
        CustomerId: customerId,
        PublicationId: publicationId,
        status: {
          [Op.notIn]: ['CANCELLED', 'EXPIRED']
        }
      }
    });
    
    if (existingSubscription) {
      return res.status(400).json({ message: 'Customer already has an active subscription for this publication' });
    }
    
    // Create subscription
    const subscription = await Subscription.create({
      CustomerId: customerId,
      PublicationId: publicationId,
      startDate,
      billingCycle,
      status: 'ACTIVE'
    });
    
    // Create notification
    await Notification.create({
      UserId: customer.UserId,
      type: 'SUBSCRIPTION_CONFIRMATION',
      content: `Your subscription to ${publication.name} has been confirmed and will start on ${startDate}.`,
      channel: 'EMAIL',
      status: 'PENDING'
    });
    
    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subscription', error: error.message });
  }
};

// Modify subscription
exports.modifySubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { billingCycle, status } = req.body;
    
    // Find subscription
    const subscription = await Subscription.findByPk(id, {
      include: [
        { model: Publication },
        { model: Customer, include: [{ model: User }] }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Verify one week notice for modifications
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    // Update subscription
    subscription.billingCycle = billingCycle || subscription.billingCycle;
    subscription.status = status || subscription.status;
    subscription.modificationDate = today;
    
    await subscription.save();
    
    // Create notification
    await Notification.create({
      UserId: subscription.Customer.UserId,
      type: 'SUBSCRIPTION_MODIFICATION',
      content: `Your subscription to ${subscription.Publication.name} has been modified.`,
      channel: 'EMAIL',
      status: 'PENDING'
    });
    
    res.status(200).json({
      message: 'Subscription modified successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to modify subscription', error: error.message });
  }
};

// Suspend subscription
exports.suspendSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspensionStartDate, suspensionEndDate } = req.body;
    
    // Find subscription
    const subscription = await Subscription.findByPk(id, {
      include: [
        { model: Publication },
        { model: Customer, include: [{ model: User }] }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Verify one week notice for suspensions
    const today = new Date();
    const suspensionStart = new Date(suspensionStartDate);
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    if (suspensionStart < oneWeekFromNow) {
      return res.status(400).json({ message: 'Suspension requires minimum one week advance notice' });
    }
    
    // Update subscription
    subscription.status = 'SUSPENDED';
    subscription.suspensionStartDate = suspensionStartDate;
    subscription.suspensionEndDate = suspensionEndDate;
    subscription.modificationDate = today;
    
    await subscription.save();
    
    // Create notification
    await Notification.create({
      UserId: subscription.Customer.UserId,
      type: 'SUBSCRIPTION_MODIFICATION',
      content: `Your subscription to ${subscription.Publication.name} has been suspended from ${suspensionStartDate} to ${suspensionEndDate}.`,
      channel: 'EMAIL',
      status: 'PENDING'
    });
    
    res.status(200).json({
      message: 'Subscription suspended successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend subscription', error: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find subscription
    const subscription = await Subscription.findByPk(id, {
      include: [
        { model: Publication },
        { model: Customer, include: [{ model: User }] }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Verify one week notice for cancellations
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    // Update subscription
    subscription.status = 'CANCELLED';
    subscription.cancellationDate = today;
    subscription.endDate = oneWeekFromNow;
    
    await subscription.save();
    
    // Create notification
    await Notification.create({
      UserId: subscription.Customer.UserId,
      type: 'SUBSCRIPTION_MODIFICATION',
      content: `Your subscription to ${subscription.Publication.name} has been cancelled and will end on ${oneWeekFromNow.toISOString().split('T')[0]}.`,
      channel: 'EMAIL',
      status: 'PENDING'
    });
    
    res.status(200).json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
  }
};

// Get customer subscriptions
exports.getCustomerSubscriptions = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const subscriptions = await Subscription.findAll({
      where: { CustomerId: customerId },
      include: [{ model: Publication }]
    });
    
    res.status(200).json({
      message: 'Subscriptions retrieved successfully',
      subscriptions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve subscriptions', error: error.message });
  }
};
