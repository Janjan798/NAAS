import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  styled,
  useTheme,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
  Schedule as ScheduledIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Card from '../common/Card';

const StyledStep = styled(Step)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.success.main,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepLabel-root .Mui-error': {
    color: theme.palette.error.main,
  },
}));

const StatusIcon = styled(Box)(({ theme, status }) => {
  const colors = {
    delivered: theme.palette.success.main,
    inProgress: theme.palette.primary.main,
    scheduled: theme.palette.info.main,
    pending: theme.palette.warning.main,
    error: theme.palette.error.main,
  };

  return {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colors[status] || theme.palette.grey[500],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  };
});

const DeliveryStatus = () => {
  const theme = useTheme();

  // Mock data - replace with actual API call
  const deliveryStatus = {
    currentStatus: 'inProgress',
    estimatedDelivery: '08:30 AM',
    deliveryPerson: 'John Smith',
    phone: '+1234567890',
    steps: [
      {
        label: 'Order Placed',
        description: 'Your newspaper subscription has been confirmed',
        time: '2024-02-15 10:00 AM',
        status: 'completed',
      },
      {
        label: 'Processing',
        description: 'Your newspapers are being prepared for delivery',
        time: '2024-02-15 06:00 AM',
        status: 'completed',
      },
      {
        label: 'Out for Delivery',
        description: 'Your newspapers are on the way',
        time: '2024-02-15 07:30 AM',
        status: 'inProgress',
      },
      {
        label: 'Delivered',
        description: 'Your newspapers have been delivered',
        time: null,
        status: 'pending',
      },
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <DeliveredIcon />;
      case 'inProgress':
        return <DeliveryIcon />;
      case 'scheduled':
        return <ScheduledIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <PendingIcon />;
    }
  };

  return (
    <Card>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Delivery Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Estimated delivery time: {deliveryStatus.estimatedDelivery}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stepper orientation="vertical">
          {deliveryStatus.steps.map((step, index) => (
            <StyledStep key={step.label} active={step.status === 'inProgress'} completed={step.status === 'completed'}>
              <StepLabel
                StepIconComponent={() => (
                  <StatusIcon status={step.status}>
                    {getStatusIcon(step.status)}
                  </StatusIcon>
                )}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {step.description}
                </Typography>
                {step.time && (
                  <Typography variant="caption" color="text.secondary">
                    {step.time}
                  </Typography>
                )}
              </StepContent>
            </StyledStep>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Delivery Personnel
          </Typography>
          <Typography variant="body2">
            Name: {deliveryStatus.deliveryPerson}
          </Typography>
          <Typography variant="body2">
            Phone: {deliveryStatus.phone}
          </Typography>
        </Box>
      </Paper>
    </Card>
  );
};

export default DeliveryStatus; 