import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  styled,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalShipping as DeliveryIcon,
  Receipt as BillingIcon,
  Assessment as ReportsIcon,
  Newspaper as NewspaperIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const menuItems = {
  manager: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager/dashboard' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/manager/customers' },
    { text: 'Delivery Personnel', icon: <DeliveryIcon />, path: '/manager/delivery-personnel' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/manager/reports' },
    { text: 'Billing', icon: <BillingIcon />, path: '/manager/billing' },
  ],
  delivery: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/delivery/dashboard' },
    { text: 'Routes', icon: <DeliveryIcon />, path: '/delivery/routes' },
    { text: 'Commission', icon: <BillingIcon />, path: '/delivery/commission' },
  ],
  customer: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/customer/dashboard' },
    { text: 'Subscriptions', icon: <NewspaperIcon />, path: '/customer/subscriptions' },
    { text: 'Bills', icon: <BillingIcon />, path: '/customer/bills' },
    { text: 'Profile', icon: <PeopleIcon />, path: '/customer/profile' },
  ],
};

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'manager':
        return menuItems.manager;
      case 'delivery':
        return menuItems.delivery;
      case 'customer':
        return menuItems.customer;
      default:
        return [];
    }
  };

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/settings'}
            onClick={() => handleNavigation('/settings')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
    >
      {drawer}
    </StyledDrawer>
  );
};

export default Sidebar; 