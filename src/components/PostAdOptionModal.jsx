import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Store as StoreIcon,
  Gavel as GavelIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import marketplace from '../assets/marketplace.png';
import emandi from '../assets/emandi.png';
import auction from '../assets/auction.png';

const PostAdOptionModal = ({ open, onClose, onOptionSelect }) => {
  const options = [
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Sell your products directly to buyers with fixed pricing and inventory management.',
      icon: <StoreIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      image: marketplace,
      color: '#4CAF50'
    },
    {
      id: 'emandi',
      title: 'E-Mandi',
      description: 'Connect with wholesale buyers and traders in a digital mandi environment.',
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      image: emandi,
      color: '#FF9800'
    },
    {
      id: 'auction',
      title: 'Auction',
      description: 'Create competitive auctions for your products with bidding and time limits.',
      icon: <GavelIcon sx={{ fontSize: 40, color: '#E91E63' }} />,
      image: auction,
      color: '#E91E63'
    }
  ];

  const handleOptionClick = (optionId) => {
    onOptionSelect(optionId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Choose Post Type
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Select the type of post you want to create. Each option has different features and requirements.
        </Typography>

        <Grid container spacing={3}>
          {options.map((option) => (
            <Grid item xs={12} md={4} key={option.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: option.color
                  }
                }}
                onClick={() => handleOptionClick(option.id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={option.image}
                  alt={option.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ mb: 1 }}>
                    {option.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {option.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostAdOptionModal;
