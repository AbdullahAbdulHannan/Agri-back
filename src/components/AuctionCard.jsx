import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardMedia, Typography, Button, Box, Chip, IconButton,
  Avatar, Divider, Grid, Paper, Tooltip, Badge, Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon, Agriculture as AgricultureIcon, Timer as TimerIcon,
  Gavel as GavelIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  Verified as VerifiedIcon, TrendingUp as TrendingUpIcon, Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon, AccessTime as AccessTimeIcon, Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/fileUtils';
import axios from 'axios';
import { API_BASE_URL } from '../main';

const AuctionCard = ({ 
  auction, 
  onPlaceBid, 
  onAddToWatchlist, 
  onViewDetails,
  showActions = true 
}) => {
  const { isAuthenticated, user, userRole } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLatestBid, setUserLatestBid] = useState(null);
  const [loadingBid, setLoadingBid] = useState(false);

  // Early return if auction is not provided
  if (!auction) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Auction data not available
          </Typography>
        </Box>
      </Card>
    );
  }

  // Fetch user's latest bid for this auction
  useEffect(() => {
    const fetchUserBid = async () => {
      if (!isAuthenticated || !auction?._id) {
        console.log('Not fetching bid: User not authenticated or no auction ID');
        console.log('isAuthenticated:', isAuthenticated, 'auctionId:', auction?._id);
        return;
      }
      
      setLoadingBid(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching user bid for auction:', auction._id);
        console.log('Using token:', token ? 'Token exists' : 'No token found');
        
        const response = await axios.get(`${API_BASE_URL}/api/auctions/${auction._id}/user-bid`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        console.log('User bid API response status:', response.status);
        console.log('User bid API response data:', response.data);
        
        if (response.data?.success) {
          if (response.data.data?.userBid !== null) {
            console.log('Setting user latest bid to:', response.data.data.userBid);
            setUserLatestBid(response.data.data.userBid);
          } else {
            console.log('No bid found for this user on this auction');
            setUserLatestBid(null);
          }
        } else {
          console.log('API returned success:false', response.data);
          setUserLatestBid(null);
        }
      } catch (error) {
        console.error('Error fetching user bid:', error);
      } finally {
        setLoadingBid(false);
      }
    };

    fetchUserBid();
  }, [isAuthenticated, auction?._id]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('AuctionCard state update:', {
      isAuthenticated,
      loadingBid,
      userLatestBid,
      auctionId: auction?._id
    });
  }, [isAuthenticated, loadingBid, userLatestBid, auction?._id]);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!auction?.endTime) return '';
      
      const now = new Date().getTime();
      const endTime = new Date(auction.endTime).getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
        return 'Auction Ended';
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h remaining`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      } else {
        return `${minutes}m remaining`;
      }
    };

    setTimeRemaining(calculateTimeRemaining());
    
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction?.endTime]);

  // Get auction status
  const getAuctionStatus = () => {
    if (!auction?.endTime || !auction?.startTime) return { status: 'unknown', color: 'default' };
    
    const now = new Date().getTime();
    const startTime = new Date(auction.startTime).getTime();
    const endTime = new Date(auction.endTime).getTime();
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'info' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'success' };
    } else {
      return { status: 'Ended', color: 'error' };
    }
  };

  const auctionStatus = getAuctionStatus();
  const isAuctionActive = auctionStatus.status === 'Active';
  const isAuctionEnded = auctionStatus.status === 'Ended';

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    setLoading(true);
    try {
      if (onAddToWatchlist && auction?._id) {
        await onAddToWatchlist(auction._id, !isInWatchlist);
        setIsInWatchlist(!isInWatchlist);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle place bid
  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (onPlaceBid) {
      onPlaceBid(auction);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(auction);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Rs.0';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get primary image
  const getPrimaryImage = () => {
    if (auction?.images && auction.images.length > 0) {
      const imageUrl = getImageUrl(auction.images[0]);
     
      return imageUrl;
    }
    return '/default-farm-image.jpg'; // Default image
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={getPrimaryImage()}
          alt={auction?.title || 'Auction'}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Status Badge */}
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Chip
            label={auctionStatus.status}
            color={auctionStatus.color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        {/* Watchlist Button */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Tooltip title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}>
            <IconButton
              onClick={handleWatchlistToggle}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
              }}
            >
              {isInWatchlist ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Verified Badge */}
        {auction?.verified && (
          <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
            <Tooltip title="Verified Auction">
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                <VerifiedIcon fontSize="small" />
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title and Location */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              lineHeight: 1.3,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={handleViewDetails}
          >
            {auction?.title || 'Untitled Auction'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {auction?.location || 'Location not specified'}
            </Typography>
          </Box>
        </Box>

        {/* Farm Details */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AgricultureIcon color="primary" fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                {auction?.cropType || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {auction?.area || 0} acres
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {auction?.landType || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {auction?.leaseType || 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Bid Information */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Bid
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" fontSize="small" />
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(auction?.currentBid || auction?.startingBid)}
              </Typography>
            </Box>
          </Box>
          
          {/* User's Latest Bid */}
          {isAuthenticated && !loadingBid && userLatestBid !== null && userLatestBid !== undefined && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WalletIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="primary" fontWeight={500}>
                  Your Bid
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600} color="primary">
                {formatCurrency(userLatestBid)}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Starting Bid
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(auction?.startingBid)}
            </Typography>
          </Box>
          
          {auction?.totalBids > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Bids
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {auction.totalBids}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Time Remaining */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimerIcon color={isAuctionEnded ? 'error' : 'warning'} fontSize="small" />
            <Typography 
              variant="body2" 
              fontWeight={600}
              color={isAuctionEnded ? 'error.main' : 'warning.main'}
            >
              {timeRemaining}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Ends: {auction?.endTime ? new Date(auction.endTime).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Views */}
        {auction?.views > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <VisibilityIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              {auction.views} views
            </Typography>
          </Box>
        )}

        {/* Actions */}
        {showActions && (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Grid container spacing={1}>
            {
              isAuthenticated && userRole=="buyer" 
              ?
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handlePlaceBid}
                  disabled={!isAuctionActive || (user && auction?.ownerId === user._id)}
                  startIcon={<GavelIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {!isAuctionActive ? 'Auction Ended' : 
                  user && auction?.ownerId === user._id ? 'Your Auction' : 'Place Bid'}
                </Button>
              </Grid>
              : <Typography variant="body1" sx={{ color: 'blue', mb: 4, lineHeight: 1.6 }}>
                Please login as a buyer to place a bid
               </Typography>
              }
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleViewDetails}
                  startIcon={<VisibilityIcon />}
                >
                  View Details
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Owner Info */}
        {auction.ownerId && typeof auction.ownerId === 'object' && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Listed by: {auction.ownerId.name || 'Anonymous'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AuctionCard; 