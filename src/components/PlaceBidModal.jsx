import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  Alert, CircularProgress, Divider, Chip, IconButton, Paper
} from '@mui/material';
import {
  Close as CloseIcon, Gavel as GavelIcon, TrendingUp as TrendingUpIcon,
  Warning as WarningIcon, Login as LoginIcon, CheckCircle as CheckCircleIcon,
  Add as AddIcon, Remove as RemoveIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { auctionService } from '../services/auctionService';

const PlaceBidModal = ({ open, onClose, auctionId, currentBid, minIncrement, auctionTitle, onBidPlaced }) => {
  const { isAuthenticated, user } = useAuth();
  const [bidAmount, setBidAmount] = useState(currentBid + minIncrement);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setBidAmount(currentBid + minIncrement);
      setError('');
      setSuccess('');
    }
  }, [open, currentBid, minIncrement]);

  const handleIncrement = () => {
    setBidAmount(prev => prev + minIncrement);
    setError('');
  };

  const handleDecrement = () => {
    const newAmount = bidAmount - minIncrement;
    if (newAmount >= currentBid + minIncrement) {
      setBidAmount(newAmount);
      setError('');
    }
  };

  const handlePlaceBid = async () => {
    if (bidAmount < currentBid + minIncrement) {
      setError(`Bid must be at least Rs.${(currentBid + minIncrement).toLocaleString()} (current bid + minimum increment)`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await auctionService.placeBid(auctionId, bidAmount);
      setSuccess('Bid placed successfully!');
      
      if (onBidPlaced) {
        onBidPlaced(result);
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.message || 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LoginIcon color="primary" />
          Login Required
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <LoginIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Please Login to Place a Bid
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need to be logged in to participate in auctions and place bids.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                handleClose();
                // Redirect to login page
                window.location.href = '/login';
              }}
              startIcon={<LoginIcon />}
            >
              Login Now
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="primary" />
          <Typography variant="h6">Place Your Bid</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Auction Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {auctionTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={`Current Bid: Rs.${currentBid?.toLocaleString()}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`Min Increment: Rs.${minIncrement?.toLocaleString()}`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Bid Amount Control */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Set Your Bid Amount
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use the buttons below to adjust your bid amount in increments of Rs.{minIncrement?.toLocaleString()}
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <IconButton 
                onClick={handleDecrement}
                disabled={bidAmount <= currentBid + minIncrement}
                sx={{ 
                  bgcolor: 'white', 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <RemoveIcon />
              </IconButton>
              
              <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  Rs.{bidAmount?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your Bid Amount
                </Typography>
              </Box>
              
              <IconButton 
                onClick={handleIncrement}
                sx={{ 
                  bgcolor: 'white', 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Increment: Rs.{minIncrement?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                +Rs.{(bidAmount - currentBid).toLocaleString()} above current bid
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Bid Summary */}
        <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleIcon color="success" />
            <Typography variant="subtitle2" fontWeight={600} color="success.dark">
              Bid Summary
            </Typography>
          </Box>
          <Typography variant="body2" color="success.dark">
            Your bid: <strong>Rs.{bidAmount?.toLocaleString()}</strong> 
            ({bidAmount > currentBid ? `+Rs.${(bidAmount - currentBid).toLocaleString()}` : 'No increase'} above current bid)
          </Typography>
        </Paper>

        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Warning */}
        <Alert severity="warning" icon={<WarningIcon />}>
          <Typography variant="body2">
            <strong>Important:</strong> Once placed, bids cannot be withdrawn. 
            Make sure you're comfortable with your bid amount before proceeding.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePlaceBid}
          disabled={loading || bidAmount < currentBid + minIncrement}
          startIcon={loading ? <CircularProgress size={16} /> : <GavelIcon />}
          sx={{
            bgcolor: 'success.main',
            '&:hover': {
              bgcolor: 'success.dark'
            }
          }}
        >
          {loading ? 'Placing Bid...' : 'Place Bid'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaceBidModal; 