// controllers/reportController.js

const {
  DeliverySchedule,
  DeliveryPersonnel,
  Subscription,
  Publication,
  Customer,
  Invoice,
  Payment
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Generate delivery summary
exports.generateDeliverySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateConditions = {};
    if (startDate) dateConditions[Op.gte] = startDate;
    if (endDate)   dateConditions[Op.lte] = endDate;

    const deliveries = await DeliverySchedule.findAll({
      where: {
        ...(Object.keys(dateConditions).length && { date: dateConditions })
      },
      include: [
        { model: DeliveryPersonnel },
        {
          model: Subscription,
          include: [ Publication, Customer ]
        }
      ]
    });

    const statusCounts = { SCHEDULED:0, DELIVERED:0, MISSED:0, SUSPENDED:0 };
    const publicationCounts = {};
    const personnelStats = {};

    deliveries.forEach(d => {
      statusCounts[d.status] = (statusCounts[d.status]||0) + 1;
      const pubName = d.Subscription.Publication.name;
      publicationCounts[pubName] = (publicationCounts[pubName]||0) + 1;

      const name = d.DeliveryPersonnel.name;
      if (!personnelStats[name]) {
        personnelStats[name] = { total:0, delivered:0, missed:0, successRate:0 };
      }
      personnelStats[name].total++;
      if (d.status === 'DELIVERED') personnelStats[name].delivered++;
      if (d.status === 'MISSED')    personnelStats[name].missed++;
      personnelStats[name].successRate =
        (personnelStats[name].delivered / personnelStats[name].total) * 100;
    });

    res.status(200).json({
      message: 'Delivery summary generated successfully',
      period: {
        startDate: startDate || 'All time',
        endDate:   endDate   || 'Current date'
      },
      totalDeliveries: deliveries.length,
      statusBreakdown: statusCounts,
      publicationBreakdown: publicationCounts,
      personnelPerformance: personnelStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate delivery summary', error: error.message });
  }
};

// Generate financial report
exports.generateFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateConditions = {};
    if (startDate) dateConditions[Op.gte] = startDate;
    if (endDate)   dateConditions[Op.lte] = endDate;

    const invoices = await Invoice.findAll({
      where: dateConditions && { issueDate: dateConditions },
      include: [ Customer, Payment ]
    });
    const payments = await Payment.findAll({
      where: dateConditions && { paymentDate: dateConditions },
      include: [ Invoice ]
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const totalPaid     = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);
    const outstanding   = totalInvoiced - totalPaid;

    const invoiceStatusCounts = { ISSUED:0, PAID:0, OVERDUE:0, CANCELLED:0 };
    invoices.forEach(inv => {
      invoiceStatusCounts[inv.status] = (invoiceStatusCounts[inv.status]||0) + 1;
    });

    const paymentMethodCounts = {
      CASH:0, CHEQUE:0, CREDIT_CARD:0, DEBIT_CARD:0, UPI:0, NET_BANKING:0, E_WALLET:0
    };
    payments.forEach(pay => {
      paymentMethodCounts[pay.paymentMethod] = (paymentMethodCounts[pay.paymentMethod]||0) + 1;
    });

    const monthlyData = {};
    invoices.forEach(inv => {
      const m = `${inv.issueDate.getFullYear()}-${String(inv.issueDate.getMonth()+1).padStart(2,'0')}`;
      monthlyData[m] = monthlyData[m] || { invoiced:0, collected:0 };
      monthlyData[m].invoiced += parseFloat(inv.total);
    });
    payments.forEach(pay => {
      const m = `${pay.paymentDate.getFullYear()}-${String(pay.paymentDate.getMonth()+1).padStart(2,'0')}`;
      monthlyData[m] = monthlyData[m] || { invoiced:0, collected:0 };
      monthlyData[m].collected += parseFloat(pay.amount);
    });

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month,data]) => ({
        month,
        invoiced: data.invoiced,
        collected: data.collected,
        collectionRate: data.invoiced ? (data.collected/data.invoiced)*100 : 0
      }))
      .sort((a,b) => a.month.localeCompare(b.month));

    res.status(200).json({
      message: 'Financial report generated successfully',
      period: {
        startDate: startDate || 'All time',
        endDate:   endDate   || 'Current date'
      },
      summary: {
        totalInvoiced:     totalInvoiced.toFixed(2),
        totalPaid:         totalPaid.toFixed(2),
        outstandingAmount: outstanding.toFixed(2),
        collectionRate:    totalInvoiced ? ((totalPaid/totalInvoiced)*100).toFixed(2)+'%' : '0%'
      },
      invoices: { total: invoices.length, byStatus: invoiceStatusCounts },
      payments: { total: payments.length, byMethod: paymentMethodCounts },
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate financial report', error: error.message });
  }
};

// Generate customer report
exports.generateCustomerReport = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [ Subscription, Invoice ]
    });

    const customerStats = customers.map(cust => {
      const activeSubs = cust.Subscriptions.filter(s => s.status === 'ACTIVE').length;
      const totalInv   = cust.Invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const paidCount  = cust.Invoices.filter(inv => inv.status === 'PAID').length;
      const totalCount = cust.Invoices.length;
      const payRate    = totalCount ? (paidCount/totalCount)*100 : 0;

      return {
        id: cust.id,
        name: cust.name,
        status: cust.status,
        subscriptions: { total: cust.Subscriptions.length, active: activeSubs },
        financial: {
          totalInvoiced:    totalInv.toFixed(2),
          outstandingDue:   parseFloat(cust.outstandingDue).toFixed(2),
          paymentRate:      payRate.toFixed(2) + '%'
        }
      };
    });

    const totalCustomers       = customers.length;
    const activeCustomersCount = customers.filter(c => c.status==='ACTIVE').length;
    const discontinuedCount    = customers.filter(c => c.status==='DISCONTINUED').length;
    const totalSubs            = customers.reduce((sum,c)=>sum+c.Subscriptions.length,0);
    const activeSubsTotal      = customers.reduce((sum,c)=>sum+c.Subscriptions.filter(s=>s.status==='ACTIVE').length,0);

    res.status(200).json({
      message: 'Customer report generated successfully',
      summary: {
        totalCustomers,
        activeCustomers:       activeCustomersCount,
        discontinuedCustomers: discontinuedCount,
        discontinuationRate:   ((discontinuedCount/totalCustomers)*100).toFixed(2)+'%',
        totalSubscriptions:    totalSubs,
        activeSubscriptions:   activeSubsTotal,
        averageSubscriptionsPerCustomer: (totalSubs/totalCustomers).toFixed(2)
      },
      customers: customerStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate customer report', error: error.message });
  }
};
