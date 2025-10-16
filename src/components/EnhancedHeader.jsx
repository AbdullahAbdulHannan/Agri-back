import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Paper,
  ListItemButton,
  Chip,
  CircularProgress,
  Fade,
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
  Clear as ClearIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import axios from 'axios';
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

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  borderRadius: '24px',
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
    width: '400px',
  },
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
    backgroundColor: theme.palette.background.paper,
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
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: theme.spacing(5),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '100%',
    },
  },
}));

const SearchResults = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 1300,
  marginTop: theme.spacing(1),
  maxHeight: '400px',
  overflowY: 'auto',
  boxShadow: theme.shadows[4],
  borderRadius: '12px',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: '0 12px 12px 0',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.grey[500],
  },
}));

const SearchResultItem = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const CategoryChip = styled(Chip)(({ theme, source }) => ({
  marginLeft: 'auto',
  fontSize: '0.65rem',
  height: '20px',
  backgroundColor: 
    source === 'eMandi' 
      ? theme.palette.primary.light 
      : source === 'Marketplace' 
        ? theme.palette.secondary.light 
        : theme.palette.warning.light,
  color: theme.palette.getContrastText(
    source === 'eMandi' 
      ? theme.palette.primary.light 
      : source === 'Marketplace' 
        ? theme.palette.secondary.light 
        : theme.palette.warning.light
  ),
}));

const NoResults = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2),
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
  const searchRef = useRef(null);
  
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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    eMandi: [],
    marketplace: [],
    auction: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      const searchQuery = query.trim();
      
      if (!searchQuery) {
        setSearchResults({ eMandi: [], marketplace: [], auction: [] });
        setIsSearching(false);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        console.log('Searching for:', searchQuery);
        
        // Only fetch products, no auctions
        const productsRes = await axios.get(`${API_BASE_URL}/api/products`).catch(err => {
          console.error('Products API error:', err);
          return { data: { data: [] } };
        });

        console.log('Products response:', productsRes.data);

        const queryLower = searchQuery.toLowerCase();
        
        // Handle different possible response structures
        const allProducts = Array.isArray(productsRes.data?.data) ? 
          productsRes.data.data : 
          Array.isArray(productsRes.data) ? productsRes.data : [];

        console.log('All products:', allProducts);

        const filterByQuery = (items) => {
          return items.filter(item => {
            if (!item) return false;
            return (
              (item.name && item.name.toLowerCase().includes(queryLower)) ||
              (item.description && item.description.toLowerCase().includes(queryLower)) ||
              (item.category && item.category.toLowerCase().includes(queryLower))
            );
          });
        };

        const filteredProducts = filterByQuery(allProducts);
        console.log('Filtered products:', filteredProducts);

        // Separate products by type
        const eMandiProducts = filteredProducts.filter(p => 
          (p.type && p.type.toLowerCase() === 'emandi') || 
          (p.productType && p.productType.toLowerCase() === 'emandi')
        );
        
        const marketplaceProducts = filteredProducts.filter(p => 
          (p.type && p.type.toLowerCase() === 'marketplace') || 
          (p.productType && p.productType.toLowerCase() === 'marketplace') ||
          (!p.type && !p.productType) // Default to marketplace if no type specified
        );

        console.log('eMandi products:', eMandiProducts);
        console.log('Marketplace products:', marketplaceProducts);

        const results = {
          eMandi: eMandiProducts,
          marketplace: marketplaceProducts,
          auction: [], // Empty array for auctions to maintain consistent structure
        };

        console.log('Final search results:', results);
        setSearchResults(results);

      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ eMandi: [], marketplace: [], auction: [] });
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchResults({ eMandi: [], marketplace: [], auction: [] });
      setShowResults(false);
      setHasSearched(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ eMandi: [], marketplace: [], auction: [] });
    setShowResults(false);
    setHasSearched(false);
  };

  // Handle search result click
  const handleResultClick = (item, type) => {
    if (type === 'auction') {
      // Navigate to auction details page
      navigate(`/auctions/${item._id || item.id}`);
    } else if (type === 'eMandi') {
      // Navigate to eMandi product details
      navigate(`/product/${item._id || item.id}`);
    } else {
      // Navigate to marketplace product details
      navigate(`/product/${item._id || item.id}`);
    }
    // Close search results and clear search
    setShowResults(false);
    setSearchQuery('');
    setSearchResults({ eMandi: [], marketplace: [], auction: [] });
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Find the first available result
    const firstResult = 
      searchResults.eMandi[0] || 
      searchResults.marketplace[0] || 
      searchResults.auction[0];
    
    if (firstResult) {
      const type = searchResults.eMandi[0] ? 'eMandi' : 
                  searchResults.marketplace[0] ? 'marketplace' : 'auction';
      handleResultClick(firstResult, type);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation items
  const navItems = [
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'EMandi', href: '/emandi', icon: <StoreIcon /> },
    { label: 'Marketplace', href: '/marketplace', icon: <StoreIcon /> },
    { label: 'Auctions', href: '/auctions', icon: <GavelIcon /> },
    ...(userRole === 'buyer' ? [{ label: 'My Orders', href: '/my-orders', icon: <ShoppingCartIcon /> }] : []),
  ];

  // Check if there are any search results
  const hasResults = searchResults.eMandi.length > 0 || 
                   searchResults.marketplace.length > 0;

  // Render search results
  const renderSearchResults = () => {
    if (!showResults || !searchQuery.trim()) return null;

    // Check if we have any results
    const hasEMandiResults = searchResults.eMandi && searchResults.eMandi.length > 0;
    const hasMarketplaceResults = searchResults.marketplace && searchResults.marketplace.length > 0;
    const hasAnyResults = hasEMandiResults || hasMarketplaceResults;

    return (
      <SearchResults elevation={3}>
        {isSearching ? (
          <LoadingContainer>
            <CircularProgress size={24} />
          </LoadingContainer>
        ) : hasAnyResults ? (
          <>
            {hasEMandiResults && (
              <>
                <ListItem>
                  <Typography variant="subtitle2" color="text.secondary">
                    eMandi Products
                  </Typography>
                </ListItem>
                {searchResults.eMandi.map((item) => {
                  const isEMandi = (item.type && item.type.toLowerCase() === 'emandi') || 
                                 (item.productType && item.productType.toLowerCase() === 'emandi');
                  const label = isEMandi ? 'eMandi' : 'Marketplace';
                  
                  return (
                    <SearchResultItem 
                      key={`${isEMandi ? 'emandi' : 'marketplace'}-${item._id}`}
                      onClick={() => handleResultClick(item, isEMandi ? 'eMandi' : 'marketplace')}
                    >
                      <ListItemText 
                        primary={item.name || item.title}
                        secondary={item.description && item.description.substring(0, 60) + (item.description.length > 60 ? '...' : '')}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          noWrap: true,
                        }}
                      />
                      <CategoryChip 
                        label={label}
                        size="small"
                        source={label}
                        style={{
                          backgroundColor: isEMandi ? '#4caf50' : '#2196f3',
                          color: 'white',
                        }}
                      />
                    </SearchResultItem>
                  );
                })}
              </>
            )}

            {hasMarketplaceResults && (
              <>
                <ListItem>
                  <Typography variant="subtitle2" color="text.secondary">
                    Marketplace Products
                  </Typography>
                </ListItem>
                {searchResults.marketplace.map((item) => {
                  const isEMandi = (item.type && item.type.toLowerCase() === 'emandi') || 
                                 (item.productType && item.productType.toLowerCase() === 'emandi');
                  const label = isEMandi ? 'eMandi' : 'Marketplace';
                  
                  return (
                    <SearchResultItem 
                      key={`marketplace-${item._id}`}
                      onClick={() => handleResultClick(item, 'marketplace')}
                    >
                      <ListItemText 
                        primary={item.name || item.title}
                        
                        primaryTypographyProps={{
                          noWrap: true,
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          noWrap: true,
                        }}
                      />
                      <CategoryChip 
                        label={label}
                        size="small"
                        source={label}
                        style={{
                          backgroundColor: isEMandi ? '#4caf50' : '#2196f3',
                          color: 'white',
                        }}
                      />
                    </SearchResultItem>
                  );
                })}
              </>
            )}
           
          </>
        ) : hasSearched ? (
          <NoResults>
            <Typography variant="body2">No items found</Typography>
          </NoResults>
        ) : null}
      </SearchResults>
    );
  };

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

  // Fetch notifications and set up polling when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    // initial fetch after auth
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchNotifications]);


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
        setNotifications(prev => {
          const target = prev.find(n => n._id === notificationId);
          const wasUnread = target ? !target.isRead : false;
          const next = prev.filter(n => n._id !== notificationId);
          if (wasUnread) setUnreadCount(p => Math.max(0, p - 1));
          return next;
        });
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
        {!isAuthenticated && (
          <>
           <Divider sx={{ my: 1 }} />
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
            <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: '600px' }} ref={searchRef}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <form onSubmit={handleSearchSubmit}>
                  <StyledInputBase
                    placeholder="Search products "
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.trim() && setShowResults(true)}
                  />
                </form>
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={clearSearch}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </Search>
              {renderSearchResults()}
            </Box>

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
