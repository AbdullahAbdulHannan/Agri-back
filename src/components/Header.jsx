import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  InputBase,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Add as AddIcon,
  GridView as GridIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import CartIcon from './CartIcon';
import AddProductModal from './AddProductModal';
import PostAdOptionModal from './PostAdOptionModal';
import AuctionFormModal from './AuctionFormModal';
import ChatButton from './ChatButton';
import Chatbot from './Chatbot';
import NotificationDrawer from './NotificationDrawer';
import { notificationService } from '../services/notificationService';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '20px',
  backgroundColor: '#f5f5f5',
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
  width: '200px',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#333',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));


const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState('marketplace');
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, userRole, logout } = useAuth();
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'E-Mandi', href: '/emandi' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Auctions', href: '/auctions' },

    { label: userRole == 'buyer' ? 'My Orders' : null, href: '/my-orders' }
  ];

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch notifications when notification drawer is opened
  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const data = await notificationService.fetchNotifications();
      setNotifications(Array.isArray(data) ? data : (data.notifications || []));

      // Update unread count
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleNotificationClick = () => {
    setNotifOpen(true);
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotifOpen(false);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };
  const handleChatClick = () => setChatOpen(true);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/signin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePostAdClick = () => {
    setOptionModalOpen(true);
  };

  const handleOptionSelect = (optionId) => {
    setSelectedProductType(optionId);
    if (optionId === 'auction') {
      setAuctionModalOpen(true);
    } else {
      setProductModalOpen(true);
    }
  };

  const handleProductAdded = (productData) => {
    console.log('New product added:', productData);
    // Here you can add logic to refresh the product list or navigate to the product page
    // For now, we'll just show a success message
    alert('Product added successfully!');
  };

  const handleAuctionSubmitted = (auctionData) => {
    console.log('New auction created:', auctionData);
    alert('Auction created successfully!');
  };

  // Sticky auto-hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1,
          transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1, gap: 2 }}>
            {/* Left: Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isMobile && (
                <IconButton onClick={toggleDrawer} sx={{ color: '#000' }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 1.5
                }}
                onClick={() => navigate('/')}
              >
                <img src={logo} alt="AgriBazaar" style={{ height: '32px', width: 'auto' }} />
                <Typography
                  variant="h6"
                  sx={{ color: '#000000', fontWeight: 600, fontSize: '1.25rem' }}
                >
                  AgriBazaar
                </Typography>
              </Box>
            </Box>

            {/* Middle Nav */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {navItems.map((item) => (
                  <Link to={item.href}>
                    <Button
                      key={item.label}
                      //  onClick={() => navigate(item.href)}
                      sx={{
                        color: location.pathname === item.href ? '#4CAF50' : '#000000',
                        fontWeight: location.pathname === item.href ? 600 : 500,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'unset',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                {isAuthenticated && userRole === 'seller' ?
                  <IconButton
                    size="small"
                    sx={{ color: '#000000' }}
                    onClick={() => navigate('/seller-dashboard')}
                  >
                    <GridIcon />
                  </IconButton>
                  : null}
              </Box>
            )}

            {/* Right: Search + Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon sx={{ color: '#666' }} />
                </SearchIconWrapper>
                <StyledInputBase placeholder="Search" inputProps={{ 'aria-label': 'search' }} />
              </Search>
              {isAuthenticated && userRole === 'seller' ?
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handlePostAdClick}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    px: 2.5,
                    py: 0.75,
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                    '&:hover': { backgroundColor: '#45a049' },
                  }}
                >
                  Post Ad
                </Button>
                : null}
              {!isAuthenticated ? <Button
                variant="contained"
                onClick={() => navigate('/signin')}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  px: 2.5,
                  py: 0.75,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                  '&:hover': { backgroundColor: '#45a049' },
                }}
              >
                Sign In
              </Button> : null}
              {isAuthenticated ?
                <Box>
                  <IconButton
                    onClick={handleNotificationClick}
                    sx={{ color: '#000', p: '6px' }}
                    aria-label="show notifications"
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  <IconButton onClick={handleChatClick} sx={{ color: '#000', p: '6px' }}>
                    <ChatIcon />
                  </IconButton>
              {isAuthenticated && userRole == "buyer" ?
                <CartIcon /> :
                null
                
              }

              <IconButton onClick={handleProfileClick} sx={{ color: '#000', p: '6px' }}>
                <PersonIcon />
              </IconButton>
              </Box>
                : null
                }
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Menu</Typography>
            <IconButton onClick={toggleDrawer}><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ my: 1 }} />
          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  navigate(item.href);
                  toggleDrawer();
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: location.pathname === item.href ? '#4CAF50' : '#000000',
                    fontWeight: location.pathname === item.href ? 600 : 400,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Post Ad Option Modal */}
      <PostAdOptionModal
        open={optionModalOpen}
        onClose={() => setOptionModalOpen(false)}
        onOptionSelect={handleOptionSelect}
      />

      {/* Add Product Modal */}
      <AddProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onProductAdded={handleProductAdded}
        productType={selectedProductType}
      />

      {/* Auction Form Modal */}
      <AuctionFormModal
        open={auctionModalOpen}
        onClose={() => setAuctionModalOpen(false)}
        onSubmit={handleAuctionSubmitted}
        mode="create"
      />

      {/* Chatbot */}
      <Chatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        open={notifOpen}
        onClose={handleNotificationClose}
        notifications={notifications}
        onDelete={handleDeleteNotification}
        onMarkAsRead={handleMarkAsRead}
        loading={notifLoading}
      />
    </>
  );
};

export default Header;
