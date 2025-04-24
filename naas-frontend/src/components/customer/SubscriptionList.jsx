import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  styled,
  useTheme,
} from '@mui/material';
import {
  Newspaper as NewspaperIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import Button from '../common/Button';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const SubscriptionChip = styled(Chip)(({ theme, type }) => {
  const colors = {
    daily: theme.palette.primary.main,
    weekly: theme.palette.secondary.main,
    monthly: theme.palette.success.main,
  };

  return {
    backgroundColor: colors[type] || theme.palette.grey[500],
    color: theme.palette.common.white,
    fontWeight: 500,
  };
});

const SubscriptionList = () => {
  const theme = useTheme();

  // Mock data - replace with actual API call
  const subscriptions = [
    {
      id: 1,
      type: 'daily',
      name: 'Daily Newspaper',
      description: 'Get your daily dose of news delivered to your doorstep every morning',
      price: 299,
      deliveryTime: '6:00 AM',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    },
    {
      id: 2,
      type: 'weekly',
      name: 'Weekend Edition',
      description: 'Comprehensive weekend edition with special features and supplements',
      price: 199,
      deliveryTime: '7:00 AM',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    },
    // Add more mock data as needed
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          My Subscriptions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {/* Handle new subscription */}}
        >
          Subscribe Now
        </Button>
      </Box>

      <Grid container spacing={3}>
        {subscriptions.map((subscription) => (
          <Grid item xs={12} md={6} lg={4} key={subscription.id}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {subscription.name}
                  </Typography>
                  <SubscriptionChip
                    icon={<NewspaperIcon />}
                    label={subscription.type}
                    type={subscription.type}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {subscription.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {formatPrice(subscription.price)} / month
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DeliveryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Delivery Time: {subscription.deliveryTime}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {subscription.startDate} to {subscription.endDate}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => {/* Handle manage subscription */}}
                >
                  Manage Subscription
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SubscriptionList; 