import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Button, Card, CardContent, CardMedia,
  IconButton, CircularProgress, Divider, Stack
} from '@mui/material';
import {
  Delete, Add, Remove, ShoppingCartCheckout, ArrowBack, ShoppingCart
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { CartProvider, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

const Cart = () => {
  const {
    items, summary, loading, error, updateCartItem,
    removeFromCart, clearCart, loadCartSummary
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGeo(coords);
          loadCartSummary(coords.lat, coords.lng);
        },
        () => {
          loadCartSummary();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      loadCartSummary();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f9f9f9">
        <Box textAlign="center">
          <Typography variant="h4" fontWeight="bold" gutterBottom>Please Sign In</Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>You need to be signed in to view your cart.</Typography>
          <Button variant="contained" color="success" component={Link} to="/signin">Sign In</Button>
        </Box>
      </Box>
    );
  }

  const getAppropriateTier = (product, qty) => {
    if (!product.price || !Array.isArray(product.price)) return 0;
    const sortedTiers = [...product.price].sort((a, b) => a.min - b.min);

    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      if (qty >= tier.min && (tier.max === undefined || qty <= tier.max)) {
        return product.price.findIndex(t => t.min === tier.min && t.max === tier.max);
      }
    }
    if (qty < sortedTiers[0].min) {
      return product.price.findIndex(t => t.min === sortedTiers[0].min);
    }
    return product.price.findIndex(t => t.min === sortedTiers[sortedTiers.length - 1].min);
  };

  const handleQuantityChange = async (productId, newQuantity, selectedTier) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity, selectedTier);
    } catch (err) {
      console.error('Quantity update error:', err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const handleQuantityIncrement = (e, item) => {
    e.preventDefault();
    const newQty = item.quantity + 1;
    const newTier = getAppropriateTier(item.product, newQty);
    handleQuantityChange(item.product._id, newQty, newTier);
  };

  const handleQuantityDecrement = (e, item) => {
    e.preventDefault();
    const newQty = item.quantity - 1;
    if (newQty < 1) return;
    const newTier = getAppropriateTier(item.product, newQty);
    handleQuantityChange(item.product._id, newQty, newTier);
  };

  const calculateItemPrice = (item) => {
    const tier = item.product.price[item.selectedTier];
    return tier ? tier.price * item.quantity : 0;
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Clear cart error:', err);
      }
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    // You can add a success notification here
  };

  if (loading) {
    return (
      <Box minHeight="80vh" display="flex" alignItems="center" justifyContent="center" marginTop={10}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5" color="error">Error</Typography>
        <Typography>{error}</Typography>
        <Button variant="contained" color="success" onClick={() => window.location.reload()}>Try Again</Button>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box minHeight="90vh" textAlign="center" py={10}>
        <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>Looks like you haven't added anything yet.</Typography>
        <Button variant="contained" color="success" component={Link} to="/marketplace" startIcon={<ArrowBack />}>
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box px={{ xs: 2, md: 4 }} py={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">Shopping Cart</Typography>
            <Button color="error" onClick={handleClearCart} startIcon={<Delete />}>
              Clear Cart
            </Button>
          </Stack>

          {items.map((item) => (
            <Card key={item.product._id} variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ display: 'flex', gap: 3 }}>
                <CardMedia
                  component="img"
                  image={item.product.image}
                  alt={item.product.name}
                  sx={{ width: 100, height: 100, borderRadius: 2 }}
                />
                <Box flexGrow={1}>
                  <Typography variant="h6">{item.product.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{item.product.category}</Typography>

                  {item.product.price?.length > 1 && (
                    <Box mt={1} p={1} bgcolor="blue.50" borderRadius={1}>
                      <Typography variant="body2" color="primary">
                        Tier: {item.product.price[item.selectedTier]?.min}-{item.product.price[item.selectedTier]?.max || '∞'} units
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: Rs.{item.product.price[item.selectedTier]?.price} per unit
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box display="flex" flexDirection="column" alignItems="flex-end" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      size="small"
                      disabled={item.quantity <= 1}
                      onClick={(e) => handleQuantityDecrement(e, item)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="body1" width={30} textAlign="center">
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleQuantityIncrement(e, item)}
                    >
                      <Add />
                    </IconButton>
                  </Stack>

                  <Typography variant="h6" color="success.main" mt={2}>
                    Rs.{calculateItemPrice(item).toFixed(2)}
                  </Typography>
                  <Button size="small" color="error" onClick={() => handleRemoveItem(item.product._id)} startIcon={<Delete />}>
                    Remove
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ position: 'sticky', top: 16 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Order Summary</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="textSecondary">Items ({summary.totalItems})</Typography>
                  <Typography>Rs.{summary.totalPrice.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="textSecondary">Delivery</Typography>
                  <Typography color="textSecondary">
                    {summary.deliveryCharges != null ? `Rs.${Number(summary.deliveryCharges).toFixed(2)}` : '—'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="success.main">
                    Rs.{(summary.grandTotal != null ? Number(summary.grandTotal) : Number(summary.totalPrice)).toFixed(2)}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCartCheckout />}
                  onClick={() => setCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  component={Link}
                  to="/marketplace"
                  color="success"
                  fullWidth
                >
                  Continue Shopping
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
<CartProvider>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        />
        </CartProvider>
    </Box>
  );
};

export default Cart;