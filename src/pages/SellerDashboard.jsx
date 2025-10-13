import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Container,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  GridView as GridIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import logo from '../assets/logo.png';
import { useAuth } from '../context';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardMarketplace from '../components/dashboard/DashboardMarketplace';
import DashboardEMandi from '../components/dashboard/DashboardEMandi';
import SellerOrders from '../components/dashboard/SellerOrders';
import Auction from '../components/dashboard/Auction';
import StripeConnectButton from '../components/stripe/StripeConnectButton';
import marketplace from '../assets/marketplace.png';
import emandi from '../assets/emandi.png';
import auction from '../assets/auction.png';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
  },
}));

const SellerDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    {
      text: 'Orders',
      icon: <ShoppingCartIcon />,
      value: 'orders',
      badge: null
    },
    {
      text: 'Market Place',
      icon: <img src={marketplace} alt="Marketplace" style={{ width: 24, height: 24 }} />,
      value: 'marketplace',
      badge: null
    },
    {
      text: 'EMandi',
      icon: <img src={emandi} alt="EMandi" style={{ width: 24, height: 24 }} />,
      value: 'emandi',
      badge: null
    },
    {
      text: 'Auction',
      icon: <img src={auction} alt="Auction" style={{ width: 24, height: 24 }} />,
      value: 'auction',
      badge: null
    },
    {
      text: 'Payments',
      icon: <AccountBalanceWalletIcon />,
      value: 'payments',
      badge: null
    },
  ];

  const favoritesItems = [
    {
      text: 'Overview',
      icon: <TimelineIcon />,
      value: 'overview',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      // case 'overview':
      //   return <DashboardOverview/>
      case 'marketplace':
        return <DashboardMarketplace />;
      case 'emandi':
        return <DashboardEMandi />;
      case 'auction':
        return <Auction />;
      case 'orders':
        return <SellerOrders />;
      case 'payments':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Payment Settings</Typography>
            <Typography variant="body1" paragraph>
              Connect your Stripe account to receive payments from customers. This is required to sell products on our platform.
            </Typography>
            <Box sx={{ mt: 4, maxWidth: 600 }}>
              <StripeConnectButton onConnect={(isActive) => {
                if (isActive) {
                  console.log('Stripe account connected successfully!');
                  // You can add any additional logic here when the account is connected
                }
              }} />
            </Box>
          </Box>
        );
      default:
        return <SellerOrders />;
    }
  };

  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'overview':
        return ['Dashboards', 'Default'];
      case 'marketplace':
        return ['Dashboards', 'Market Place'];
      case 'emandi':
        return ['Dashboards', 'e Mandi'];
      case 'orders':
        return ['Dashboards', 'Orders'];
      case 'payments':
        return ['Settings', 'Payment Setup'];
      default:
        return ['Dashboards', 'Default'];
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
    

      {/* Sidebar */}
      <StyledDrawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <DrawerHeader />
        
        <Box sx={{ p: 2 }}>
          {/* User Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: '#4CAF50' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.name || 'ByeWind'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Seller
              </Typography>
            </Box>
          </Box>

          {/* Favorites Section */}
          {/* <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
            Favorites
          </Typography>
          <List sx={{ mb: 3 }}>
            {favoritesItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: 1,
                    backgroundColor: activeTab === item.value ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }
                  }}
                  onClick={() => setActiveTab(item.value)}
                >
                  <ListItemIcon  sx={{ color: activeTab === item.value ? '#4CAF50' : '#666', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: activeTab === item.value ? 600 : 400,
                        color: activeTab === item.value ? '#4CAF50' : '#333',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ mb: 2 }} /> */}

          {/* Dashboards Section */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
            Dashboards
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => setActiveTab(item.value)}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: activeTab === item.value ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }
                  }}
                >
                  {typeof item.icon === 'string' ? (
                    <img style={{ width: '24px', height: '20px', marginRight: '5px' }} src={item.icon} />
                  ) : (
                    <item.icon.type style={{ marginRight: '8px', color: '#666' }} />
                  )}
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: activeTab === item.value ? 600 : 400,
                        color: activeTab === item.value ? '#4CAF50' : '#333',
                      }
                    }}
                  />
                  {item.badge && (
                    <Badge badgeContent={item.badge} color="error" />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Logo at bottom */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            <img src={logo} alt="AgriBazaar" style={{ height: '24px', width: 'auto' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
              AgriBazaar
            </Typography>
          </Box>
        </Box>
      </StyledDrawer>

      {/* Main Content */}
      <Main open={open}>
        <DrawerHeader />
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            {getBreadcrumbs().map((crumb, index) => (
              <Link
                key={index}
                color={index === getBreadcrumbs().length - 1 ? 'text.primary' : 'inherit'}
                href="#"
                underline="hover"
                sx={{ color: index === getBreadcrumbs().length - 1 ? '#333' : '#666' }}
              >
                {crumb}
              </Link>
            ))}
          </Breadcrumbs>

          {/* Page Content */}
          {renderContent()}
        </Container>
      </Main>
    </Box>
  );
};

export default SellerDashboard; 