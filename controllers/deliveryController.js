const { DeliverySchedule, DeliveryPersonnel, Subscription, Publication, Customer } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Generate daily delivery schedules
exports.generateDailySchedules = async (req, res) => {
  try {
    const { date } = req.body;
    const scheduleDate = date || new Date().toISOString().split('T')[0];
    
    // Find all active subscriptions
    const activeSubscriptions = await Subscription.findAll({
      where: {
        status: 'ACTIVE',
        startDate: {
          [Op.lte]: scheduleDate
        },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gt]: scheduleDate } }
        ]
      },
      include: [
        { model: Publication },
        { model: Customer }
      ]
    });
    
    // Filter subscriptions based on publication frequency
    const scheduledSubscriptions = activeSubscriptions.filter(subscription => {
      const publication = subscription.Publication;
      const scheduleDay = new Date(scheduleDate).getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if publication should be delivered on this day based on frequency
      switch (publication.frequency) {
        case 'DAILY':
          return true;
        case 'WEEKLY':
          // Assume weekly publications are delivered on Sunday
          return scheduleDay === 0;
        case 'BIWEEKLY':
          // Assume biweekly publications are delivered on alternate Sundays
          const startDate = new Date(subscription.startDate);
          const diffTime = Math.abs(new Date(scheduleDate) - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return scheduleDay === 0 && Math.floor(diffDays / 7) % 2 === 0;
        case 'MONTHLY':
          // Assume monthly publications are delivered on 1st of the month
          return new Date(scheduleDate).getDate() === 1;
        default:
          return false;
      }
    });
    
    // Get all delivery personnel
    const deliveryPersonnel = await DeliveryPersonnel.findAll({
      where: { isActive: true }
    });
    
    if (deliveryPersonnel.length === 0) {
      return res.status(400).json({ message: 'No active delivery personnel available' });
    }
    
    // Assign subscriptions to delivery personnel
    // Simple algorithm: distribute evenly among delivery personnel
    const createdSchedules = [];
    
    for (let i = 0; i < scheduledSubscriptions.length; i++) {
      const subscription = scheduledSubscriptions[i];
      const personnelIndex = i % deliveryPersonnel.length;
      const personnel = deliveryPersonnel[personnelIndex];
      
      // Check if schedule already exists
      const existingSchedule = await DeliverySchedule.findOne({
        where: {
          date: scheduleDate,
          SubscriptionId: subscription.id
        }
      });
      
      if (!existingSchedule) {
        const schedule = await DeliverySchedule.create({
          date: scheduleDate,
          status: 'SCHEDULED',
          SubscriptionId: subscription.id,
          DeliveryPersonnelId: personnel.id
        });
        
        createdSchedules.push(schedule);
      }
    }
    
    res.status(200).json({
      message: 'Delivery schedules generated successfully',
      schedulesCreated: createdSchedules.length,
      date: scheduleDate
    });
  } catch (error) {
   
    // Continuing from the deliveryController.js file

    res.status(500).json({ message: 'Failed to generate delivery schedules', error: error.message });
  }
};

// Get delivery personnel schedule
exports.getPersonnelSchedule = async (req, res) => {
  try {
    const { personnelId } = req.params;
    const { date } = req.query;
    
    // Validate delivery personnel exists
    const personnel = await DeliveryPersonnel.findByPk(personnelId);
    if (!personnel) {
      return res.status(404).json({ message: 'Delivery personnel not found' });
    }
    
    // Build query conditions
    const whereConditions = {
      DeliveryPersonnelId: personnelId
    };
    
    if (date) {
      whereConditions.date = date;
    }
    
    // Get schedules
    const schedules = await DeliverySchedule.findAll({
      where: whereConditions,
      include: [
        { 
          model: Subscription, 
          include: [
            { model: Publication },
            { model: Customer }
          ]
        }
      ],
      order: [['date', 'ASC']]
    });
    
    // Format data for delivery slip
    const formattedSchedules = schedules.map(schedule => {
      return {
        scheduleId: schedule.id,
        date: schedule.date,
        status: schedule.status,
        publication: schedule.Subscription.Publication.name,
        type: schedule.Subscription.Publication.type,
        customer: {
          name: schedule.Subscription.Customer.name,
          address: schedule.Subscription.Customer.address,
          phone: schedule.Subscription.Customer.phone
        }
      };
    });
    
    res.status(200).json({
      message: 'Delivery schedule retrieved successfully',
      personnel: {
        id: personnel.id,
        name: personnel.name
      },
      schedules: formattedSchedules
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve delivery schedule', error: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { status, notes, deliveryTime } = req.body;
    
    // Find schedule
    const schedule = await DeliverySchedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Delivery schedule not found' });
    }
    
    // Update status
    schedule.status = status;
    if (notes) schedule.notes = notes;
    
    // If delivered, record the time
    if (status === 'DELIVERED') {
      schedule.deliveryTime = deliveryTime || new Date();
    }
    
    await schedule.save();
    
    res.status(200).json({
      message: 'Delivery status updated successfully',
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update delivery status', error: error.message });
  }
};

// Calculate commission for delivery personnel
exports.calculateCommission = async (req, res) => {
  try {
    const { personnelId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate delivery personnel exists
    const personnel = await DeliveryPersonnel.findByPk(personnelId);
    if (!personnel) {
      return res.status(404).json({ message: 'Delivery personnel not found' });
    }
    
    // Build date range conditions
    const dateConditions = {};
    if (startDate) {
      dateConditions[Op.gte] = startDate;
    }
    if (endDate) {
      dateConditions[Op.lte] = endDate;
    }
    
    // Get completed deliveries
    const deliveries = await DeliverySchedule.findAll({
      where: {
        DeliveryPersonnelId: personnelId,
        status: 'DELIVERED',
        ...(Object.keys(dateConditions).length > 0 && { date: dateConditions })
      },
      include: [
        { 
          model: Subscription, 
          include: [
            { model: Publication }
          ]
        }
      ]
    });
    
    // Calculate commission
    let totalValue = 0;
    const deliveryDetails = deliveries.map(delivery => {
      const publicationPrice = delivery.Subscription.Publication.price;
      totalValue += parseFloat(publicationPrice);
      
      return {
        date: delivery.date,
        publication: delivery.Subscription.Publication.name,
        price: publicationPrice
      };
    });
    
    const commissionRate = personnel.commissionRate / 100; // Convert percentage to decimal
    const commissionAmount = totalValue * commissionRate;
    
    res.status(200).json({
      message: 'Commission calculated successfully',
      personnelName: personnel.name,
      commissionRate: `${personnel.commissionRate}%`,
      totalDeliveries: deliveries.length,
      totalValue: totalValue.toFixed(2),
      commissionAmount: commissionAmount.toFixed(2),
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Current date'
      },
      deliveryDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate commission', error: error.message });
  }
};
