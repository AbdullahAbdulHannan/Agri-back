import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Alert, CircularProgress, Grid, Card, CardContent,
  Tooltip, Snackbar, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon,
  Edit as EditIcon, CalendarToday as CalendarIcon, LocationOn as LocationIcon, Agriculture as AgricultureIcon,
  MoreVert as MoreVertIcon, CheckCircle as CheckCircleIcon,
  Warning as WarningIcon, Timer as TimerIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { auctionService } from '../../services/auctionService';
import AuctionFormModal from '../AuctionFormModal';
import ViewDetailsModal from '../ViewDetailsModal';
import PlaceBidModal from '../PlaceBidModal';

const AuctionDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidModalAuction, setBidModalAuction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAuctionForMenu, setSelectedAuctionForMenu] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    ended: 0,
    upcoming: 0,
    totalBids: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAuctions();
    }
  }, [isAuthenticated]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionService.getUserAuctions();
      setAuctions(response.data || []);
      
      // Calculate statistics
      calculateStats(response.data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (auctionList) => {
    const now = new Date();
    const newStats = {
      total: auctionList.length,
      active: 0,
      ended: 0,
      upcoming: 0,
      totalBids: 0,
      totalViews: 0
    };

    auctionList.forEach(auction => {
      const startTime = new Date(auction.startTime);
      const endTime = new Date(auction.endTime);
      
      if (now < startTime) {
        newStats.upcoming++;
      } else if (now >= startTime && now <= endTime) {
        newStats.active++;
      } else {
        newStats.ended++;
      }
      
      newStats.totalBids += auction.totalBids || 0;
      newStats.totalViews += auction.views || 0;
    });

    setStats(newStats);
  };

  const handleCreateAuction = async (auctionData) => {
    try {
      setLoading(true);
      await auctionService.createAuction(auctionData);
      setSnackbar({
        open: true,
        message: 'Auction created successfully!',
        severity: 'success'
      });
      setShowFormModal(false);
      fetchAuctions(); // Refresh the list
    } catch (error) {
      console.error('Error creating auction:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create auction',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuction = async (auctionData) => {
    try {
      setLoading(true);
      await auctionService.updateAuction(selectedAuction._id, auctionData);
      setSnackbar({
        open: true,
        message: 'Auction updated successfully!',
        severity: 'success'
      });
      setShowFormModal(false);
      setSelectedAuction(null);
      fetchAuctions(); // Refresh the list
    } catch (error) {
      console.error('Error updating auction:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update auction',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      await auctionService.deleteAuction(auctionId);
      setSnackbar({
        open: true,
        message: 'Auction deleted successfully!',
        severity: 'success'
      });
      fetchAuctions(); // Refresh the list
    } catch (error) {
      console.error('Error deleting auction:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete auction',
        severity: 'error'
      });
    }
  };

  const handlePlaceBid = (auction) => {
    setBidModalAuction(auction);
    setShowBidModal(true);
  };

  const handleBidPlaced = (result) => {
    setSnackbar({
      open: true,
      message: 'Bid placed successfully!',
      severity: 'success'
    });
    fetchAuctions(); // Refresh to update current bid
  };

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setShowViewDetails(true);
  };

  const handleEditAuction = (auction) => {
    setSelectedAuction(auction);
    setFormMode('edit');
    setShowFormModal(true);
  };

  const handleCreateNewAuction = () => {
    setSelectedAuction(null);
    setFormMode('create');
    setShowFormModal(true);
  };

  const handleFormSubmit = (auctionData) => {
    // If modal already called the API and passed back the API response, don't submit again
    if (auctionData && (auctionData.success === true || auctionData.data)) {
      setSnackbar({ open: true, message: formMode === 'create' ? 'Auction created successfully!' : 'Auction updated successfully!', severity: 'success' });
      setShowFormModal(false);
      setSelectedAuction(null);
      fetchAuctions();
      return Promise.resolve();
    }

    if (formMode === 'create') {
      return handleCreateAuction(auctionData);
    } else {
      return handleUpdateAuction(auctionData);
    }
  };

  const handleMenuOpen = (event, auction) => {
    setAnchorEl(event.currentTarget);
    setSelectedAuctionForMenu(auction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAuctionForMenu(null);
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const startTime = new Date(auction.startTime);
    const endTime = new Date(auction.endTime);
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'info', icon: <TimerIcon /> };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'success', icon: <CheckCircleIcon /> };
    } else {
      return { status: 'Ended', color: 'error', icon: <WarningIcon /> };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          Please login to access your auction dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          My Auctions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNewAuction}
          sx={{ px: 3 }}
        >
          List New Auction
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Auctions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {stats.upcoming}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                {stats.ended}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {stats.totalBids}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bids
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" fontWeight={700}>
                {stats.totalViews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Auctions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Auction</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Crop</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Current Bid</strong></TableCell>
                <TableCell><strong>End Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : auctions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No auctions found. Create your first auction to get started!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                auctions.map((auction) => {
                  const status = getAuctionStatus(auction);
                  return (
                    <TableRow key={auction._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {auction.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {auction.area} acres • {auction.landType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {auction.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AgricultureIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {auction.cropType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={status.icon}
                          label={status.status}
                          color={status.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(auction.currentBid || auction.startingBid)}
                        </Typography>
                        {auction.totalBids > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {auction.totalBids} bids
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(auction.endTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, auction)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Unified Auction Form Modal */}
      <AuctionFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedAuction(null);
        }}
        mode={formMode}
        auction={selectedAuction}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        open={showViewDetails}
        onClose={() => {
          setShowViewDetails(false);
          setSelectedAuction(null);
        }}
        auction={selectedAuction}
      />

      {/* Place Bid Modal */}
      {bidModalAuction && (
        <PlaceBidModal
          open={showBidModal}
          onClose={() => setShowBidModal(false)}
          auctionId={bidModalAuction._id}
          currentBid={bidModalAuction.currentBid || bidModalAuction.startingBid}
          minIncrement={bidModalAuction.bidIncrement}
          auctionTitle={bidModalAuction.title}
          onBidPlaced={handleBidPlaced}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewDetails(selectedAuctionForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleEditAuction(selectedAuctionForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Auction</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            handleDeleteAuction(selectedAuctionForMenu._id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Auction</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuctionDashboard; 