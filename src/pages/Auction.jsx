import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Snackbar, Alert, CircularProgress, Container } from '@mui/material';
import AuctionCard from '../components/AuctionCard';
import PlaceBidModal from '../components/PlaceBidModal';
import AuctionDetailsModal from '../components/AuctionDetailsModal';
import { auctionService } from '../services/auctionService';

const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch auctions from API
  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await auctionService.getAllAuctions();
      setAuctions(response.data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to fetch auctions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = (auction) => {
    setSelectedAuction(auction);
    setShowBidModal(true);
  };

  const handleBidModalClose = () => {
    setShowBidModal(false);
    setSelectedAuction(null);
  };

  const handleBidPlaced = (result) => {
    console.log('Bid placed successfully:', result);
    setSnackbar({
      open: true,
      message: 'Bid placed successfully!',
      severity: 'success'
    });
    // Refresh auctions to get updated bid data
    fetchAuctions();
  };

  const handleAddToWatchlist = (auctionId, isAdding) => {
    console.log(`${isAdding ? 'Added' : 'Removed'} from watchlist:`, auctionId);
    setSnackbar({
      open: true,
      message: `${isAdding ? 'Added' : 'Removed'} from watchlist!`,
      severity: 'success'
    });
  };

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setShowDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setSelectedAuction(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No auctions available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new auctions or create your own!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Auctions
      </Typography>
      
      {auctions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No auctions available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new auctions or create your own!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {auctions.map((auction) => (
            <Grid item xs={12} sm={6} md={4} key={auction._id}>
              <AuctionCard
                auction={auction}
                onPlaceBid={handlePlaceBid}
                onAddToWatchlist={handleAddToWatchlist}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Place Bid Modal */}
      {selectedAuction && (
        <PlaceBidModal
          open={showBidModal}
          onClose={handleBidModalClose}
          auctionId={selectedAuction._id}
          currentBid={selectedAuction.currentBid || selectedAuction.startingBid}
          minIncrement={selectedAuction.bidIncrement}
          auctionTitle={selectedAuction.title}
          onBidPlaced={handleBidPlaced}
        />
      )}

      {/* Auction Details Modal */}
      {selectedAuction && (
        <AuctionDetailsModal
          open={showDetailsModal}
          onClose={handleDetailsModalClose}
          auction={selectedAuction}
        />
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Auction; 