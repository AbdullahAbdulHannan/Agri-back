import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const AddToCartButton = ({ product, className = '' }) => {
  const { addToCart, updateCartItem, isInCart, getCartItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  const isProductInCart = isInCart(product._id);
  const cartItem = getCartItem(product._id);

  // Initialize quantity with cart item quantity if already in cart
  useEffect(() => {
    if (isProductInCart && cartItem) {
      setQuantity(cartItem.quantity);
      setSelectedTier(cartItem.selectedTier);
    }
  }, [isProductInCart, cartItem]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to add items to cart');
      return;
    }

    if (product.type === 'emandi' && quantity < 5) {
      alert('Minimum order quantity for e-mandi products is 5kg');
      return;
    }

    if (product.stock < quantity) {
      alert('Insufficient stock available');
      return;
    }

    setLoading(true);
    try {
      if (isProductInCart) {
        // Update existing cart item
        await updateCartItem(product._id, quantity, selectedTier);
      } else {
        // Add new item to cart
        await addToCart(product._id, quantity, selectedTier);
      }
      setShowQuantitySelector(false);
      setQuantity(1);
    } catch (error) {
      alert(error.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const minQuantity =1;
    if (newQuantity >= minQuantity && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const getPriceForTier = (tierIndex) => {
    if (product.price?.[tierIndex]) {
      return product.price[tierIndex].price;
    }
    return 0;
  };

  const getTierDescription = (tierIndex) => {
    const tier = product.price?.[tierIndex];
    return tier ? `${tier.min}-${tier.max || '∞'} units` : '';
  };

  const getAppropriateTier = (qty) => {
    if (!product.price || !Array.isArray(product.price)) return 0;

    const sortedTiers = [...product.price].sort((a, b) => a.min - b.min);

    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      if (qty >= tier.min && (tier.max === undefined || qty <= tier.max)) {
        return product.price.findIndex(t => t.min === tier.min && t.max === tier.max);
      }
    }

    if (qty < sortedTiers[0].min) {
      return product.price.findIndex(t => t.min === sortedTiers[0].min && t.max === sortedTiers[0].max);
    }

    return product.price.findIndex(t => t.min === sortedTiers.at(-1).min && t.max === sortedTiers.at(-1).max);
  };

  useEffect(() => {
    const appropriateTier = getAppropriateTier(quantity);
    setSelectedTier(appropriateTier);
  }, [quantity, product.price]);

  if (isProductInCart && !showQuantitySelector) {
    return (
      <Box display="flex" flexDirection="column" gap={2} className={className}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography color="success.main" fontWeight="500">
            ✓ In Cart ({cartItem.quantity})
          </Typography>
        </Box>
        
        {/* Show current tier info if available */}
        {product.price?.length > 1 && (
          <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
            <Typography fontSize="0.9rem" color="info.dark">
              Current Tier: {getTierDescription(cartItem.selectedTier)} - Rs.{getPriceForTier(cartItem.selectedTier)} per unit
            </Typography>
          </Box>
        )}
        
        <Button
          variant="outlined"
          color="success"
          size="large"
          onClick={() => setShowQuantitySelector(true)}
          sx={{
            py: 2,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Update Quantity
        </Button>
      </Box>
    );
  }

     return (
     <Box className={className}>
       {!showQuantitySelector ? (
         <Button
           fullWidth
           variant="contained"
           color="success"
           size="large"
           onClick={() => setShowQuantitySelector(true)}
           disabled={loading || product.stock === 0}
           sx={{
             py: 2,
             fontSize: '1.1rem',
             fontWeight: 600,
             textTransform: 'none',
             boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
             '&:hover': {
               boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
               transform: 'translateY(-1px)'
             },
             transition: 'all 0.3s ease'
           }}
         >
           {loading ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
         </Button>
       ) : (
                 <Box display="flex" flexDirection="column" gap={3}>
           {/* Quantity Selector */}
           <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
             <Typography fontSize="1rem" fontWeight="600">Quantity:</Typography>
             <Box display="flex" alignItems="center" gap={2}>
               <IconButton
                 size="medium"
                 onClick={() => handleQuantityChange(quantity - 1)}
                 disabled={quantity <= (product.type === 'emandi' ? 5 : 1)}
                 sx={{
                   border: '2px solid',
                   borderColor: 'grey.300',
                   '&:hover': { borderColor: 'success.main', bgcolor: 'success.50' }
                 }}
               >
                 <RemoveIcon />
               </IconButton>
               <Typography fontWeight="700" fontSize="1.2rem" minWidth="40px" textAlign="center">
                 {quantity}
               </Typography>
               <IconButton
                 size="medium"
                 onClick={() => handleQuantityChange(quantity + 1)}
                 disabled={quantity >= product.stock}
                 sx={{
                   border: '2px solid',
                   borderColor: 'grey.300',
                   '&:hover': { borderColor: 'success.main', bgcolor: 'success.50' }
                 }}
               >
                 <AddIcon />
               </IconButton>
             </Box>
           </Box>

           {/* Tier Info */}
           {product.price?.length > 1 && (
             <Paper sx={{ p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }} elevation={0}>
               <Typography fontSize="1rem" color="info.dark" fontWeight="500">
                 <strong>Selected Tier:</strong> {getTierDescription(selectedTier)} - Rs.{getPriceForTier(selectedTier)} per unit
               </Typography>
             </Paper>
           )}

           {/* Price Display */}
           <Box sx={{ p: 3, bgcolor: 'success.50', borderRadius: 2, textAlign: 'center' }}>
             <Typography fontWeight="700" fontSize="1.3rem" color="success.dark">
               Total: Rs.{(getPriceForTier(selectedTier) * quantity).toFixed(2)}
             </Typography>
           </Box>

           {/* Action Buttons */}
           <Box display="flex" gap={2}>
                           <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={handleAddToCart}
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (isProductInCart ? 'Updating...' : 'Adding...') : (isProductInCart ? 'Update Cart' : 'Add to Cart')}
              </Button>
             <Button
               fullWidth
               variant="outlined"
               size="large"
               onClick={() => setShowQuantitySelector(false)}
               sx={{
                 py: 2,
                 fontSize: '1rem',
                 fontWeight: 500,
                 textTransform: 'none'
               }}
             >
               Cancel
             </Button>
           </Box>
         </Box>
      )}
    </Box>
  );
};

export default AddToCartButton;
