const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');
const deliveryRoutes = require('./routes/delivery');
const billingRoutes = require('./routes/billing');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notification');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/delivery', authenticateToken, deliveryRoutes);
app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Database initialization and server start
db.authenticate()
  .then(() => {
    console.log('Database connection established');
    return db.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });
