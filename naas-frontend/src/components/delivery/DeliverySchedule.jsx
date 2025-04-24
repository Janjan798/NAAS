import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  styled,
  useTheme,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Newspaper as NewspaperIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
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

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    completed: theme.palette.success.main,
    pending: theme.palette.warning.main,
    inProgress: theme.palette.info.main,
  };

  return {
    backgroundColor: colors[status] || theme.palette.grey[500],
    color: theme.palette.common.white,
    fontWeight: 500,
  };
});

const DeliverySchedule = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data - replace with actual API call
  const deliveries = [
    {
      id: 1,
      customerName: 'John Doe',
      address: '123 Main St, City',
      time: '08:00 AM',
      newspapers: 2,
      status: 'pending',
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      address: '456 Oak Ave, Town',
      time: '09:30 AM',
      newspapers: 1,
      status: 'completed',
    },
    // Add more mock data as needed
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon color="info" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Delivery Schedule
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {/* Handle refresh schedule */}}
        >
          Refresh Schedule
        </Button>
      </Box>

      <Grid container spacing={3}>
        {deliveries.map((delivery) => (
          <Grid item xs={12} md={6} lg={4} key={delivery.id}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {delivery.customerName}
                  </Typography>
                  <StatusChip
                    icon={getStatusIcon(delivery.status)}
                    label={delivery.status}
                    status={delivery.status}
                    size="small"
                  />
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={delivery.address}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Delivery Time"
                      secondary={delivery.time}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <NewspaperIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Newspapers"
                      secondary={`${delivery.newspapers} copies`}
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => {/* Handle mark as delivered */}}
                  >
                    Mark as Delivered
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => {/* Handle view details */}}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DeliverySchedule; 