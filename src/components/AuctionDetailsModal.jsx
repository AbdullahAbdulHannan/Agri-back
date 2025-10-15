import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Divider,
  Card,
  CardMedia,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Agriculture as AgricultureIcon,
  Timer as TimerIcon,
  Gavel as GavelIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  WaterDrop as WaterIcon,
  Grass as GrassIcon,
  Crop as CropIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { getImageUrl, getDocumentUrl } from '../utils/fileUtils';

const AuctionDetailsModal = ({ open, onClose, auction }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!auction) return null;

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

  // Get auction status
  const getAuctionStatus = () => {
    if (!auction?.endTime || !auction?.startTime) return { status: 'unknown', color: 'default' };
    
    const now = new Date().getTime();
    const startTime = new Date(auction.endTime).toISOString().replace('T', ' ').replace('Z', '').getTime();
    const endTime = new Date(auction.endTime).toISOString().replace('T', ' ').replace('Z', '').getTime();
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'info' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'success' };
    } else {
      return { status: 'Ended', color: 'error' };
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
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

  const auctionStatus = getAuctionStatus();
  const timeRemaining = getTimeRemaining();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            {auction.title}
          </Typography>
          <Chip
            label={auctionStatus.status}
            color={auctionStatus.color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {auction.verified && (
            <Chip
              icon={<VerifiedIcon />}
              label="Verified"
              color="success"
              size="small"
            />
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left Column - Images and Basic Info */}
          <Grid item xs={12} md={6}>
            {/* Image Gallery */}
            {auction.images && auction.images.length > 0 ? (
              <Box sx={{ mb: 3 }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="300"
                    image={getImageUrl(auction.images[selectedImage])}
                    alt={`${auction.title} - Image ${selectedImage + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
                
                {/* Image Thumbnails */}
                {auction.images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
                    {auction.images.map((image, index) => {
                      const imageUrl = getImageUrl(image);
                      console.log(`AuctionDetailsModal - Image ${index}:`, image, '→', imageUrl);
                      return (
                        <Card
                          key={index}
                          sx={{
                            width: 80,
                            height: 60,
                            cursor: 'pointer',
                            border: selectedImage === index ? 2 : 1,
                            borderColor: selectedImage === index ? 'primary.main' : 'divider'
                          }}
                          onClick={() => handleImageChange(index)}
                        >
                          <CardMedia
                            component="img"
                            height="60"
                            image={imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                height: 300, 
                bgcolor: 'grey.100', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 1,
                mb: 3
              }}>
                <Typography color="text.secondary">No images available</Typography>
              </Box>
            )}

            {/* Basic Information */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Basic Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={auction.location}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AgricultureIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Crop Type" 
                    secondary={auction.cropType}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <GrassIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Land Type" 
                    secondary={auction.landType}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Lease Type" 
                    secondary={auction.leaseType}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CropIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Area" 
                    secondary={`${auction.area} acres`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Right Column - Detailed Information */}
          <Grid item xs={12} md={6}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Auction Details" />
              <Tab label="Farm Details" />
              <Tab label="Documents" />
            </Tabs>

            {/* Auction Details Tab */}
            {activeTab === 0 && (
              <Box>
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Bidding Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Show winner info if auction has ended */}
                    {auctionStatus.status === 'Ended' && auction.winner && (
                      <Grid item xs={12}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'success.light',
                            background: 'linear-gradient(45deg, #e8f5e9 30%, #f1f8e9 90%)',
                            borderRadius: 2,
                            mb: 2
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                              <GavelIcon color="success" fontSize="large" />
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600} color="success.dark">
                                Auction Won By
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="success.dark">
                                {auction.winner.name || 'Anonymous'}
                              </Typography>
                              <Typography variant="body2" color="success.dark">
                                Winning Bid: {formatCurrency(auction.winner.amount || auction.currentBid)}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {auctionStatus.status === 'Ended' ? 'Winning Bid' : 'Current Bid'}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight={700} 
                        color={auctionStatus.status === 'Ended' ? 'success.main' : 'success.main'}
                      >
                        {formatCurrency(auction.currentBid || auction.startingBid)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Starting Bid
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {formatCurrency(auction.startingBid)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bid Increment
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(auction.bidIncrement)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Bids
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {auction.totalBids || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Auction Timeline
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Start Time" 
                        secondary={new Date(auction.startTime).toISOString().replace('T', ' ').replace('Z', '')}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="End Time" 
                        secondary={new Date(auction.endTime).toISOString().replace('T', ' ').replace('Z', '')}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <VisibilityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Views" 
                        secondary={auction.views || 0}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            )}

            {/* Farm Details Tab */}
            {activeTab === 1 && (
              <Box>
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Farm Specifications
                  </Typography>
                  
                  <List dense>
                    {auction.plantAge && (
                      <ListItem>
                        <ListItemIcon>
                          <CropIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Plant Age" 
                          secondary={`${auction.plantAge} months`}
                        />
                      </ListItem>
                    )}
                    
                    <ListItem>
                      <ListItemIcon>
                        <WaterIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Water Source" 
                        secondary={auction.waterSource}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <GrassIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Soil Type" 
                        secondary={auction.soilType}
                      />
                    </ListItem>
                    
                    {auction.yield && (
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Expected Yield" 
                          secondary={auction.yield}
                        />
                      </ListItem>
                    )}
                    
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Lease Duration" 
                        secondary={`${auction.leaseDuration} years`}
                      />
                    </ListItem>
                    
                    {auction.paymentTerms && (
                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Payment Terms" 
                          secondary={auction.paymentTerms}
                        />
                      </ListItem>
                    )}
                    
                    {auction.securityDeposit && (
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Security Deposit" 
                          secondary={formatCurrency(auction.securityDeposit)}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Box>
            )}

            {/* Documents Tab */}
            {activeTab === 2 && (
              <Box>
                {auction.documents && auction.documents.length > 0 ? (
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Documents ({auction.documents.length})
                    </Typography>
                    
                    <List>
                      {auction.documents.map((document, index) => (
                        <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <ListItemIcon>
                            <DocumentIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`Document ${index + 1}`}
                            // secondary={document.split('/').pop()}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            href={getDocumentUrl(document)}
                            target="_blank"
                          >
                            View
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                ) : (
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Documents
                    </Typography>
                    <Typography color="text.secondary">
                      No documents available for this auction.
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<GavelIcon />}
          disabled={auctionStatus.status !== 'Active'}
        >
          Place Bid
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuctionDetailsModal; 