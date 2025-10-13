import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { productService, imageService } from '../services/productService';

// Categories are now free text input by seller

const productTypes = [
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'emandi', label: 'E-Mandi' },
  { value: 'auction', label: 'Auction' }
];

const AddProductModal = ({ open, onClose, onProductAdded, productType = 'marketplace' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: [{ min: 0, max: null, price: 0 }],
    stock: 0,
    deliveryCharges: [{ min: 0, max: null, price: 0 }],
    type: productType,
    image: '',
    // Auction specific fields
    auctionEndTime: '',
    startingBid: 0,
    minIncrement: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...formData.price];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData(prev => ({ ...prev, price: newPrices }));
  };

  const handleDeliveryChange = (index, field, value) => {
    const newDelivery = [...formData.deliveryCharges];
    newDelivery[index] = { ...newDelivery[index], [field]: value };
    setFormData(prev => ({ ...prev, deliveryCharges: newDelivery }));
  };

  const addPriceTier = () => {
    setFormData(prev => ({
      ...prev,
      price: [...prev.price, { min: 0, max: null, price: 0 }]
    }));
  };

  const removePriceTier = (index) => {
    if (formData.price.length > 1) {
      const newPrices = formData.price.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, price: newPrices }));
    }
  };

  const addDeliveryTier = () => {
    setFormData(prev => ({
      ...prev,
      deliveryCharges: [...prev.deliveryCharges, { min: 0, max: null, price: 0 }]
    }));
  };

  const removeDeliveryTier = (index) => {
    if (formData.deliveryCharges.length > 1) {
      const newDelivery = formData.deliveryCharges.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, deliveryCharges: newDelivery }));
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);
    setError('');

    try {
      const imageUrl = await imageService.uploadImage(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.image) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productData = {
        ...formData,
        price: formData.price.map(p => ({
          min: parseFloat(p.min),
          max: p.max ? parseFloat(p.max) : null,
          price: parseFloat(p.price)
        })),
        deliveryCharges: formData.deliveryCharges.map(d => ({
          min: parseFloat(d.min),
          max: d.max ? parseFloat(d.max) : null,
          price: parseFloat(d.price)
        })),
        stock: parseFloat(formData.stock),
        startingBid: parseFloat(formData.startingBid),
        minIncrement: parseFloat(formData.minIncrement)
      };

      // Add auction specific fields if type is auction
      if (formData.type === 'auction' && formData.auctionEndTime) {
        productData.auctionEndTime = new Date(formData.auctionEndTime).toISOString();
      }

      const createdProduct = await productService.createProduct(productData);
      
      if (onProductAdded) {
        onProductAdded(createdProduct);
      }

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        category: '',
        price: [{ min: 0, max: null, price: 0 }],
        stock: 0,
        deliveryCharges: [{ min: 0, max: null, price: 0 }],
        type: productType,
        image: '',
        auctionEndTime: '',
        startingBid: 0,
        minIncrement: 1
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: [{ min: 0, max: null, price: 0 }],
        stock: 0,
        deliveryCharges: [{ min: 0, max: null, price: 0 }],
        type: productType,
        image: '',
        auctionEndTime: '',
        startingBid: 0,
        minIncrement: 1
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
          Add New Product
        </Typography>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Product Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Category *"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Enter product category"
              required
            />
          </Grid>

          {/* Product Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={formData.type}
                label="Product Type"
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {productTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Stock */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Stock *"
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              required
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your product in detail..."
            />
          </Grid>

          {/* Price Tiers */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Price Tiers
            </Typography>
            {formData.price.map((tier, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Min Quantity"
                  type="number"
                  value={tier.min}
                  onChange={(e) => handlePriceChange(index, 'min', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Max Quantity (optional)"
                  type="number"
                  value={tier.max || ''}
                  onChange={(e) => handlePriceChange(index, 'max', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={tier.price}
                  onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                  sx={{ flex: 1 }}
                />
                {formData.price.length > 1 && (
                  <IconButton 
                    onClick={() => removePriceTier(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button onClick={addPriceTier} variant="outlined" size="small">
              Add Price Tier
            </Button>
          </Grid>

          {/* Delivery Charges */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Delivery Charges
            </Typography>
            {formData.deliveryCharges.map((tier, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Min Distance"
                  type="number"
                  value={tier.min}
                  onChange={(e) => handleDeliveryChange(index, 'min', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Max Distance (optional)"
                  type="number"
                  value={tier.max || ''}
                  onChange={(e) => handleDeliveryChange(index, 'max', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Delivery Charge"
                  type="number"
                  value={tier.price}
                  onChange={(e) => handleDeliveryChange(index, 'price', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                  sx={{ flex: 1 }}
                />
                {formData.deliveryCharges.length > 1 && (
                  <IconButton 
                    onClick={() => removeDeliveryTier(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button onClick={addDeliveryTier} variant="outlined" size="small">
              Add Delivery Tier
            </Button>
          </Grid>

          {/* Auction Specific Fields */}
          {formData.type === 'auction' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auction End Time"
                  type="datetime-local"
                  value={formData.auctionEndTime}
                  onChange={(e) => handleInputChange('auctionEndTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Starting Bid"
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => handleInputChange('startingBid', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Increment"
                  type="number"
                  value={formData.minIncrement}
                  onChange={(e) => handleInputChange('minIncrement', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                />
              </Grid>
            </>
          )}

          {/* Image Upload */}
          <Grid item xs={12}>
            <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
              <label htmlFor="image-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  disabled={imageUploading}
                  sx={{ mb: 2 }}
                >
                  {imageUploading ? 'Uploading...' : 'Upload Product Image'}
                </Button>
              </label>
              <Typography variant="body2" color="textSecondary">
                Upload product image (max 5MB)
              </Typography>
              {formData.image && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={formData.image} 
                    alt="Product" 
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          disabled={loading || !formData.name || !formData.category || !formData.image}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#45a049' }
          }}
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductModal; 