import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  useMediaQuery,
  styled,
  alpha,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Gavel as GavelIcon,
  ShoppingCart as ShoppingCartIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as AccountCircleIcon,
  GridView,
} from '@mui/icons-material';
// import { styled } from '@mui/material/styles';
import logo from '../assets/logo.png';
import { useAuth } from '../context';
import CartIcon from './CartIcon';
import AddProductModal from './AddProductModal';
import PostAdOptionModal from './PostAdOptionModal';
import AuctionFormModal from './AuctionFormModal';
import ChatButton from './ChatButton';
import NotificationDrawer from './NotificationDrawer';
import { notificationService } from '../services/notificationService';
import Chatbot from './Chatbot';

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease-in-out',
  '&.scrolled': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  [theme.breakpoints.up('md')]: {
    width: '300px',
  },
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
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  fontWeight: 500,
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  '&.active': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
  },
}));

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
   const [selectedProductType, setSelectedProductType] = useState('marketplace');
  const { isAuthenticated, userRole, user, logout } = useAuth();
  
  // Navigation items
  const navItems = [
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'EMandi', href: '/emandi', icon: <StoreIcon /> },
    { label: 'Marketplace', href: '/marketplace', icon: <StoreIcon /> },
    { label: 'Auctions', href: '/auctions', icon: <GavelIcon /> },
    ...(userRole === 'buyer' ? [{ label: 'My Orders', href: '/my-orders', icon: <ShoppingCartIcon /> }] : []),
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
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
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleChatClick = () => setChatOpen(true);

  const handleLogout = () => {
    handleMenuClose();
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
  const renderMobileMenu = (
    <Drawer
      variant="temporary"
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box',
          width: 280,
          padding: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.href} 
            component={Link} 
            to={item.href}
            onClick={handleDrawerToggle}
            selected={location.pathname === item.href}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem 
              button 
              component={Link} 
              to="/profile"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                color: theme.palette.error.main,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  const renderDesktopMenu = (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3 }}>
      {navItems.map((item) => (
        <NavButton
          key={item.href}
          component={Link}
          to={item.href}
          className={location.pathname === item.href ? 'active' : ''}
          // startIcon={item.icon}
        >
          {item.label}
        </NavButton>
      ))}
        {isAuthenticated && userRole === 'seller' ?
                        <IconButton
                          size="small"
                          sx={{ color: '#000000' }}
                          onClick={() => navigate('/seller-dashboard')}
                        >
                          <GridView />
                        </IconButton>
                        : null}
                        {isAuthenticated && userRole === 'seller' ?
                                        <Button
                                          variant="contained"
                                          startIcon={<AddIcon />}
                                          onClick={handlePostAdClick}
                                          sx={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            
                                            borderRadius: '50px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.5rem',
                                            boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                                            '&:hover': { backgroundColor: '#45a049' },
                                          }}
                                        >
                                          Post Ad
                                        </Button>
                                        : null}
    </Box>
  );

  const renderAuthButtons = () => (
    <Stack direction="row" spacing={1} alignItems="center">
      {isAuthenticated ? (
        <>
          <IconButton 
            size="large" 
            aria-label="show new notifications" 
            color="inherit"
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <CartIcon />
          
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.avatar} 
                sx={{ width: 32, height: 32 }}
              >
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem component={Link} to="/profile">
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Button 
            color="inherit" 
            component={Link} 
            to="/signin"
            sx={{ mr: 1 }}
          >
            Sign In
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to="/signup"
          >
            Sign Up
          </Button>
        </>
      )}
    </Stack>
  );

  return (
    <>
      <StyledAppBar position="fixed" className={scrolled ? 'scrolled' : ''}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box 
              component={Link} 
              to="/" 
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: 2,
              }}
            >
              <img 
                src={logo} 
                alt="AgriBazaar" 
                style={{ 
                  height: 40, 
                  marginRight: 8 
                }} 
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  color: 'primary.main',
                }}
              >
                AgriBazaar
              </Typography>
            </Box>


            {renderDesktopMenu}
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            <Box sx={{ flexGrow: 1 }} />

            {!isMobile && renderAuthButtons()}

            <MobileMenuButton
              size="large"
              aria-label="menu"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </MobileMenuButton>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Add margin to account for fixed header */}
      <Toolbar />
      
      {renderMobileMenu}
      
      {/* Modals */}
     <PostAdOptionModal
        open={optionModalOpen}
        onClose={() => setOptionModalOpen(false)}
        onOptionSelect={handleOptionSelect}
      />
      
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
      <Chatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
     <NotificationDrawer
             open={notifOpen}
             onClose={handleNotificationClose}
             notifications={notifications}
             onDelete={handleDeleteNotification}
             onMarkAsRead={handleMarkAsRead}
             loading={notifLoading}
           />
      
     <ChatButton open={chatOpen} onToggle={() => setChatOpen(!chatOpen)} onClick={handleChatClick}/>
    </>
  );
};

export default Header;
