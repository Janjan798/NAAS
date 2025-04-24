const { Invoice, Payment, Customer, Subscription, Publication, Notification, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Generate monthly invoices
exports.generateMonthlyInvoices = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // If month/year not provided, use current month
    const currentDate = new Date();
    const billingMonth = month || currentDate.getMonth() + 1; // 1-12
    const billingYear = year || currentDate.getFullYear();
    
    // Calculate billing period
    const billingPeriodStart = new Date(billingYear, billingMonth - 1, 1);
    const billingPeriodEnd = new Date(billingYear, billingMonth, 0);
    
    // Get all active customers
    const customers = await Customer.findAll({
      where: {
        status: {
          [Op.ne]: 'DISCONTINUED'
        }
      },
      include: [
        { 
          model: Subscription,
          where: {
            status: {
              [Op.in]: ['ACTIVE', 'SUSPENDED']
            },
            startDate: {
              [Op.lte]: billingPeriodEnd
            },
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: billingPeriodStart } }
            ]
          },
          include: [{ model: Publication }]
        },
        { model: User }
      ]
    });
    
    const generatedInvoices = [];
    
    // Generate invoice for each customer
    for (const customer of customers) {
      // Check if invoice already exists for this period
      const existingInvoice = await Invoice.findOne({
        where: {
          CustomerId: customer.id,
          billingPeriodStart,
          billingPeriodEnd
        }
      });
      
      if (existingInvoice) {
        continue; // Skip if invoice already exists
      }
      
      // Calculate subtotal based on active subscriptions
      let subtotal = 0;
      
      customer.Subscriptions.forEach(subscription => {
        // For each subscription, calculate days in billing period
        let startDate = new Date(Math.max(
          subscription.startDate.getTime(),
          billingPeriodStart.getTime()
        ));
        
        let endDate = subscription.endDate
          ? new Date(Math.min(subscription.endDate.getTime(), billingPeriodEnd.getTime()))
          : billingPeriodEnd;
        
        // Calculate days subscription was active in billing period
        const publicationPrice = subscription.Publication.price;
        const daysInMonth = billingPeriodEnd.getDate();
        let activeDays = daysInMonth;
        
        // Adjust for suspended subscriptions
        if (subscription.status === 'SUSPENDED' && subscription.suspensionStartDate && subscription.suspensionEndDate) {
          const suspensionStart = new Date(subscription.suspensionStartDate);
          const suspensionEnd = new Date(subscription.suspensionEndDate);
          
          // If suspension overlaps with billing period
          if (suspensionStart <= billingPeriodEnd && suspensionEnd >= billingPeriodStart) {
            const overlapStart = new Date(Math.max(suspensionStart.getTime(), billingPeriodStart.getTime()));
            const overlapEnd = new Date(Math.min(suspensionEnd.getTime(), billingPeriodEnd.getTime()));
            
            // Calculate suspended days in the billing period
            const suspendedDays = (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24) + 1;
            activeDays -= suspendedDays;
          }
        }
        
        // Calculate cost for this subscription
        const subscriptionCost = (publicationPrice / daysInMonth) * activeDays;
        subtotal += subscriptionCost;
      });
      
      // Create invoice with 0% tax for now
      const total = subtotal;
      const invoiceNumber = `INV-${billingYear}${String(billingMonth).padStart(2, '0')}-${uuidv4().substring(0, 8)}`;
      const dueDate = new Date(billingYear, billingMonth, 15); // Due on 15th of next month
      
      const invoice = await Invoice.create({
        invoiceNumber,
        issueDate: new Date(),
        dueDate,
        subtotal,
        tax: 0,
        total,
        status: 'ISSUED',
        billingPeriodStart,
        billingPeriodEnd,
        CustomerId: customer.id
      });
      
      generatedInvoices.push(invoice);
      
      // Create notification for customer
      await Notification.create({
        UserId: customer.UserId,
        type: 'PAYMENT_REMINDER',
        content: `Your monthly invoice for ${billingMonth}/${billingYear} has been generated. Total amount: ${total.toFixed(2)}. Due date: ${dueDate.toDateString()}.`,
        channel: 'EMAIL',
        status: 'PENDING'
      });
    }
    
    res.status(200).json({
      message: 'Monthly invoices generated successfully',
      period: `${billingMonth}/${billingYear}`,
      invoicesGenerated: generatedInvoices.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate invoices', error: error.message });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, chequeNumber, transactionId } = req.body;
    
    // Find invoice
    const invoice = await Invoice.findByPk(invoiceId, {
      include: [{ model: Customer, include: [{ model: User }] }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Validate payment amount
    if (parseFloat(amount) !== parseFloat(invoice.total)) {
      return res.status(400).json({ 
        message: 'Payment amount must match invoice total',
        expected: parseFloat(invoice.total),
        received: parseFloat(amount)
      });
    }
    
    // Create payment
    const receiptNumber = `RCPT-${new Date().toISOString().slice(0, 10)}-${uuidv4().substring(0, 8)}`;
    
    const payment = await Payment.create({
      amount,
      paymentDate: new Date(),
      paymentMethod,
      transactionId,
      chequeNumber,
      status: 'COMPLETED',
      receiptNumber,
      InvoiceId: invoice.id
    });
    
    // Update invoice status
    invoice.status = 'PAID';
    await invoice.save();
    
    // Update customer outstanding dues
    const customer = invoice.Customer;
    
    // Reset outstanding dues if this was the only unpaid invoice
    const unpaidInvoices = await Invoice.findAll({
      where: {
        CustomerId: customer.id,
        status: {
          [Op.in]: ['ISSUED', 'OVERDUE']
        }
      }
    });
    
    if (unpaidInvoices.length === 0) {
      customer.outstandingDue = 0;
      customer.dueSince = null;
      
      // If customer was suspended due to payment, reactivate
      if (customer.status === 'SUSPENDED') {
        customer.status = 'ACTIVE';
      }
      
      await customer.save();
    }
    
    // Create notification
    await Notification.create({
      UserId: customer.UserId,
      type: 'PAYMENT_CONFIRMATION',
      content: `Your payment of ${amount} for invoice ${invoice.invoiceNumber} has been received. Receipt number: ${receiptNumber}.`,
      channel: 'EMAIL',
      status: 'PENDING'
    });
    
    res.status(200).json({
      message: 'Payment processed successfully',
      payment,
      receiptNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

// Get customer invoices
exports.getCustomerInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Validate customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get all invoices for customer
    const invoices = await Invoice.findAll({
      where: { CustomerId: customerId },
      include: [{ model: Payment }],
      order: [['issueDate', 'DESC']]
    });
    
    res.status(200).json({
      message: 'Invoices retrieved successfully',
      customer: {
        id: customer.id,
        name: customer.name,
        outstandingDue: customer.outstandingDue
      },
      invoices
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve invoices', error: error.message });
  }
};

// Process overdue invoices
exports.processOverdueInvoices = async (req, res) => {
  try {
    // Find all overdue invoices
    const currentDate = new Date();
    
    const overdueInvoices = await Invoice.findAll({
      where: {
        dueDate: {
          [Op.lt]: currentDate
        },
        status: {
          [Op.in]: ['ISSUED']
        }
      },
      include: [{ model: Customer, include: [{ model: User }] }]
    });
    
    let updatedCount = 0;
    let notificationsCount = 0;
    let suspendedCustomers = 0;
    
    // Process each overdue invoice
    for (const invoice of overdueInvoices) {
      // Mark invoice as overdue
      invoice.status = 'OVERDUE';
      await invoice.save();
      updatedCount++;
      
      const customer = invoice.Customer;
      
      // Update customer's outstanding dues
      if (!customer.dueSince) {
        customer.dueSince = invoice.dueDate;
      }
      
      // Calculate months overdue
      const dueDate = new Date(customer.dueSince);
      const monthsOverdue = (
        (currentDate.getFullYear() - dueDate.getFullYear()) * 12 +
        (currentDate.getMonth() - dueDate.getMonth())
      );
      
      // If overdue for more than 2 months, suspend customer
      if (monthsOverdue >= 2 && customer.status !== 'DISCONTINUED') {
        customer.status = 'DISCONTINUED';
        suspendedCustomers++;
        
        // Suspend all active subscriptions
        const subscriptions = await Subscription.findAll({
          where: {
            CustomerId: customer.id,
            status: 'ACTIVE'
          }
        });
        
        for (const subscription of subscriptions) {
          subscription.status = 'CANCELLED';
          subscription.cancellationDate = currentDate;
          subscription.endDate = currentDate;
          await subscription.save();
        }
        
        // Send discontinuation notification
        await Notification.create({
          UserId: customer.UserId,
          type: 'PAYMENT_REMINDER',
          content: `Your subscription has been discontinued due to outstanding dues for more than 2 months. Please clear your dues to reactivate your subscription.`,
          channel: 'EMAIL',
          status: 'PENDING'
        });
        notificationsCount++;
      } 
      // If not yet discontinued, send reminder
      else if (customer.status !== 'DISCONTINUED') {
        // Send overdue notification
        await Notification.create({
          UserId: customer.UserId,
          type: 'PAYMENT_REMINDER',
          content: `Reminder: Your invoice ${invoice.invoiceNumber} is overdue. Please make the payment at your earliest convenience to avoid service disruption.`,
          channel: 'EMAIL',
          status: 'PENDING'
        });
        notificationsCount++;
      }
      
      await customer.save();
    }
    
    res.status(200).json({
      message: 'Overdue invoices processed successfully',
      processedCount: overdueInvoices.length,
      updatedCount,
      notificationsCount,
      suspendedCustomers
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process overdue invoices', error: error.message });
  }
};
